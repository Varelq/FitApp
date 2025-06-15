const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

const saltRounds = 10;
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
        email TEXT NOT NULL,
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

db.run(`
    DROP TABLE IF EXISTS rpwd
    `, () => {
    db.run(`
        CREATE TABLE IF NOT EXISTS rpwd(
        email TEXT,
        code INTEGER,
        expires DATETIME
        )
        `)
});

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

//db.run(`DELETE FROM users WHERE username = ?`, ['Admin']);
//db.run(`UPDATE users SET role = ? WHERE username = ?`, ['admin', 'Admin']);

// Rejestracja
app.post('/api/register', (req, res) => {
    const { username: rawUsername, email: rawEmail, password: rawPassword, confirmPassword: rawConfirmPassword,
        birthdate: rawBirthdate, height: height, weight: weight, gender: rawGender, activityLevel: rawActivityLevel, goal: rawGoal } = req.body;

    const username = verifyUsername(rawUsername);
    const email = verifyEmail(rawEmail);
    const password = verifyPassword(rawPassword, rawConfirmPassword);

    if (!(username && email && password)) return res.status(400).json({ message: 'Niepoprawne dane' });

    db.get(`SELECT * FROM users where username = ? or email = ?`, [username, email], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (row) return res.status(409).json({ message: 'Nazwa użytkownika lub adres e-mail jest zajęty' });

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).send(err.message);

            const resultopt = verifyOptional(rawBirthdate, height, weight, rawGender, rawActivityLevel, rawGoal);

            const { birthdateToSave, heightToSave, weightToSave, genderToSave, activityLevelToSave, goalToSave } = resultopt;

            db.run(`INSERT INTO users (username, email, password, role, birthdate, height, weight, gender, activityLevel, goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, 'user', birthdateToSave, heightToSave, weightToSave, genderToSave, activityLevelToSave, goalToSave], (err) => {
                    if (err) return res.status(500).send(err.message);
                    return res.status(201).json({ message: 'Zarejestrowano' });
                });
        });
    });
});

// Logowanie
app.post('/api/login', (req, res) => {
    const { username: rawUsername, password: rawPassword } = req.body;

    const username = verifyUsername(rawUsername);
    const password = verifyPassword(rawPassword, rawPassword);

    if (!(username && password)) return res.status(400).json({ message: 'Niepoprawne dane' });

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user) return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (!result) return res.status(401).json({ message: 'Nieprawidłowe hasło' });

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                birthdate: user.birthdate,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                goal: user.goal
            };
            return res.status(201).json({ message: 'Zalogowano' });
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

    const newUsername = verifyUsername(rawNewUsername);

    if (!newUsername) return res.status(400).json({ message: 'Niepoprawne dane' });

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE username = ?`, [newUsername], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (row) return res.status(409).json({ message: 'Nazwa użytkownika jest zajęta' });

        db.run(`UPDATE users SET username = ? WHERE id = ?`, [newUsername, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.username = newUsername;
            return res.status(201).json({ message: 'Zmieniono nazwę użytkownika' });
        });
    });
});

