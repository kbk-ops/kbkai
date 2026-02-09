function goDashboard(tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  window.location.replace("https://kbk-ops.github.io/kbkai/ofc/dashboard");
}

/**
 * Initialize tabs on dashboard page based on sessionStorage
 * @param {function} showTabCallback - function that shows a tab by ID
 */
function initDashboardTabs(showTabCallback) {
  if (!showTabCallback) return;

  const tab = sessionStorage.getItem("activeTab");
  if (tab) {
    showTabCallback(tab); // call the dashboard function to show the correct tab
    sessionStorage.removeItem("activeTab");
  }
}

/**
 * Show a tab immediately on dashboard (or any page with tabs)
 * @param {string} tabId - ID of the tab to show
 */
function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(t => t.classList.remove("active"));

  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
}

/**
 * Optional: Initialize bottom bar button highlighting
 * Call this on dashboard after DOMContentLoaded
 */
function initBottomBarHighlight() {
  const buttons = document.querySelectorAll(".bottombar div");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// For dashboard page: run this on page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".tab-content")) {
    initDashboardTabs(showTab);
    initBottomBarHighlight();
  }
});
