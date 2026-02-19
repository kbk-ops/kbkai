(function () {
  const IDLE_LIMIT = 15 * 60 * 1000;
  let idleTimer;

  // Check if user is logged in
  function checkAuth() {
    const session = localStorage.getItem("userSession");
    const username = localStorage.getItem("username");

    if (!session || !username) {
      // Not logged in → redirect to login
      window.location.replace("https://kbk-ops.github.io/kbkai/partner");
      return false;
    }
    return true;
  }

  // Logout function
  window.logout = function () {
    localStorage.removeItem("userSession");
    localStorage.removeItem("username");
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

  // Initialize
  if (checkAuth()) {
    // Show the app
    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");

    // Start idle timer
    ["click", "mousemove", "keypress", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, resetIdleTimer);
    });
    resetIdleTimer();
  }
})();
