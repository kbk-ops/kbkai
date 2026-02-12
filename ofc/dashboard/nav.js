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

function initBottomBar() {
  const buttons = document.querySelectorAll(".bottombar div");
  const tabMap = ["homeTab", "contributionTab", "aboutTab"];

  buttons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      showTab(tabMap[i]);
    });
  });

  // Set initial active based on currently visible tab
  const currentTab = document.querySelector(".tab-content.active");
  if (currentTab) {
    const index = tabMap.indexOf(currentTab.id);
    if (index !== -1) buttons[index].classList.add("active");
  }
}

// Run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initBottomBar();
});
