const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const SHEET_NAME = "Collectors";
const DEFAULT_PASSWORD = "Letmein123#";
const SESSION_TIME = 5 * 60 * 1000; // 5 minutes

// clear fields on back/refresh
window.onload = () => {
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  sessionStorage.clear();
};

document.getElementById("loginBtn").onclick = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  errorEl.textContent = "";

  if (!username || password !== DEFAULT_PASSWORD) {
    errorEl.textContent = "incorrect username or password";
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:A?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const ids = data.values.slice(1).map(r => r[0].toString().trim());

    if (ids.includes(username)) {
      const expiry = Date.now() + SESSION_TIME;
      sessionStorage.setItem("auth", "true");
      sessionStorage.setItem("expiry", expiry);
      sessionStorage.setItem("collectorID", username);
      window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector/dashboard";
    } else {
      errorEl.textContent = "incorrect username or password";
    }
  } catch {
    errorEl.textContent = "incorrect username or password";
  }
};
