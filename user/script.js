const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

const SHEET_MEMBER = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const SHEET_NAMEMEMBER = "Members";

const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_MEMBER}/values/${SHEET_NAMEMEMBER}!A:F?key=${API_KEY}`;

const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbyx6nI-1sF4nT0_8ICo8giRaDFKKPBBCqB9ld2MPdhxLnu8nGU8obYp0OTxUR_iSD_oBA/exec";

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");

sessionStorage.clear();

let currentID = "";
let pinExists = false;

// STEP 1
document.getElementById("nextBtn").onclick = async () => {
  const id = idNumberInput.value.trim();
  if (!id) return (errorEl.textContent = "ID required");

  const res = await fetch(MEMBERS_URL);
  const data = await res.json();
  const rows = data.values.slice(1);
  const member = rows.find((r) => r[0] == id);

  if (!member) return (errorEl.textContent = "ID not found");

  currentID = id;
  pinExists = member[5] && member[5].trim() !== "";
  pinLabel.textContent = pinExists ? "Enter 6-digit PIN" : "Create 6-digit PIN";

  step1.style.display = "none";
  step2.style.display = "block";
};

// STEP 2
document.getElementById("loginBtn").onclick = async () => {
  const pin = pinInput.value.trim();
  if (!/^\d{6}$/.test(pin)) return (errorEl.textContent = "6 digits only");

  const res = await fetch(MEMBERS_URL);
  const data = await res.json();
  const rows = data.values.slice(1);
  const member = rows.find((r) => r[0] == currentID);

  if (pinExists && member[5] !== pin)
    return (errorEl.textContent = "Wrong PIN");

  if (!pinExists) {
    await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({
        id: currentID,
        pin: pin
      })
    });
  }

  sessionStorage.setItem("memberID", currentID);
  sessionStorage.setItem("auth", "true");
  sessionStorage.setItem("expiry", Date.now() + 3600000);

  window.location.href = "https://kbk-ops.github.io/kbkai/user/dashboard";
};
