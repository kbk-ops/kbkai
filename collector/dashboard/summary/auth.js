const SESSION_TIME = 3 * 60 * 1000;
const auth = sessionStorage.getItem("auth");
const lastActivity = sessionStorage.getItem("lastActivity");

if (!auth || !lastActivity) {
  sessionStorage.clear();
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
}

// update activity on any interaction
["click","mousemove","keydown","touchstart","scroll"].forEach(evt => {
  document.addEventListener(evt, () => {
    sessionStorage.setItem("lastActivity", Date.now());
  });
});

// idle checker
setInterval(() => {
  const now = Date.now();
  const last = parseInt(sessionStorage.getItem("lastActivity"));

  if (now - last > SESSION_TIME) {
    sessionStorage.clear();
    window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
  }
}, 10000);
