//////////////// Skrypty do strony logowania //////////////

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
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.status === 201) {
        message.innerHTML = "Zalogowano";
        forLoginPage();
        form.reset();
    }
    if (res.status === 401) {
        message.innerHTML = "Niepoprawne haslo lub nazwa uzytkownika";
        form.reset();
    }
    if (res.status === 400) {
        message.innerHTML = "Niekompletne dane";
    }
}

// Rejestracja
async function Register() {
    const form = document.getElementById('userForm');
    const message = document.getElementById('message');

    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        birthdate: formData.get('birthdate')
    };

    const res = await fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.status === 201) {
        message.innerHTML = "Zarejestrowano";
        form.reset();
    }
    if (res.status === 409) {
        message.innerHTML = "Nazwa użytkownika jest zajęta";
        form.reset();
    }
    if (res.status === 400) {
        message.innerHTML = "Niekompletne dane";
    }
}

// Wylogowanie
async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
}


/////////////// Skrypty do strony glownej ///////////////

async function forMainPage() {
    user = await loggedUser();
    if (!user) return;

    const loginButton = document.getElementById('loginButton');
    if (loginButton) loginButton.innerHTML = `<button onclick="logout()">Wyloguj</button>`;

    const profileButton = document.getElementById('profileButton');
    if (profileButton) profileButton.style.display = 'inline-block';

    if (user.role === 'admin') {
        const adminButton = document.getElementById('adminButton');
        if (adminButton) adminButton.style.display = 'inline-block';
    }
}


/////////////// Skrypty do strony admina ////////////////

async function forAdminPage() {
    user = await loggedUser();
    if (!user) return;

    loadUsers();
}

// Zwraca liste zarejestrowanych uzytkownikow
async function loadUsers() {
    const userList = document.getElementById('userList');
    if (userList) {
        const res = await fetch('/api/users');
        const users = await res.json();
        userList.innerHTML = users.map(u => `
        <p>
            User #${u.id}: ${u.username} ${u.birthdate} ${u.role}
            <button onclick="deleteUser(${u.id})">Usuń</button>
            <button onclick="toggleRole(${u.id})">Zmień rolę</button>
        </p>
    `).join('');
    }
}

// Usuwanie
async function deleteUser(id) {
    const confirmed = confirm("Czy na pewno chcesz usunąć użytkownika?");
    if (!confirmed) return;

    const res = await fetch(`/api/user/${id}`, { method: 'DELETE' });

    if (res.ok) {
        alert("Użytkownik usunięty");
        loadUsers();
    } else {
        alert("Błąd");
    }
}

// Zmiana roli
async function toggleRole(id) {
    const res = await fetch(`/api/user/role/${id}`, { method: 'PUT' });

    if (res.ok) {
        alert("Zmieniono role");
        loadUsers();
    } else {
        alert("Błąd");
    }
}


///////////////// Skrypty do strony profilu ////////////////

async function forProfilePage() {
    user = await loggedUser();
    if (!user) return;

    const currentUsername = document.getElementById('currentUsername');
    if (currentUsername) currentUsername.textContent = user.username;

    const roleInfo = document.getElementById('role');
    if (roleInfo) roleInfo.textContent = user.role;

    const currentBirthdate = document.getElementById('currentBirthdate');
    if (currentBirthdate) currentBirthdate.textContent = user.birthdate;
}

async function changeUsername() {
    const newUsername = document.getElementById('newUsername').value;

    user = await loggedUser();
    if (!user) return;

    const res = await fetch(`/api/user/username/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newusername: newUsername })
    });

    if (res.ok) {
        alert("Zmieniono nazwę użytkownika");
        forProfilePage();
        newUsername.value = '';
        document.getElementById('usernameForm').style.display = 'none';
    }
    if (res.status === 409) {
        alert("Nazwa użytkownika jest zajęta");
    }
}



// Sprawdza czy uzytkownik jest juz zalogowany
async function loggedUser() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return false;
    const user = await res.json();
    return user;
}