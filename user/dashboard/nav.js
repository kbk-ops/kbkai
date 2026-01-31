function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  location.replace = "../index.html";
}

function initDashboardTabs() {
  const tab = sessionStorage.getItem("activeTab");
  if (tab) {
    showTab(tab);
    sessionStorage.removeItem("activeTab");
  }
}
