(function () {
  // 1️⃣ Check login immediately before anything renders
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    // Redirect instantly if not logged in
    location.replace("https://kbk-ops.github.io/OrganizationFund/user/index.html");
    return;
  }

  // 2️⃣ Reveal page after DOM content is loaded
  window.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.visibility = "visible";

    const app = document.getElementById("app");
    if (app) app.classList.remove("hidden");
    document.body.classList.remove("locked");
  });

  // 3️⃣ Handle Back-Forward Cache (BFCache)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && !sessionStorage.getItem("isLoggedIn")) {
      location.replace("https://kbk-ops.github.io/OrganizationFund/user/index.html");
    }
  });
})();
