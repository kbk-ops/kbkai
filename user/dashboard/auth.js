// ===== AUTH CHECK =====
function checkAuth() {
  const memberID = sessionStorage.getItem("memberID");
  const auth = sessionStorage.getItem("auth");
  const expiry = sessionStorage.getItem("expiry");

  if (!memberID || auth !== "true" || Date.now() > expiry) {
    sessionStorage.clear();
    location.replace("https://kbk-ops.github.io/OrganizationFund");
  }
}

checkAuth();

// ===== HANDLE BACK/FORWARD CACHE =====
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    checkAuth();
  }
});

// ===== GLOBAL LOGOUT =====
function logout() {
  sessionStorage.clear();
  location.replace("https://kbk-ops.github.io/OrganizationFund");
}

// ===== IDLE AUTO-LOGOUT =====
let idleTimer;
const IDLE_LIMIT = 2 * 60 * 1000;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    alert("You have been logged out due to inactivity.");
    logout();
  }, IDLE_LIMIT);
}

["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event => {
  document.addEventListener(event, resetIdleTimer, true);
});

resetIdleTimer();
