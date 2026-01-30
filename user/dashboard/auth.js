// ================================
// AUTH + UI GUARD (CONSOLIDATED)
// ================================
(function () {

  const LOGIN_URL = "https://kbk-ops.github.io/OrganizationFund";
  const IDLE_LIMIT = 2 * 60 * 1000; // 2 minutes
  let idleTimer;

  // ===== AUTH STATE =====
  function isAuthenticated() {
    const memberID = sessionStorage.getItem("memberID");
    const auth = sessionStorage.getItem("auth");
    const expiry = sessionStorage.getItem("expiry");
    return memberID && auth === "true" && Date.now() < expiry;
  }

  // ===== HARD AUTH CHECK =====
  function checkAuth() {
    if (!isAuthenticated()) {
      sessionStorage.clear();
      location.replace(LOGIN_URL);
      return false;
    }
    return true;
  }

  // ===== UI UNLOCK =====
  function unlockUI() {
    if (!checkAuth()) return;

    document.body.classList.remove("locked");

    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
  }

  // 🔒 HARD BLOCK — RUNS IMMEDIATELY
  if (!checkAuth()) return;

  // 🔓 UNLOCK ASAP (prevents flash)
  unlockUI();

  // 🔓 SAFE UNLOCK AFTER DOM
  document.addEventListener("DOMContentLoaded", unlockUI);

  // ===== BACK / FORWARD CACHE PROTECTION =====
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      unlockUI();
    }
  });

  // ===== GLOBAL LOGOUT =====
  window.logout = function () {
    sessionStorage.clear();
    history.replaceState(null, "", "/");
    location.replace(LOGIN_URL);
  };

  // ===== IDLE AUTO-LOGOUT =====
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      window.logout();
    }, IDLE_LIMIT);
  }

  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, true);
  });

  resetIdleTimer();

})();
