const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const saltRounds = 10;
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'Haslo123',  // powinno być długie i ukryte w .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // ustaw na true tylko przy HTTPS
}));

// Serve static files from the current directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Laczenie z baza danychy
const db = new sqlite3.Database('users.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Tworzenie tabeli jesli brak
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        birthdate TEXT,
        height REAL,
        weight REAL,
        gender TEXT CHECK (gender IN ('female', 'male', 'nonbinary')),
        activityLevel TEXT CHECK (activityLevel IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
        goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain'))
    )
    `);

//db.run(`DELETE FROM users WHERE username = ?`, ['Admin']);
//db.run(`UPDATE users SET role = ? WHERE username = ?`, ['admin', 'Admin']);

// Rejestracja
app.post('/api/register', (req, res) => {
    const { username: rawUsername, password: rawPassword, confirmPassword: rawConfirmPassword,
        birthdate: rawBirthdate, height: height, weight: weight, gender: rawGender, activityLevel: rawActivityLevel, goal: rawGoal } = req.body;

    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const username = rawUsername ? rawUsername.trim() : '';
    const password = rawPassword ? rawPassword.trim() : '';
    const confirmPassword = rawConfirmPassword ? rawConfirmPassword.trim() : '';
    const birthdate = rawBirthdate ? rawBirthdate.trim() : '';
    const gender = rawGender ? rawGender.trim() : '';
    const activityLevel = rawActivityLevel ? rawActivityLevel.trim() : '';
    const goal = rawGoal ? rawGoal.trim() : '';

    // Sprawdzenie czy dane nie sa puste
    if (username === '' || password === '' || confirmPassword === '') {
        return res.sendStatus(400);
    }

    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
        return res.sendStatus(400);
    }

    // Walidacja długości hasła
    if (password.length < 8) {
        return res.sendStatus(400);
    }

    // Walidacja dużej litery
    if (!/[A-Z]/.test(password)) {
        return res.sendStatus(400);
    }

    // Walidacja cyfry
    if (!/\d/.test(password)) {
        return res.sendStatus(400);
    }

    db.get(`SELECT * FROM users where username = ?`, [username], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (row) return res.sendStatus(409); // powtorzone dane

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).send(err.message);

            if (birthdate !== '') {
                const today = new Date().toISOString().split('T')[0];
                if (birthdate > today) return res.sendStatus(400);
                else birthdateToSave = birthdate;
            }
            else birthdateToSave = null;

            if (height)
                if (isNaN(height) || height <= 0) return res.sendStatus(400);
                else heightToSave = height;
            else heightToSave = null;

            if (weight)
                if (isNaN(weight) || weight <= 0) return res.sendStatus(400);
                else weightToSave = weight;
            else weightToSave = null;

            if (gender !== '')
                if (!["female", "male", "nonbinary"].includes(gender)) return res.sendStatus(400);
                else genderToSave = gender;
            else genderToSave = null;

            if (activityLevel !== '')
                if (!["sedentary", "light", "moderate", "active", "very_active"].includes(activityLevel)) return res.sendStatus(400);
                else activityLevelToSave = activityLevel;
            else activityLevelToSave = null;

            if (goal !== '')
                if (!["lose", "maintain", "gain"].includes(goal)) return res.sendStatus(400);
                else goalToSave = goal;
            else goalToSave = null;

            db.run(`INSERT INTO users (username, password, role, birthdate, height, weight, gender, activityLevel, goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [username, hashedPassword, 'user', birthdateToSave, heightToSave, weightToSave, genderToSave, activityLevelToSave, goalToSave], (err) => {
                    if (err) return res.status(500).send(err.message);
                    return res.sendStatus(201); // zarejestrowano
                });
        });
    });
});

// Logowanie
app.post('/api/login', (req, res) => {
    const { username: rawUsername, password: rawPassword } = req.body;

    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const username = rawUsername ? rawUsername.trim() : '';
    const password = rawPassword ? rawPassword.trim() : '';

    // Sprawdzenie czy dane nie sa puste
    if (username === '' || password === '') {
        return res.sendStatus(400);
    }

    db.get(`SELECT * FROM users where username = ?`, [username], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user) return res.sendStatus(401); // brak uzytkownika

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (!result) return res.sendStatus(401); // nieprawidlowe haslo

            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                birthdate: user.birthdate,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                goal: user.goal
            };
            return res.sendStatus(201); // zalogowano
        });
    });
});

// Zwraca zalogowanego uzytkownika
app.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user); // zalogowany
    } else {
        res.sendStatus(401);  // nie zalogowany
    }
});

// Wylogowanie
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.send('Wylogowano');
    });
});

// Zwraca wszystkich uzytkownikow
app.get('/api/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.send(rows);
    });
});

// Zmiana nazwy uzytkownika
app.put('/api/user/username', (req, res) => {
    const { newUsername: rawNewUsername } = req.body;

    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const newUsername = rawNewUsername ? rawNewUsername.trim() : '';

    // Sprawdzenie czy dane nie sa puste
    if (newUsername === '') {
        return res.sendStatus(400);
    }

    if (!req.session.user) return res.sendStatus(401);  // nie zalogowany

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.sendStatus(401); // brak uzytkownika

        db.get(`SELECT * FROM users WHERE username = ?`, [newUsername], (err, row2) => {
            if (err) return res.status(500).send(err.message);

            if (row2) return res.sendStatus(409); // powtorzone dane

            db.run(`UPDATE users SET username = ? WHERE id = ?`, [newUsername, req.session.user.id], (err) => {
                if (err) return res.status(500).send(err.message);

                req.session.user = {
                    id: row.id,
                    username: newUsername,
                    role: row.role,
                    birthdate: row.birthdate
                };
                return res.sendStatus(201);
            });
        });
    });
});

