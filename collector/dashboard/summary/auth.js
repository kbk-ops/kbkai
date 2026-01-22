// SESSION_TIMEOUT in milliseconds (same as dashboard)
const SESSION_TIME = 3 * 60 * 1000;

// check if user is authenticated
const isAuth = sessionStorage.getItem("auth");
const lastActivity = sessionStorage.getItem("lastActivity");

// redirect if not logged in
if (!isAuth || !lastActivity) {
  sessionStorage.clear();
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
}

// reset last activity on user interaction
["click","mousemove","keydown","touchstart","scroll"].forEach(evt => {
  document.addEventListener(evt, () => {
    sessionStorage.setItem("lastActivity", Date.now());
  });
});

// idle logout check every 10 seconds
setInterval(() => {
  const now = Date.now();
  const last = parseInt(sessionStorage.getItem("lastActivity"));
  if (now - last > SESSION_TIME) {
    sessionStorage.clear();
    window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
  }
}, 10000);
