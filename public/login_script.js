let currentForm = 'login';
let messageTimer = null;

document.getElementById("userForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentForm === 'login') {
        Login();
    } else if (currentForm === 'register') {
        Register();
    }
    else if (currentForm === 'sendEmail') {
        sendEmail();
    }
    else if (currentForm === 'verifyCode') {
        verifyCode();
    }
    else if (currentForm === 'changePassword') {
        changePassword();
    }
});

function updateTitle(title) {
    document.getElementById("formTitle").innerText = title;
}

function renderLoginForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
                <input type="text" name="username" id="username" placeholder="Nazwa użytkownika" required /><br><br>
                <div class="password-wrapper">
                    <input type="password" name="password" id="password" placeholder="Hasło" required />
                    <i class="fa-solid fa-eye" id="togglePassword" onclick="seePassword()"></i>
                </div><br><br>
                <button type="submit">Zaloguj się</button>
                <button type="button" onclick="renderSendEmailForm()">Resetuj hasło</button>
                <button type="button" onclick="renderRegisterForm()">Zarejestruj się</button>
            `;
    document.getElementById("formTitle").innerText = "Logowanie";
    currentForm = 'login';
}

function renderRegisterForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
                <input type="text" name="username" id="username" placeholder="Nazwa użytkownika" required /><br><br>
                <input type="email" name="email" id="email" placeholder="Adres e-mail" required /><br><br>
                <div class="password-wrapper">
                    <input type="password" name="password" id="password" placeholder="Hasło" required />
                    <i class="fa-solid fa-eye" id="togglePassword" onclick="seePassword()"></i>
                </div><br><br>
                <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Powtórz hasło" required /><br><br>

                <button type="button" id="toggleOptional">Pokaż dane opcjonalne</button><br><br>
                <div class="optional-section" id="optionalSection" style="display: none;">
                    <h3>Dane opcjonalne</h3>
                    <input type="date" name="birthdate" id="birthdate" placeholder="Data urodzenia" /><br><br>
                    <input type="number" name="height" id="height" placeholder="Wzrost (cm)" min="1" max="300" /><br><br>
                    <input type="number" name="weight" id="weight" placeholder="Waga (kg)" min="1" max="600" /><br><br>

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

                <button type="button" onclick="renderLoginForm()">Zaloguj się</button>
                <button type="submit">Zarejestruj się</button>
            `;
    document.getElementById("formTitle").innerText = "Rejestracja";
    currentForm = 'register';

    document.getElementById("toggleOptional").addEventListener("click", () => {
        const section = document.getElementById("optionalSection");
        const button = document.getElementById("toggleOptional");

        if (section.style.display === "none") {
            section.style.display = "block";
            button.textContent = "Ukryj dane opcjonalne";
        } else {
            section.style.display = "none";
            button.textContent = "Pokaż dane opcjonalne";
        }
    });
}

function renderSendEmailForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
        <input type="email" id="resetEmail" placeholder="Podaj adres e-mail konta" required /><br><br>
        <button type="submit">Wyślij kod</button>
        <button type="button" onclick="renderLoginForm()">Wróć</button>
    `;
    document.getElementById("formTitle").innerText = "Reset hasła";
    currentForm = 'sendEmail';
}

function renderVerifyCodeForm(email) {
    const form = document.getElementById("userForm");
    form.innerHTML = `
        <p>Wysłano kod na: <b>${email}</b></p>
        <input type="text" id="resetCode" placeholder="Wpisz 6-cyfrowy kod" maxlength="6" required /><br><br>
        <button type="submit">Zweryfikuj kod</button>
        <button type="button" onclick="renderLoginForm()">Anuluj</button>
    `;
    document.getElementById("formTitle").innerText = "Weryfikacja kodu";
    currentForm = 'verifyCode';
}

function renderChangePasswordForm() {
    const form = document.getElementById("userForm");
    form.innerHTML = `
        <p>Ustaw nowe hasło</p>
        <div class="password-wrapper">
            <input type="password" name="password" id="password" placeholder="Hasło" required />
            <i class="fa-solid fa-eye" id="togglePassword" onclick="seePassword()"></i>
        </div><br><br>
        <input type="password" id="confirmPassword" placeholder="Powtórz nowe hasło" required /><br><br>
        <button type="submit">Zmień hasło</button>
        <button type="button" onclick="renderLoginForm()">Anuluj</button>
    `;
    document.getElementById("formTitle").innerText = "Ustaw nowe hasło";
    currentForm = 'changePassword';
}

function seePassword() {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    if (confirmPassword) {
        confirmPassword.setAttribute('type', type);
    }
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
};

async function forLoginPage() {
    user = await loggedUser();
    if (!user) return;

    const formContainer = document.getElementById('formContainer');
    if (formContainer) formContainer.style.display = 'none';

    const message = document.getElementById('message');
    if (message) message.innerHTML = "Zalogowano";
}

// Logowanie
async function Login() {
    const form = document.getElementById('userForm');
    const message = document.getElementById('message');

    message.style.display = "block";
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        message.style.display = "none";
        message.innerHTML = "";
        messageTimer = null;
    }, 4000);

    const formData = new FormData(form);
    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const username = (formData.get('username') || '').trim();
    const password = (formData.get('password') || '').trim();

    const data = {
        username: username,
        password: password
    };

    const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    info = await res.json();

    if (res.ok) {
        forLoginPage();
        form.reset();
        location.href = 'index.html';
    }
    else if (res.status === 400) {
        message.innerHTML = (info.message || "Wystąpił błąd");
    } else {
        message.innerHTML = (info.message || "Wystąpił błąd");
        form.reset();
    }
}

// Rejestracja
async function Register() {
    const form = document.getElementById('userForm');
    const message = document.getElementById('message');

    message.style.display = "block";
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        message.style.display = "none";
        message.innerHTML = "";
        messageTimer = null;
    }, 4000);

    const formData = new FormData(form);
    // Usuwanie niepotrzebnych spacji, tabulatorow itd.
    const username = (formData.get('username') || '').trim();
    const email = (formData.get('email') || '').trim();
    const password = (formData.get('password') || '').trim();
    const confirmPassword = (formData.get('confirmPassword') || '').trim();
    const birthdate = (formData.get('birthdate') || '').trim();
    const height = formData.get('height');
    const weight = formData.get('weight');
    const gender = (formData.get('gender') || '').trim();
    const activityLevel = (formData.get('activityLevel') || '').trim();
    const goal = (formData.get('goal') || '').trim();

    // Sprawdzanie nazwy uzytkownika
    if (username.length < 3 || username.length > 20) {
        message.innerHTML = "Nazwa użytkownika musi mieć od 3 do 20 znaków.";
        return;
    }

    const ux = /^[a-zA-Z0-9._]+$/;
    if (!ux.test(username)) {
        message.innerHTML = "Nazwa użytkownika może zawierać tylko litery, cyfry oraz zkaki: [ . , _ ]";
        return;
    }

    // Sprawdzanie emaila
    const ex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!ex.test(String(email).toLowerCase())) {
        message.innerHTML = "Niepoprawny adres e-mail";
        return;
    }

    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
        message.innerHTML = "Hasła nie są takie same";
        return;
    }

    // Walidacja hasła
    if (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password)) {
        message.innerHTML = "Hasło musi zawierać 8 znaków w tym: cyfrę oraz dużą i małą literę";
        return;
    }


    const data = {
        username: username,
        email: email,
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
    info = await res.json();

    if (res.ok) {
        message.innerHTML = (info.message || "Udało się");
        form.reset();
        renderLoginForm();
    }
    else {
        message.innerHTML = (info.message || "Wystąpił błąd");
    }
}

// Reset hasla
async function sendEmail() {
    const email = document.getElementById("resetEmail").value.trim();
    const message = document.getElementById("message");
    message.style.display = "block";

    const x = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!x.test(String(email).toLowerCase())) {
        message.innerHTML = "Niepoprawny adres e-mail";
        return;
    }

    const res = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    info = await res.json();

    if (res.ok) {
        message.innerHTML = (info.message || "Udało się");
        renderVerifyCodeForm(email);
    } else {
        message.innerHTML = (info.message || "Wystąpił błąd");
    }
}

async function verifyCode() {
    const code = document.getElementById("resetCode").value.trim();
    const message = document.getElementById("message");

    if (!/^\d{6}$/.test(code)) {
        message.innerHTML = "Kod musi miec 6 cyfr";
        return;
    }

    const res = await fetch('/api/verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    info = await res.json();

    if (res.ok) {
        message.innerHTML = (info.message || "Udało się");
        renderChangePasswordForm();
    } else {
        message.innerHTML = (info.message || "Wystąpił błąd");
    }
}

async function changePassword() {
    const password = (document.getElementById('password').value || '').trim();
    const confirmPassword = (document.getElementById('confirmPassword').value || '').trim();

    if (password !== confirmPassword) {
        message.innerHTML = "Hasła nie są takie same";
        return;
    }

    if (password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password)) {
        message.innerHTML = "Hasło musi zawierać 8 znaków w tym: cyfrę oraz dużą i małą literę";
        return;
    }

    const res = await fetch(`/api/user/password/reset`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password, confirmPassword: confirmPassword })
    });
    info = await res.json();

    if (res.ok) {
        message.innerHTML = (info.message || "Udało się");
        renderLoginForm();
    } else {
        message.innerHTML = (info.message || "Wystąpił błąd");
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