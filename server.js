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
      birthdate TEXT NOT NULL
    )
    `);

//db.run(`DELETE FROM users WHERE username = ?`, ['Admin']);

// Rejestracja
app.post('/api/register', (req, res) => {
    const { username, password, birthdate } = req.body;

    if (!username || !password || !birthdate) return res.sendStatus(400); // brak danych

    db.get(`SELECT * FROM users where username = ?`, [username], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (row) return res.sendStatus(409); // powtorzone dane

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).send(err.message);

            db.run(`INSERT INTO users (username, password, birthdate, role) VALUES (?, ?, ?, ?)`,
                [username, hashedPassword, birthdate, 'user'],
                (err) => {
                    if (err) return res.status(500).send(err.message);
                    return res.sendStatus(201); // zarejestrowano
                });
        });
    });
});

// Logowanie
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.sendStatus(400); // brak danych

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
                birthdate: user.birthdate
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
app.put('/api/user/username/:id', (req, res) => {
    const id = req.params.id;
    const { newusername } = req.body;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (!row) return res.sendStatus(404); // brak uzytkownika

        db.get(`SELECT * FROM users WHERE username = ?`, [newusername], (err, row2) => {
            if (err) return res.status(500).send(err.message);

            if (row2) return res.sendStatus(409); // powtorzone dane

            db.run(`UPDATE users SET username = ? WHERE id = ?`, [newusername, id], (err) => {
                if (err) return res.status(500).send(err.message);

                req.session.user = {
                    id: row.id,
                    username: newusername,
                    role: row.role,
                    birthdate: row.birthdate
                };
                return res.sendStatus(201);
            });
        });
    });
});

// Usuwanie uzytkownika
app.delete('/api/user/:id', requireRole('admin'), (req, res) => {
    const id = req.params.id;

    db.get(`SELECT role FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send(err.message);

        if (!row) return res.sendStatus(404); // brak uzytkownika

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

        if (!row) return res.sendStatus(404); // brak uzytkownika

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});