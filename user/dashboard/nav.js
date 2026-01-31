function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  location.href = "https://kbk-ops.github.io/OrganizationFund/user/dashboard/";
}

function initDashboardTabs() {
  const tab = sessionStorage.getItem("activeTab");
  if (tab) {
    showTab(tab);
    sessionStorage.removeItem("activeTab");
  }
}
