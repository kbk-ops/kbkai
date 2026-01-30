/* ======================================
   AUTH GUARD — FLASH-SAFE + COMPATIBLE
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

  /* ---------- HIDE IMMEDIATELY ---------- */
  const html = document.documentElement;
  html.style.visibility = "hidden";

  /* ---------- HARD AUTH CHECK ---------- */
  if (!isAuthorized()) {
    redirectToLogin();
    return;
  }

  /* ---------- GUARANTEED UNHIDE ---------- */
  function unhide() {
    html.style.visibility = "visible";
  }

  // Works even if DOM already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", unhide);
  } else {
    unhide();
  }

  // Extra safety: unhide again after full load
  window.addEventListener("load", unhide);

  /* ---------- BACK/FORWARD CACHE ---------- */
  window.addEventListener("pageshow", e => {
    if (e.persisted && !isAuthorized()) {
      redirectToLogin();
    } else {
      unhide();
    }
  });
})();
