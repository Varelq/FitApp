const formHandlers = {
    usernameForm: changeUsername,
    emailForm: changeEmail,
    passwordForm: changePassword,
    birthdateForm: changeBirthdate,
    heightForm: changeHeight,
    weightForm: changeWeight,
    genderForm: changeGender,
    activityLevelForm: changeActivityLevel,
    goalForm: changeGoal,
};

for (const [formId, handler] of Object.entries(formHandlers)) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            handler();
        });
    }
}

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

    const currentEmail = document.getElementById('currentEmail');
    if (currentEmail) currentEmail.textContent = user.email;

    const roleInfo = document.getElementById('role');
    if (roleInfo) roleInfo.textContent = user.role;

    const currentBirthdate = document.getElementById('currentBirthdate');
    if (currentBirthdate) currentBirthdate.textContent = translate(user.birthdate);

    const currentHeight = document.getElementById('currentHeight');
    if (currentHeight) currentHeight.textContent = translate(user.height);

    const currentWeight = document.getElementById('currentWeight');
    if (currentWeight) currentWeight.textContent = translate(user.weight);

    const currentGender = document.getElementById('currentGender');
    if (currentGender) currentGender.textContent = translate(user.gender);

    const currentActivityLevel = document.getElementById('currentActivityLevel');
    if (currentActivityLevel) currentActivityLevel.textContent = translate(user.activityLevel);

    const currentGoal = document.getElementById('currentGoal');
    if (currentGoal) currentGoal.textContent = translate(user.goal);
}

function translate(value) {
    switch (value) {
        case 'female': return 'Kobieta';
        case 'male': return 'Mężczyzna';
        case 'nonbinary': return 'Niebinarna';
        case 'sedentary': return 'Siedzący tryb życia';
        case 'light': return 'Lekka aktywność';
        case 'moderate': return 'Umiarkowana aktywność';
        case 'active': return 'Duża aktywność';
        case 'very_active': return 'Bardzo duża aktywność';
        case 'lose': return 'Schudnąć';
        case 'maintain': return 'Utrzymać wagę';
        case 'gain': return 'Przytyć';
        case null: return 'Nie podano danych';
        default: return value;
    }
}

async function changeUsername() {
    const newUsername = (document.getElementById('newUsername').value || '').trim();

    const res = await fetch(`/api/user/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUsername })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('usernameForm').reset();
        document.getElementById('usernameForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeEmail() {
    const newEmail = (document.getElementById('newEmail').value || '').trim();

    const x = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!x.test(String(newEmail).toLowerCase())) {
        alert("Niepoprawny adres e-mail");
        return;
    }

    const res = await fetch(`/api/user/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newEmail })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('emailForm').reset();
        document.getElementById('emailForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changePassword() {
    const currentPassword = (document.getElementById('currentPassword').value || '').trim();
    const newPassword = (document.getElementById('newPassword').value || '').trim();

    if (newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/\d/.test(newPassword)) {
        alert("Hasło musi zawierać 8 znaków w tym: cyfrę oraz dużą i małą literę");
        return;
    }

    const res = await fetch(`/api/user/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('passwordForm').reset();
        document.getElementById('passwordForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeBirthdate() {
    const newBirthdate = (document.getElementById('newBirthdate').value || '').trim();

    const res = await fetch(`/api/user/birthdate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBirthdate: newBirthdate })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('birthdateForm').reset();
        document.getElementById('birthdateForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeHeight() {
    const newHeight = document.getElementById('newHeight').value;

    const res = await fetch(`/api/user/height`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newHeight: newHeight ? parseFloat(newHeight) : null })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('heightForm').reset();
        document.getElementById('heightForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeWeight() {
    const newWeight = document.getElementById('newWeight').value;

    const res = await fetch(`/api/user/weight`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newWeight: newWeight ? parseFloat(newWeight) : null })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('weightForm').reset();
        document.getElementById('weightForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeGender() {
    const newGender = (document.getElementById('newGender').value || '').trim();

    const res = await fetch(`/api/user/gender`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newGender: newGender })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('genderForm').reset();
        document.getElementById('genderForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeActivityLevel() {
    const newActivityLevel = (document.getElementById('newActivityLevel').value || '').trim();

    const res = await fetch(`/api/user/activityLevel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newActivityLevel: newActivityLevel })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('activityLevelForm').reset();
        document.getElementById('activityLevelForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
    }
}

async function changeGoal() {
    const newGoal = (document.getElementById('newGoal').value || '').trim();

    const res = await fetch(`/api/user/goal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newGoal: newGoal })
    });
    info = await res.json();

    if (res.ok) {
        alert(info.message || "Wystąpił błąd");
        forProfilePage();
        document.getElementById('goalForm').reset();
        document.getElementById('goalForm').style.display = 'none';
    }
    else {
        alert(info.message || "Wystąpił błąd");
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