// Zmiana adresu e-mail
app.put('/api/user/email', (req, res) => {
    const { newEmail: rawNewEmail } = req.body;

    const newEmail = verifyEmail(rawNewEmail);

    if (!newEmail) return res.status(400).json({ message: 'Niepoprawne dane' });

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE email = ?`, [newEmail], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (row) return res.status(409).json({ message: 'Adres e-mail jest zajęty' });

        db.run(`UPDATE users SET email = ? WHERE id = ?`, [newEmail, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.email = newEmail;
            return res.status(201).json({ message: 'Zmieniono adres e-mail' });
        });
    });
});

// Zmiana hasla
app.put('/api/user/password', (req, res) => {
    const { currentPassword: rawCurrentPassword, newPassword: rawNewPassword } = req.body;

    const currentPassword = verifyPassword(rawCurrentPassword, rawCurrentPassword);
    const newPassword = verifyPassword(rawNewPassword, rawNewPassword);

    if (!(currentPassword && newPassword)) return res.status(400).json({ message: 'Niepoprawne dane' });

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        bcrypt.compare(currentPassword, user.password, (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (!result) return res.status(401).json({ message: 'Nieprawidłowe hasło' });

            bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
                if (err) return res.status(500).send(err.message);

                db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, req.session.user.id], (err) => {
                    if (err) return res.status(500).send(err.message);
                    return res.status(201).json({ message: 'Zmieniono hasło' });
                });
            });
        });
    });
});

// Wyslanie maila
app.post('/api/sendEmail', (req, res) => {
    const { email: rawEmail } = req.body;
    const code = generateResetCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const email = verifyEmail(rawEmail);

    if (!email) return res.status(400).json({ message: 'Niepoprawne dane' });

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (!row) return res.status(404).json({ message: 'Nie znaleziono adresu e-mail' });

        db.run(`INSERT INTO rpwd (email, code, expires) VALUES (?, ?, ?)`,
            [email, code, expires], (err) => {
                if (err) return res.status(500).send(err.message);

                transporter.sendMail({
                    from: `"Reset Hasła" <process.env.EMAIL_ADDRESS>`,
                    to: email,
                    subject: `Twój kod resetowania hasła dla użytkownika: ${row.username}`,
                    text: `Twój kod resetujący to: ${code}\nWażny przez 10 minut.`
                }, (err) => {
                    if (err) return res.status(500).send(err.message);

                    req.session.email = {
                        address: email,
                        verified: false,
                    };
                    return res.status(201).json({ message: 'Wysłano kod resetujący na adres e-mail' });
                });
            });
    });
});

// Weryfikacja kodu
app.post('/api/verifyCode', (req, res) => {
    const { code } = req.body;

    const now = new Date().toISOString();

    if (!req.session.email) return res.status(401).json({ message: 'Niezweryfikowany adres e-mail' });
    const email = req.session.email.address;

    db.get(`SELECT code, expires FROM rpwd WHERE email = ? AND expires > ? ORDER BY expires DESC LIMIT 1`,
        [email, now], (err, row) => {
            if (err) return res.status(500).send(err.message);

            if (!row) return res.status(404).json({ message: 'Kod nie znaleziony lub wygasł' });

            if (parseInt(row.code) === parseInt(code)) {
                req.session.email.verified = true;
                db.run(`DELETE FROM rpwd WHERE email = ?`, [email]);
                return res.status(201).json({ message: 'Kod poprawny' });
            } else {
                return res.status(401).json({ message: 'Kod niepoprawny' });
            }
        }
    );
});

// Reset hasla
app.put('/api/user/password/reset', (req, res) => {
    const { password: rawPassword, confirmPassword: rawConfirmPassword } = req.body;

    if (!req.session.email || !req.session.email.verified) return res.status(401).json({ message: 'Niezweryfikowany adres e-mail lub kod' });
    const email = req.session.email.address;

    const result = verifyPassword(rawPassword, rawConfirmPassword);
    if (result) password = result;
    else return res.status(400).json({ message: 'Niepoprawne dane' });

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return res.status(500).send(err.message);

        db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email], (err) => {
            if (err) return res.status(500).send(err.message);
            return res.status(201).json({ message: 'Zmieniono hasło' });
        });
    });
});

// Zmiana daty urodzenia
app.put('/api/user/birthdate', (req, res) => {
    const { newBirthdate: rawNewBirthdate } = req.body;

    const newBirthdate = typeof rawNewBirthdate === 'string' ? rawNewBirthdate.trim() : '';

    const bx = /^\d{4}-\d{2}-\d{2}$/;
    const date = new Date(newBirthdate);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (newBirthdate !== '')
        if (!bx.test(newBirthdate)) return res.status(400).json({ message: 'Niepoprawne dane' });
        else if (isNaN(date.getTime()) || date > today) return res.status(400).json({ message: 'Niepoprawne dane' });
        else birthdateToSave = newBirthdate;
    else birthdateToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET birthdate = ? WHERE id = ?`, [birthdateToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.birthdate = birthdateToSave;
            return res.status(201).json({ message: 'Zmieniono datę urodzenia' });
        });
    });
});

// Zmiana wzrostu
app.put('/api/user/height', (req, res) => {
    const { newHeight: newHeight } = req.body;

    if (newHeight)
        if (isNaN(newHeight) || newHeight <= 0 || newHeight > 300) return res.status(400).json({ message: 'Niepoprawne dane' });
        else heightToSave = newHeight;
    else heightToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET height = ? WHERE id = ?`, [heightToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.height = heightToSave;
            return res.status(201).json({ message: 'Zmieniono wzrost' });
        });
    });
});

// Zmiana wagi
app.put('/api/user/weight', (req, res) => {
    const { newWeight: newWeight } = req.body;

    if (newWeight)
        if (isNaN(newWeight) || newWeight <= 0 || newWeight > 600) return res.status(400).json({ message: 'Niepoprawne dane' });
        else weightToSave = newWeight;
    else weightToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET weight = ? WHERE id = ?`, [weightToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.weight = weightToSave;
            return res.status(201).json({ message: 'Zmieniono wagę' });
        });
    });
});

// Zmiana plci
app.put('/api/user/gender', (req, res) => {
    const { newGender: rawNewGender } = req.body;

    const newGender = typeof rawNewGender === 'string' ? rawNewGender.trim() : '';

    if (newGender !== '')
        if (!["female", "male", "nonbinary"].includes(newGender)) return res.status(400).json({ message: 'Niepoprawne dane' });
        else genderToSave = newGender;
    else genderToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET gender = ? WHERE id = ?`, [genderToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.gender = genderToSave;
            return res.status(201).json({ message: 'Zmieniono płeć' });
        });
    });
});

// Zmiana poziomu aktywności
app.put('/api/user/activityLevel', (req, res) => {
    const { newActivityLevel: rawNewActivityLevel } = req.body;

    const newActivityLevel = typeof rawNewActivityLevel === 'string' ? rawNewActivityLevel.trim() : '';

    if (newActivityLevel !== '')
        if (!["sedentary", "light", "moderate", "active", "very_active"].includes(newActivityLevel)) return res.status(400).json({ message: 'Niepoprawne dane' });
        else activityLevelToSave = newActivityLevel;
    else activityLevelToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET activityLevel = ? WHERE id = ?`, [activityLevelToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.activityLevel = activityLevelToSave;
            return res.status(201).json({ message: 'Zmieniono poziom aktywności' });
        });
    });
});

