function toggleForm(id) {
    const forms = document.querySelectorAll('.change-form');
    forms.forEach(form => {
        if (form.id === id) {
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        } else {
            form.style.display = 'none';
        }
    });
}

async function forProfilePage() {
    user = await loggedUser();
    if (!user) return;

    const currentUsername = document.getElementById('currentUsername');
    if (currentUsername) currentUsername.textContent = user.username;

    const roleInfo = document.getElementById('role');
    if (roleInfo) roleInfo.textContent = user.role;

    const currentBirthdate = document.getElementById('currentBirthdate');
    if (currentBirthdate) currentBirthdate.textContent = user.birthdate;

    const currentHeight = document.getElementById('currentHeight');
    if (currentHeight) currentHeight.textContent = user.height;

    const currentWeight = document.getElementById('currentWeight');
    if (currentWeight) currentWeight.textContent = user.weight;

    const currentGender = document.getElementById('currentGender');
    if (currentGender) currentGender.textContent = user.gender;

    const currentActivityLevel = document.getElementById('currentActivityLevel');
    if (currentActivityLevel) currentActivityLevel.textContent = user.activityLevel;

    const currentGoal = document.getElementById('currentGoal');
    if (currentGoal) currentGoal.textContent = user.goal;
}

async function changeUsername() {
    const newUsername = (document.getElementById('newUsername').value || '').trim();

    // Sprawdzenie czy dane nie sa puste
    if (newUsername === '') {
        alert("Wszystkie pola są wymagane");
        return;
    }

    const res = await fetch(`/api/user/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUsername })
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
    if (res.status === 400) {
        alert("Niepoprawne dane");
    }
}

async function changePassword() {
    const currentPassword = (document.getElementById('currentPassword').value || '').trim();
    const newPassword = (document.getElementById('newPassword').value || '').trim();

    // Sprawdzenie czy dane nie sa puste
    if (currentPassword === '' || newPassword === '') {
        alert("Wszystkie pola są wymagane.");
        return;
    }

    // Walidacja długości hasła
    if (newPassword.length < 8) {
        alert("Hasło musi mieć co najmniej 8 znaków.");
        return;
    }

    // Walidacja dużej litery
    if (!/[A-Z]/.test(newPassword)) {
        alert("Hasło musi zawierać co najmniej jedną dużą literę.");
        return;
    }

    // Walidacja cyfry
    if (!/\d/.test(newPassword)) {
        alert("Hasło musi zawierać co najmniej jedną cyfrę.");
        return;
    }

    const res = await fetch(`/api/user/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    });

    if (res.ok) {
        alert("Zmieniono hasło");
        forProfilePage();
        newPassword.value = '';
        document.getElementById('passwordForm').style.display = 'none';
    }
    if (res.status === 403) {
        alert("Hasło niepoprawne");
    }
    if (res.status === 400) {
        alert("Niepoprawne dane");
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
    forProfilePage();
};