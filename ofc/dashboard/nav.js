function goPage(url, tab = "homeTab") {
  sessionStorage.setItem("activeTab", tab);
  window.location.replace("https://kbk-ops.github.io/kbkai/ofc/dashboard");
}

// Initialize tabs on page load
function initTabs(showTabCallback) {
  const tab = sessionStorage.getItem("activeTab");
  if (tab && typeof showTabCallback === "function") {
    showTabCallback(tab); // call your page-specific function to show the tab
    sessionStorage.removeItem("activeTab");
  }
}