// Zmiana celu
app.put('/api/user/goal', (req, res) => {
    const { newGoal: rawNewGoal } = req.body;

    const newGoal = typeof rawNewGoal === 'string' ? rawNewGoal.trim() : '';

    if (newGoal !== '')
        if (!["lose", "maintain", "gain"].includes(newGoal)) return res.status(400).json({ message: 'Niepoprawne dane' });
        else goalToSave = newGoal;
    else goalToSave = null;

    if (!req.session.user) return res.status(401).json({ message: 'Musisz się zalogować' });

    db.get(`SELECT * FROM users WHERE id = ?`, [req.session.user.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(401).json({ message: 'Użytkownik nie istnieje' });

        db.run(`UPDATE users SET goal = ? WHERE id = ?`, [goalToSave, req.session.user.id], (err) => {
            if (err) return res.status(500).send(err.message);

            req.session.user.goal = goalToSave;
            return res.status(201).json({ message: 'Zmieniono cel' });
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

    if (!multiplier1 || !multiplier2) {
        throw new Error('Invalid activity level.');
    }

    return Math.round(bmr * multiplier1 * multiplier2);
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

        // Oblicza wiek jak podano birthdate i jest poprawny
        let age = null;
        if (row.birthdate) {
            const birthDate = new Date(row.birthdate);
            if (!isNaN(birthDate.getTime())) {
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }
        }

        // Zwróć dane z wiekiem zamiast daty urodzenia
        res.json({
            weight: row.weight || null,
            height: row.height || null,
            age: age, 
            gender: row.gender || null,
            activityLevel: row.activityLevel || null,
            goal: row.goal || null
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

app.get('/blog.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/blog.html'));
});

app.get('/przepisy.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/przepisy.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});


// funkcje pomocnicze
function verifyUsername(rawUsername) {
    // Usuwanie niepotrzebnych spacji, tabulatorów itd.
    const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
    const ux = /^[a-zA-Z0-9._]+$/;

    // Walidacja
    if (username === '' ||
        username.length < 3 ||
        username.length > 20 ||
        !ux.test(username)) {
        return null;
    }
    return username;
};

function verifyEmail(rawEmail) {
    // Usuwanie niepotrzebnych spacji, tabulatorów itd.
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
    const ex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Walidacja
    if (email === '' ||
        !ex.test(String(email).toLowerCase())) {
        return null;
    }
    return email;
};

function verifyPassword(rawPassword, rawConfirmPassword) {
    // Usuwanie niepotrzebnych spacji, tabulatorów itd.
    const password = typeof rawPassword === 'string' ? rawPassword.trim() : '';
    const confirmPassword = typeof rawConfirmPassword === 'string' ? rawConfirmPassword.trim() : '';

    // Walidacja
    if (password === '' ||
        confirmPassword === '' ||
        password !== confirmPassword ||
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password)) {
        return null;
    }
    return password;
};

function verifyOptional(rawBirthdate, height, weight, rawGender, rawActivityLevel, rawGoal) {
    // Usuwanie niepotrzebnych spacji, tabulatorów itd.
    const birthdate = typeof rawBirthdate === 'string' ? rawBirthdate.trim() : '';
    const gender = typeof rawGender === 'string' ? rawGender.trim() : '';
    const activityLevel = typeof rawActivityLevel === 'string' ? rawActivityLevel.trim() : '';
    const goal = typeof rawGoal === 'string' ? rawGoal.trim() : '';
    let birthdateToSave = null;
    let genderToSave = null;
    let heightToSave = null;
    let weightToSave = null;
    let activityLevelToSave = null;
    let goalToSave = null;

    const bx = /^\d{4}-\d{2}-\d{2}$/;
    const date = new Date(birthdate);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (birthdate !== '')
        if (!bx.test(birthdate)) birthdateToSave = null;
        else if (isNaN(date.getTime()) || date > today) birthdateToSave = null;
        else birthdateToSave = birthdate;

    if (height)
        if (isNaN(height) || height <= 0 || height > 300) heightToSave = null;
        else heightToSave = height;

    if (weight)
        if (isNaN(weight) || weight <= 0 || weight > 600) weightToSave = null;
        else weightToSave = weight;

    if (gender !== '')
        if (!["female", "male", "nonbinary"].includes(gender)) genderToSave = null;
        else genderToSave = gender;

    if (activityLevel !== '')
        if (!["sedentary", "light", "moderate", "active", "very_active"].includes(activityLevel)) activityLevelToSave = null;
        else activityLevelToSave = activityLevel;

    if (goal !== '')
        if (!["lose", "maintain", "gain"].includes(goal)) goalToSave = null;
        else goalToSave = goal;

    return { birthdateToSave, heightToSave, weightToSave, genderToSave, activityLevelToSave, goalToSave };
};

// Generowanie kodu
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000); // 6-cyfrowy
}