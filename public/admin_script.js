let users = [];

async function loadUsers() {
    const res = await fetch('/api/users');
    users = await res.json();
    renderTable(users);
}

function renderTable(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = users.map(u => `
        <tr>
          <td data-label="ID">${u.id}</td>
          <td data-label="Nazwa użytkownika">${u.username}</td>
          <td data-label="Email">${u.email}</td>
          <td data-label="Data urodzenia">${u.birthdate}</td>
          <td data-label="Płeć">${u.gender}</td>
          <td data-label="Rola">${u.role}</td>
          <td data-label="Akcje">
            <button onclick="deleteUser(${u.id})">Usuń</button>
            <button onclick="toggleRole(${u.id})">Zmień rolę</button>
          </td>
        </tr>
      `).join('');
}

function filterUsers() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
    renderTable(filtered);
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

async function forAdminPage() {
    user = await loggedUser();
    if (!user) return;

    loadUsers();
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