async function forMainPage() {
    user = await loggedUser();
    if (!user) return;

    const loginButton = document.getElementById('loginButton');
    if (loginButton) loginButton.innerHTML = `<button onclick="logout()"><span class="icon">🚪</span> Wyloguj</button>`;

    const profileButton = document.getElementById('profileButton');
    if (profileButton) profileButton.style.display = 'inline-block';

    if (user.role === 'admin') {
        const adminButton = document.getElementById('adminButton');
        if (adminButton) adminButton.style.display = 'inline-block';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = await loggedUser();

    if (user) {
    // Pokaż nazwę użytkownika
    const nameDiv = document.getElementById("dropdownUsername");
    nameDiv.textContent = `Witaj, ${user.username}`;
    } else {
    // Niezalogowany – tylko przycisk logowania
    document.getElementById("dropdownUsername").textContent = "Nie jesteś zalogowany";
    }
});

async function loggedUser() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return false;
    return await res.json();
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
}

window.onload = () => {
    forMainPage();
};

function toggleDropdown() {
    const dropdown = document.getElementById("userDropdown");
    dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
}

//kliknięcie poza menu je zamyka
window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("userDropdown");
    const hamburger = document.querySelector(".hamburger");
    if (!hamburger.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
    }
});