// Zmiana hasla
app.put('/api/user/password', (req, res) => {
    const { currentPassword: rawCurrentPassword, newPassword: rawNewPassword } = req.body;

    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const currentPassword = rawCurrentPassword ? rawCurrentPassword.trim() : '';
    const newPassword = rawNewPassword ? rawNewPassword.trim() : '';

    // Sprawdzenie czy dane nie sa puste
    if (currentPassword === '' || newPassword === '') {
        return res.sendStatus(400);
    }

    // Walidacja długości hasła
    if (newPassword.length < 8) {
        return res.sendStatus(400);
    }

    // Walidacja dużej litery
    if (!/[A-Z]/.test(newPassword)) {
        return res.sendStatus(400);
    }

    // Walidacja cyfry
    if (!/\d/.test(newPassword)) {
        return res.sendStatus(400);
    }

    if (!req.session.user) return res.sendStatus(401);  // nie zalogowany

    db.get(`SELECT * FROM users where id = ?`, [req.session.user.id], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user) return res.sendStatus(401); // brak uzytkownika

        bcrypt.compare(currentPassword, user.password, (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (!result) return res.sendStatus(403); // nieprawidlowe haslo

            bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
                if (err) return res.status(500).send(err.message);

                db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, req.session.user.id], (err) => {
                    if (err) return res.status(500).send(err.message);
                    return res.sendStatus(201); // zmieniono haslo
                });
            });
        });
    });
});

// Usuwanie uzytkownika
app.delete('/api/user/:id', requireRole('admin'), (req, res) => {
    const id = req.params.id;

    db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (!row) return res.sendStatus(401); // brak uzytkownika

        if (row.role === 'admin') return res.sendStatus(403); // brak uprawnien

        db.run(`DELETE FROM users WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).send(err.message);
            return res.sendStatus(201);
        });
    });
});

// Zmiana roli
app.put('/api/user/role/:id', requireRole('admin'), (req, res) => {
    const id = req.params.id;

    db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (!row) return res.sendStatus(401); // brak uzytkownika

        if (row.role === 'admin') return res.sendStatus(403); // brak uprawnien

        let newRole;
        if (row.role === 'user') {
            newRole = 'moderator';
        } else if (row.role === 'moderator') {
            newRole = 'user';
        }

        db.run(`UPDATE users SET role = ? WHERE id = ?`, [newRole, id], (err) => {
            if (err) return res.status(500).send(err.message);
            return res.sendStatus(201);
        });
    });
});

// Sprawdza role
function requireRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) {
            next();
        } else {
            res.sendStatus(403); // brak uprawnien
        }
    };
}

/////////BMR/////////////
function calculateCalories({ weight, height, age, gender, activityLevel, goal }) {
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        return res.status(400).json({ error: 'Brakuje wymaganych danych' });
    }
  
    let bmr;
  
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
  
    const goalMultipliers = {
      lose: 0.8,
      maintain: 1,
      gain: 1.2
    };
  
    const multiplier1 = activityMultipliers[activityLevel];
    const multiplier2 = goalMultipliers[goal];
  
    if(!multiplier1 || !multiplier2) {
      throw new Error('Invalid activity level.');
    }
  
    return Math.round(bmr*multiplier1*multiplier2);
  }
  
  ///////////////BMI///////////////
  function calculateBMI(weight, height) {
    if (!weight || !height) {
        return res.status(400).json({ error: 'Brakuje wymaganych danych' });
    }
  
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let status = '';
  
    if (bmi < 18.5) status = 'Niedowaga';
    else if (bmi < 25) status = 'Waga prawidłowa';
    else if (bmi < 30) status = 'Nadwaga';
    else status = 'Otyłość';
  
    return `${bmi.toFixed(1)} – ${status}`;
  }
  
  ///////liczy BMR i BMI//////////////
  app.post('/api/calculate', (req, res) => {
    try {
      const { weight, height, age, gender, activityLevel, goal } = req.body;
      const calories = calculateCalories({ weight, height, age, gender, activityLevel, goal });
      const bmi = calculateBMI(weight, height);
      res.json({ calories, bmi });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  /////////////////zwraca dane uzytkownika////////////////////
  app.get('/api/userdata', (req, res) => {

    if (!req.session.user) return res.status(401).json({ error: 'Nie jesteś zalogowany' });
    
    const userId = req.session.user.id;
  
    const query = 'SELECT weight, height, birthdate, gender, activityLevel, goal FROM users WHERE id = ?';
    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Błąd podczas odczytu z bazy danych' });
        }
  
        if (!row) {
            return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }
  
        // Oblicz wiek z daty urodzenia
        const today = new Date();
        const birthDate = new Date(row.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
  
        // Zwróć dane z wiekiem zamiast daty urodzenia
        res.json({
            weight: row.weight,
            height: row.height,
            age: age,
            gender: row.gender,
            activityLevel: row.activityLevel,
            goal: row.goal
        });
    });
  });

// Default route (optional)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'));
});

app.get('/admin.html', requireRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, '/admin.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/profile.html'));
});

app.get('/licznik.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/licznik.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});