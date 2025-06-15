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

function showError(message) {
    const container = document.getElementById('error-container');
    const containertext = document.getElementById('error-text');
    containertext.innerText = message;
    containertext.style.color = 'red';
    container.style.display = 'block';
}

function clearError() {
    const container = document.getElementById('error-container');
    const containertext = document.getElementById('error-text');
    containertext.innerText = '';
    container.style.display = 'none';
}

async function submitForm() {
    clearError();
    
    const resultBoxBMR = document.getElementById("resultbmr");
    const resultTextBMR = document.getElementById("resultbmrtext");
    const resultBoxBMI = document.getElementById("resultbmi");
    const resultTextBMI = document.getElementById("resultbmitext");
    const resulth3 = document.getElementById("resulth3");

    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseFloat(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const goal = document.getElementById('goal').value;

    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        resulth3.style.display = "none";

        resultTextBMR.innerText = "Nie podałeś wszystkich wartości";
        resultBoxBMR.style.display = "block";
        resultBoxBMR.style.color = "red";
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
    resulth3.style.display = "block";
    resultBoxBMR.style.color = "";
}


async function InsertUserData() {
    try {
        clearError();

        const response = await fetch(`/api/userdata`);
        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Błąd pobierania danych');
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
        showError('Błąd połączenia z serwerem.');
    }
}