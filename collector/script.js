const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const SHEET_NAME = "Collector";
const DEFAULT_PASSWORD = "Letmein123#";

document.getElementById("loginBtn").onclick = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error");

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "incorrect username or password";
    return;
  }

  if (password !== DEFAULT_PASSWORD) {
    errorEl.textContent = "incorrect username or password";
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values.flat();

    if (rows.includes(username)) {
      window.location.href = "https://kbk-ops.github.io/OrganizationFund/collectordashb";
    } else {
      errorEl.textContent = "incorrect username or password";
    }
  } catch (err) {
    errorEl.textContent = "incorrect username or password";
  }
};
