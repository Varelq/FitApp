let currentForm = 'login'; // Domyślny tryb to logowanie

function updateTitle(title) {
    document.getElementById("formTitle").innerText = title;
}

function renderLoginForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
                <input type="text" name="username" id="username" placeholder="Nazwa użytkownika" required /><br><br>
                <input type="password" name="password" id="password" placeholder="Hasło" required /><br><br>
                <button type="button" onclick="handleLoginClick()">Zaloguj się</button>
                <button type="button" onclick="handleRegisterClick()">Zarejestruj się</button>
            `;
    updateTitle("Logowanie");
    currentForm = 'login';
}

function renderRegisterForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
                <input type="text" name="username" id="username" placeholder="Nazwa użytkownika" required /><br><br>
                <input type="password" name="password" id="password" placeholder="Hasło" required /><br><br>
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Powtórz hasło" required /><br><br>
                <div class="optional-section">

                    <h3>Dane opcjonalne</h3>
                    <input type="date" name="birthdate" id="birthdate" placeholder="Data urodzenia" /><br><br>
                    <input type="number" name="height" id="height" placeholder="Wzrost (cm)" min="1" /><br><br>
                    <input type="number" name="weight" id="weight" placeholder="Waga (kg)" min="1" /><br><br>

                    <select name="gender" id="gender">
                        <option value="">Płeć</option>
                        <option value="female">Kobieta</option>
                        <option value="male">Mężczyzna</option>
                        <option value="nonbinary">Niebinarna</option>
                    </select><br><br>

                    <select name="activityLevel" id="activityLevel">
                        <option value="">Poziom aktywności</option>
                        <option value="sedentary">Siedzący tryb życia</option>
                        <option value="light">Lekka aktywność</option>
                        <option value="moderate">Umiarkowana aktywność</option>
                        <option value="active">Duża aktywność</option>
                        <option value="very_active">Bardzo duża aktywność</option>
                    </select><br><br>

                    <select name="goal" id="goal">
                        <option value="">Cel</option>
                        <option value="lose">Schudnąć</option>
                        <option value="maintain">Utrzymać wagę</option>
                        <option value="gain">Przytyć</option>
                    </select><br><br>

                </div><br>

                <button type="button" onclick="handleLoginClick()">Zaloguj się</button>
                <button type="button" onclick="handleRegisterClick()">Zarejestruj się</button>
            `;
    updateTitle("Rejestracja");
    currentForm = 'register';
}

function handleLoginClick() {
    if (currentForm === 'login') {
        Login();
    } else {
        renderLoginForm();
    }
}

function handleRegisterClick() {
    if (currentForm === 'register') {
        Register();
    } else {
        renderRegisterForm();
    }
}

async function forLoginPage() {
    user = await loggedUser();
    if (!user) return;

    const formContainer = document.getElementById('formContainer');
    if (formContainer) formContainer.style.display = 'none';
}

// Logowanie
async function Login() {
    const form = document.getElementById('userForm');
    const message = document.getElementById('message');
    const formData = new FormData(form);

    const username = (formData.get('username') || '').trim();
    const password = (formData.get('password') || '').trim();

    if (username === '' || password === '') {
        message.innerHTML = "Brakujące dane";
        return;
    }

    const data = {
        username: username,
        password: password
    };

    const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        message.innerHTML = "Zalogowano";
        forLoginPage();
        form.reset();
    }
    if (res.status === 401) {
        message.innerHTML = "Niepoprawne haslo lub nazwa uzytkownika";
        form.reset();
    }
    if (res.status === 400) {
        message.innerHTML = "Niepoprawne dane";
    }
}

// Rejestracja
async function Register() {
    const form = document.getElementById('userForm');
    const message = document.getElementById('message');
    const formData = new FormData(form);

    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const username = (formData.get('username') || '').trim();
    const password = (formData.get('password') || '').trim();
    const confirmPassword = (formData.get('confirmPassword') || '').trim();
    const birthdate = (formData.get('birthdate') || '').trim();
    const height = formData.get('height');
    const weight = formData.get('weight');
    const gender = (formData.get('gender') || '').trim();
    const activityLevel = (formData.get('activityLevel') || '').trim();
    const goal = (formData.get('goal') || '').trim();

    // Sprawdzenie czy dane nie sa puste
    if (username === '' || password === '' || confirmPassword === '') {
        message.innerHTML = "Brakujące dane";
        return;
    }

    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
        message.innerHTML = "Hasła nie są takie same";
        return;
    }

    // Walidacja długości hasła
    if (password.length < 8) {
        message.innerHTML = "Hasło musi mieć co najmniej 8 znaków";
        return;
    }

    // Walidacja dużej litery
    if (!/[A-Z]/.test(password)) {
        message.innerHTML = "Hasło musi zawierać co najmniej jedną dużą literę";
        return;
    }

    // Walidacja cyfry
    if (!/\d/.test(password)) {
        message.innerHTML = "Hasło musi zawierać co najmniej jedną cyfrę";
        return;
    }

    // Walidacja daty urodzenia
    if (birthdate !== '') {
        const today = new Date().toISOString().split('T')[0]; // dzisiejsza data w formacie YYYY-MM-DD
        if (birthdate > today) {
            message.innerHTML = "Data urodzenia nie może być z przyszłości";
            return;
        }
    }

    if (height && (isNaN(height) || height <= 0)) {
        message.innerHTML = "Wzrost musi być dodatnią liczbą";
        return;
    }

    if (weight && (isNaN(weight) || weight <= 0)) {
        message.innerHTML = "Waga musi być dodatnią liczbą";
        return;
    }

    if (gender !== '')
        if (!["female", "male", "nonbinary"].includes(gender)) {
            message.innerHTML = "Nieprawidłowa wartość pola płeć";
            return;
        }

    if (activityLevel !== '')
        if (!["sedentary", "light", "moderate", "active", "very_active"].includes(activityLevel)) {
            message.innerHTML = "Nieprawidłowa wartość pola poziom aktywności";
            return;
        }

    if (goal !== '')
        if (!["lose", "maintain", "gain"].includes(goal)) {
            message.innerHTML = "Nieprawidłowa wartość pola cel";
            return;
        }

    const data = {
        username: username,
        password: password,
        confirmPassword: confirmPassword,
        birthdate: birthdate,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        gender: gender,
        activityLevel: activityLevel,
        goal: goal
    };

    const res = await fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        message.innerHTML = "Zarejestrowano";
        form.reset();
    }
    if (res.status === 409) {
        message.innerHTML = "Nazwa użytkownika jest zajęta";
        form.reset();
    }
    if (res.status === 400) {
        message.innerHTML = "Niepoprawne dane";
    }
}

// Sprawdza czy uzytkownik jest juz zalogowany
async function loggedUser() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return false;
    const user = await res.json();
    return user;
}

window.onload = () => {
    forLoginPage();
};