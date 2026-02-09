// Navigate and remember which tab to open
function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  window.location.replace("https://kbk-ops.github.io/kbkai/ofc/dashboard");
}

// Initialize tabs on page load
function initDashboardTabs() {
  const tab = sessionStorage.getItem("activeTab");
  if (tab) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    const target = document.getElementById(tab);
    if(target) target.classList.add("active");
    sessionStorage.removeItem("activeTab");
  }
}
