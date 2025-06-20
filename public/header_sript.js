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
    dropdown.style.display = (dropdown.style.display === "flex") ? "none" : "flex";
}

//kliknięcie poza menu je zamyka
window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("userDropdown");
    const hamburger = document.querySelector(".hamburger");
    if (!hamburger.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
    }
});

//cookies
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cookie-modal');
    const acceptAllBtn = document.getElementById('accept-cookies');
    const acceptNecessaryBtn = document.getElementById('accept-necessary');
    const saveBtn = document.getElementById('save-cookies');
  
    const analyticsBox = document.getElementById('cookies-analytics');
    const marketingBox = document.getElementById('cookies-marketing');
  
    if (!getCookie('cookiesAccepted')) {
      modal.classList.remove('hidden');
    }
  
    function saveConsent(analytics, marketing) {
      fetch('/accept-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics: analytics,
          marketing: marketing
        })
      }).then(() => {
        modal.classList.add('hidden');
        document.cookie = "cookiesAccepted=true; path=/; max-age=31536000";
      });
    }
  
    acceptAllBtn.addEventListener('click', () => {
      saveConsent(true, true);
    });
  
    saveBtn.addEventListener('click', () => {
      const analytics = analyticsBox.checked;
      const marketing = marketingBox.checked;
      saveConsent(analytics, marketing);
    });
  
    acceptNecessaryBtn.addEventListener('click', () => {
      saveConsent(false, false);
    });
  });