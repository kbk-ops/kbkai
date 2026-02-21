function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  window.location.href = "../index.html";
}

function initDashboardTabs() {
  const savedTab = sessionStorage.getItem("activeTab");

  if (savedTab && document.getElementById(savedTab)) {
    showTab(savedTab);
  } else {
    showTab("homeTab");
  }
}

document.addEventListener("DOMContentLoaded", initDashboardTabs);
