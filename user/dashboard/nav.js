(function () {
  function showTab(id) {
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.remove("active"));

    const el = document.getElementById(id);
    if (el) el.classList.add("active");

    localStorage.setItem("activeTab", id);
  }

  function bindBottomBar() {
    const buttons = document.querySelectorAll(".bottombar div");

    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const target =
          this.getAttribute("data-tab") ||
          this.getAttribute("onclick")?.match(/'([^']+)'/)?.[1];

        if (target) showTab(target);
      });
    });
  }

  function restoreActiveTab() {
    const saved = localStorage.getItem("activeTab");
    if (saved && document.getElementById(saved)) {
      showTab(saved);
    }
  }

  function go(page) {
    window.location.replace(index.html);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindBottomBar();
    restoreActiveTab();
  });

  window.Nav = {
    showTab,
    go,
  };
})();
