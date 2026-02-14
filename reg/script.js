const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

const SHEET_ID = "1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAME = "Raw_Data";

const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:Z?key=${API_KEY}`;

// DOM Elements
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const emailInput = document.getElementById("email");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");
const nextBtn = document.getElementById("nextBtn");
const continueBtn = document.getElementById("continueBtn");

// Clear previous session
sessionStorage.clear();

let currentReferrer = "";
let sheetRows = [];

// -------------------------
// STEP 1: Validate Referrer
// -------------------------
nextBtn.onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();

  if (!id) {
    errorEl.textContent = "Referrer ID required";
    return;
  }

  nextBtn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();
    sheetRows = data.values.slice(1);

    const member = sheetRows.find((r) => r[0] == id);

    loader.style.display = "none";

    if (!member) {
      errorEl.textContent = "Referrer ID not found";
      nextBtn.disabled = false;
      return;
    }

    if (member[21] !== "Active") {
      // Column V = index 21
      errorEl.textContent = "Referrer is not Active";
      nextBtn.disabled = false;
      return;
    }

    currentReferrer = id;

    step1.style.display = "none";
    step2.style.display = "block";
  } catch (err) {
    loader.style.display = "none";
    errorEl.textContent = "Failed to validate Referrer.";
    nextBtn.disabled = false;
  }
};

// ----------------------
// STEP 2: Validate Email
// ----------------------
continueBtn.onclick = () => {
  errorEl.textContent = "";
  const email = emailInput.value.trim().toLowerCase();

  if (!validateEmail(email)) {
    errorEl.textContent = "Invalid email";
    return;
  }

  // ---------------------------
  // Check uniqueness (Column C)
  // ---------------------------
  const emailExists = sheetRows.some((r) => r[2]?.toLowerCase() === email);

  if (emailExists) {
    errorEl.textContent = "Email already registered";
    return;
  }

  // ---------------
  // Save to session
  // ---------------
  sessionStorage.setItem("referrerID", currentReferrer);
  sessionStorage.setItem("registerEmail", email);

  // --------
  // Redirect
  // --------
  window.location.replace("https://kbk-ops.github.io/kbkai/reg/form");
};

// ----------------
// Email validation
// ----------------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
