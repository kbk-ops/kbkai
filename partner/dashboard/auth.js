(function () {
  const IDLE_LIMIT = 1 * 60 * 1000;       // 5 minutes
  const HARD_LIMIT = 2 * 60 * 1000;  // 4 hours

  let idleTimer;
  let hardTimer;

  /* =========================
     AUTH CHECK
  ========================== */
  function checkAuth() {
    const session = localStorage.getItem("userSession");
    const username = localStorage.getItem("username");
    const expiresAt = localStorage.getItem("expiresAt");

    if (!session || !username || !expiresAt) return false;

    const remaining = Number(expiresAt) - Date.now();
    if (remaining <= 0) return false;

    return true;
  }

  /* =========================
     UI CONTROL
  ========================== */
  function lockUI() {
    document.body.classList.add("locked");
    const app = document.getElementById("app");
    if (app) app.classList.add("hidden");
  }

  function unlockUI() {
    document.body.classList.remove("locked");
    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
  }

  /* =========================
     LOGOUT
  ========================== */
  window.logout = function () {
    clearTimeout(idleTimer);
    clearTimeout(hardTimer);

    localStorage.removeItem("userSession");
    localStorage.removeItem("username");
    localStorage.removeItem("expiresAt");

    lockUI();

    window.location.replace("https://kbk-ops.github.io/kbkai/partner");
  };

  /* =========================
     IDLE TIMER (5 MIN)
  ========================== */
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      alert("Logged out due to 5 minutes of inactivity.");
      logout();
    }, IDLE_LIMIT);
  }

  function startIdleTracking() {
    ["click", "mousemove", "keypress", "touchstart", "scroll"].forEach(
      (evt) => document.addEventListener(evt, resetIdleTimer)
    );
    resetIdleTimer();
  }

  /* =========================
     HARD EXPIRATION (4 HOURS EXACT)
  ========================== */
  function startHardExpirationTimer() {
    const expiresAt = Number(localStorage.getItem("expiresAt"));
    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      logout();
      return;
    }

    hardTimer = setTimeout(() => {
      alert("Session expired (4-hour limit reached).");
      logout();
    }, remaining);
  }

  /* =========================
     CROSS-TAB LOGOUT SYNC
  ========================== */
  window.addEventListener("storage", function (event) {
    if (event.key === "userSession" && !event.newValue) {
      logout();
    }
  });

  /* =========================
     INIT
  ========================== */
  document.addEventListener("DOMContentLoaded", function () {
    if (!checkAuth()) {
      logout();
      return;
    }

    unlockUI();
    startIdleTracking();
    startHardExpirationTimer();
  });
})();
