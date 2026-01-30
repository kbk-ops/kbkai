/* ======================================
   AUTH GUARD — FINAL (UNLOCKS #app)
   ====================================== */
(function () {
  const LOGIN_URL = "https://kbk-ops.github.io/OrganizationFund";

  function isAuthorized() {
    const memberID = sessionStorage.getItem("memberID");
    const auth = sessionStorage.getItem("auth");
    const expiry = sessionStorage.getItem("expiry");

    return (
      memberID &&
      auth === "true" &&
      expiry &&
      Date.now() < Number(expiry)
    );
  }

  function redirectToLogin() {
    sessionStorage.clear();
    location.replace(LOGIN_URL);
  }

  // Hide everything immediately (prevents flash)
  document.documentElement.style.visibility = "hidden";

  // Hard auth check
  if (!isAuthorized()) {
    redirectToLogin();
    return;
  }

  // 🔓 UNLOCK PAGE (THIS WAS MISSING)
  function unlockPage() {
    document.documentElement.style.visibility = "visible";

    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");

    document.body.classList.remove("locked");
  }

  // Run unlock safely
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", unlockPage);
  } else {
    unlockPage();
  }

  // Back/forward cache protection
  window.addEventListener("pageshow", e => {
    if (e.persisted && !isAuthorized()) {
      redirectToLogin();
    } else {
      unlockPage();
    }
  });
})();
