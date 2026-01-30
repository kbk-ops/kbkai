(function () {
  const memberID = sessionStorage.getItem("memberID");
  const auth = sessionStorage.getItem("auth");
  const expiry = sessionStorage.getItem("expiry");

  if (!memberID || auth !== "true" || Date.now() > expiry) {
    sessionStorage.clear();
    location.replace("https://kbk-ops.github.io/OrganizationFund");
  }

  // Kill back/forward cache
  window.addEventListener("pageshow", e => {
    if (e.persisted) {
      sessionStorage.clear();
      location.replace("https://kbk-ops.github.io/OrganizationFund");
    }
  });
})();
