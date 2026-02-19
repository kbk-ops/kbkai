(function () {
  const IDLE_LIMIT = 1 * 60 * 1000;
  let idleTimer;

  // Check if user is logged in
  function checkAuth() {
    const session = localStorage.getItem("userSession");
    const username = localStorage.getItem("username");

    return !!(session && username);
  }

  // Lock UI
  function lockUI() {
    document.body.classList.add("locked");

    const app = document.getElementById("app");
    if (app) app.classList.add("hidden");
  }

  // Unlock UI
  function unlockUI() {
    document.body.classList.remove("locked");

    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
  }

  // Logout
  window.logout = function () {
    localStorage.removeItem("userSession");
    localStorage.removeItem("username");
    lockUI();
    window.location.replace("https://kbk-ops.github.io/kbkai/partner");
  };

  // Reset idle timer
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      alert("Session expired due to inactivity.");
      logout();
    }, IDLE_LIMIT);
  }

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    if (!checkAuth()) {
      lockUI();
      window.location.replace("https://kbk-ops.github.io/kbkai/partner");
      return;
    }

    // Authenticated
    unlockUI();

    // Start idle timer
    ["click", "mousemove", "keypress", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, resetIdleTimer);
    });

    resetIdleTimer();
  });
})();
