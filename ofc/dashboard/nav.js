// ----------- BOTTOM BAR + TABS -----------
/**
 * Show a tab by ID and handle dashboard logic
 * Keeps your filters, totals, etc.
 */
function showTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  
  // Show selected tab
  const target = document.getElementById(tabId);
  if (!target) return;
  target.classList.add("active");

  // If it's a tab that needs reset
  if (tabId === "homeTab" || tabId === "aboutTab") {
    if (typeof refreshFilterUI === "function") refreshFilterUI();
    const contriBody = document.getElementById("contriBody");
    if (contriBody) contriBody.innerHTML = '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
    const totalAmt = document.getElementById("totalAmt");
    if (totalAmt) totalAmt.textContent = "0";
  }

  // Highlight active bottom button
  document.querySelectorAll(".bottombar div").forEach(b => b.classList.remove("active"));
  const btnMap = {
    homeTab: 0,
    contributionTab: 1,
    aboutTab: 2
  };
  const btn = document.querySelectorAll(".bottombar div")[btnMap[tabId]];
  if (btn) btn.classList.add("active");
}

/**
 * Initialize bottom bar click events
 */
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
