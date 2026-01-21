const isAuth = sessionStorage.getItem("auth");
const expiry = sessionStorage.getItem("expiry");

if (!isAuth || !expiry || Date.now() > expiry) {
  sessionStorage.clear();
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
}

setTimeout(() => {
  sessionStorage.clear();
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector";
}, expiry - Date.now());
