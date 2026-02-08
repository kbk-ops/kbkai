const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

const SHEET_MEMBER = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const SHEET_NAMEMEMBER = "Officers";

const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_MEMBER}/values/${SHEET_NAMEMEMBER}!A:G?key=${API_KEY}`;

const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbyx6nI-1sF4nT0_8ICo8giRaDFKKPBBCqB9ld2MPdhxLnu8nGU8obYp0OTxUR_iSD_oBA/exec";

// DOM Elements
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");
const nextBtn = document.getElementById("nextBtn");
const loginBtn = document.getElementById("loginBtn");

// Clear previous session
sessionStorage.clear();

let currentID = "";
let pinExists = false;

// --------------------
// STEP 1: Enter ID
// --------------------
nextBtn.onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();
  if (!id) return (errorEl.textContent = "ID required");

  nextBtn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();
    const rows = data.values.slice(1);
    const member = rows.find((r) => r[0] == id);

    loader.style.display = "none";

    if (!member) {
      errorEl.textContent = "ID not found";
      nextBtn.disabled = false;
      return;
    }

    currentID = id;
    pinExists = member[6] && member[6].trim() !== "";
    pinLabel.textContent = pinExists ? "Enter 6-digit PIN" : "Create 6-digit PIN";

    step1.style.display = "none";
    step2.style.display = "block";

  } catch (err) {
    console.error(err);
    loader.style.display = "none";
    errorEl.textContent = "Failed to fetch officer data.";
    nextBtn.disabled = false;
  }
};

// --------------------
// STEP 2: Enter PIN
// --------------------
loginBtn.onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();

  if (!/^\d{6}$/.test(pin)) return (errorEl.textContent = "6 digits only");

  loginBtn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();
    const rows = data.values.slice(1);
    const member = rows.find((r) => r[0] == currentID);

    if (pinExists && member[6] !== pin) {
      errorEl.textContent = "Wrong PIN";
      loginBtn.disabled = false;
      loader.style.display = "none";
      return;
    }

    // If creating PIN for first time
    if (!pinExists) {
      await fetch(WEBAPP_URL, {
        method: "POST",
        body: JSON.stringify({
          id: currentID,
          pin: pin
        })
      });
    }

    // ------------------------------
    // STORE OFFICER INFO IN SESSION
    // ------------------------------
    sessionStorage.setItem("memberID", currentID);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("expiry", Date.now() + 3600000);

    sessionStorage.setItem("officerFirstName", member[1]); // Column B = first name
    sessionStorage.setItem("officerFullName", member[2]);  // Column C = full name
    sessionStorage.setItem("officerBrgy", member[3]);      // Column D = barangay
    sessionStorage.setItem("officerDistrict", member[4]);  // Column E = district

    // Redirect to dashboard
    window.location.replace("https://kbk-ops.github.io/kbkai/ofc/dashboard");

  } catch (err) {
    console.error(err);
    loader.style.display = "none";
    errorEl.textContent = "Failed to fetch officer data.";
    loginBtn.disabled = false;
  }
};
