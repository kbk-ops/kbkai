/* ===============================
   AUTH GUARD (DASHBOARD PAGES)
   =============================== */
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

  /* ---------- IMMEDIATE BLOCK ---------- */
  if (!isAuthorized()) {
    redirectToLogin();
    return;
  }

  /* ---------- HIDE CONTENT UNTIL AUTH ---------- */
  document.documentElement.style.visibility = "hidden";

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.visibility = "visible";
  });

  /* ---------- BACK/FORWARD CACHE PROTECTION ---------- */
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && !isAuthorized()) {
      redirectToLogin();
    }
  });

  /* ---------- EXPOSE GLOBAL LOGOUT ---------- */
  window.logout = function () {
    // Instantly hide UI (prevents flash)
    document.documentElement.style.visibility = "hidden";

    sessionStorage.clear();
    location.replace(LOGIN_URL);
  };
})();
