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
                    User #${u.id}: ${u.username} ${u.email} ${u.birthdate} ${u.gender} ${u.role}
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

// Sprawdza czy uzytkownik jest juz zalogowany
async function loggedUser() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return false;
    const user = await res.json();
    return user;
}

window.onload = () => {
    forAdminPage();
};