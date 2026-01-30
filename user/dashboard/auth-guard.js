// auth-guard.js
(function () {

  function isAuthenticated() {
    const memberID = sessionStorage.getItem("memberID");
    const auth = sessionStorage.getItem("auth");
    const expiry = sessionStorage.getItem("expiry");
    return memberID && auth === "true" && Date.now() < expiry;
  }

  // 🔒 HARD BLOCK — runs immediately
  if (!isAuthenticated()) {
    location.replace("https://kbk-ops.github.io/OrganizationFund");
    return;
  }

  function unlockUI() {
    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
    document.body.classList.remove("locked");
  }

  // 🔓 UNLOCK ASAP
  unlockUI();

  // 🔓 UNLOCK AGAIN AFTER DOM (safe fallback)
  document.addEventListener("DOMContentLoaded", unlockUI);

  // 🚫 BLOCK BACK/FORWARD CACHE
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && !isAuthenticated()) {
      location.replace("https://kbk-ops.github.io/OrganizationFund");
    }
  });

})();
