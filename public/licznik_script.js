function selectGender(button) {
    document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.getElementById('gender').value = button.getAttribute('data-gender');
}

function selectActivity(button) {
    document.querySelectorAll('.activity-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.getElementById('activityLevel').value = button.getAttribute('data-activity');
}

function selectGoal(button) {
    document.querySelectorAll('.goal-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.getElementById('goal').value = button.getAttribute('data-goal');
}

async function submitForm() {
    const resultBoxBMR = document.getElementById("resultbmr");
    const resultTextBMR = document.getElementById("resultbmrtext");
    const resultBoxBMI = document.getElementById("resultbmi");
    const resultTextBMI = document.getElementById("resultbmitext");

    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const goal = document.getElementById('goal').value;

    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        resultTextBMR.innerText = "Nie podałeś wszystkich wartości";
        resultBoxBMR.style.display = "block";
        resultBoxBMR.style.opacity = "1";

        resultTextBMI.innerText = "";
        resultBoxBMI.style.display = "none";
        return;
    }

    try {
        const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weight, height, age, gender, activityLevel, goal })
        });

        const data = await response.json();

        if (response.ok) {
            resultTextBMR.innerText = `${data.calories} kcal / dzień`;
            resultBoxBMR.style.display = "block";

            resultTextBMI.innerText = `${data.bmi}`;
            resultBoxBMI.style.display = "block";
        } else {
            resultTextBMR.innerText = data.error || "Wystąpił błąd.";
            resultBoxBMR.style.display = "block";
            resultBoxBMR.style.opacity = "1";

            resultTextBMI.innerText = data.error || "Wystąpił błąd.";
            resultBoxBMI.style.display = "block";
            resultBoxBMI.style.opacity = "1";
        }
    } catch (err) {
        resultTextBMR.innerText = "Błąd połączenia z serwerem.";
        resultBoxBMR.style.display = "block";
        resultBoxBMR.style.opacity = "1";

        resultTextBMI.innerText = "Błąd połączenia z serwerem.";
        resultBoxBMI.style.display = "block";
        resultBoxBMI.style.opacity = "1";
    }
}


async function InsertUserData() {
    try {
        const response = await fetch(`/api/userdata`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Błąd pobierania danych');
            return;
        }

        document.getElementById('weight').value = data.weight;
        document.getElementById('height').value = data.height;
        document.getElementById('age').value = data.age;

        // Zaznacz płeć
        document.getElementById('gender').value = data.gender;
        document.querySelectorAll('.gender-btn').forEach(btn => {
            if (btn.getAttribute('data-gender') === data.gender) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Zaznacz aktywność
        document.getElementById('activityLevel').value = data.activityLevel;
        document.querySelectorAll('.activity-btn').forEach(btn => {
            if (btn.getAttribute('data-activity') === data.activityLevel) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Zaznacz cel
        document.getElementById('goal').value = data.goal;
        document.querySelectorAll('.goal-btn').forEach(btn => {
            if (btn.getAttribute('data-goal') === data.goal) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

    } catch (err) {
        console.error(err);
        alert("Błąd połączenia z serwerem");
    }
}

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

// Sprawdza czy uzytkownik jest juz zalogowany
async function loggedUser() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return false;
    const user = await res.json();
    return user;
}

// Wylogowanie
async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
}

window.onload = () => {
    forMainPage();
};
