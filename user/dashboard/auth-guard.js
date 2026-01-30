(function () {
  const LOGIN_PATH = "https://kbk-ops.github.io/OrganizationFund/user";

  // 🔒 HARD CHECK — runs immediately
  if (!sessionStorage.getItem("isLoggedIn")) {
    location.replace(LOGIN_PATH);
    return;
  }

  // 🔓 UNLOCK PAGE AS SOON AS POSSIBLE
  document.documentElement.style.visibility = "visible";

  // 🔓 UNLOCK APP AFTER DOM READY
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
    document.body.classList.remove("locked");
  });

  // 🚫 BLOCK BACK/FORWARD CACHE
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && !sessionStorage.getItem("isLoggedIn")) {
      location.replace(LOGIN_PATH);
    }
  });
})();
