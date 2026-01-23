// ===== AUTH CHECK =====
if (!sessionStorage.getItem("memberID")) {
  location.href = "https://kbk-ops.github.io/OrganizationFund";
}

// ===== GLOBAL LOGOUT (used everywhere) =====
function logout() {
  sessionStorage.clear();
  location.href = "https://kbk-ops.github.io/OrganizationFund";
}

// ===== IDLE AUTO-LOGOUT =====
let idleTimer;
const IDLE_LIMIT = 2 * 60 * 1000; // 2 minutes in milliseconds

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    alert("You have been logged out due to inactivity.");
    logout();
  }, IDLE_LIMIT);
}

// User activity events that reset the timer
["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event => {
  document.addEventListener(event, resetIdleTimer, true);
});

// Start timer on load
resetIdleTimer()
