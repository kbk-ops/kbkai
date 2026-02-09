function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  window.location.replace(
    "https://kbk-ops.github.io/kbkai/ofc/dashboard"
  );
}

function initDashboard() {
  const tab = sessionStorage.getItem("activeTab");
  if (tab) {
    showTab(tab);
    sessionStorage.removeItem("activeTab");
  }
}
