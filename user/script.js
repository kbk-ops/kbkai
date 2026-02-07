const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

// MEMBERS (CHECK USER HERE)
const SHEET_MEMBER = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const SHEET_NAMEMEMBER = "Members";

// RAW DATA (WRITE PIN HERE VIA WEB APP)
const SHEET_DATA = "1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAMEDATA = "Raw_Data";

// READ MEMBERS
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_MEMBER}/values/${SHEET_NAMEMEMBER}!A:F?key=${API_KEY}`;

// WRITE DATA
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbyx6nI-1sF4nT0_8ICo8giRaDFKKPBBCqB9ld2MPdhxLnu8nGU8obYp0OTxUR_iSD_oBA/exec";

// DOM
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");

// FORCE LOGOUT
sessionStorage.clear();

let currentID = "";
let pinExists = false;
let memberRow = null;

// STEP 1 – CHECK MEMBER
document.getElementById("nextBtn").onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();

  if (!id) {
    errorEl.textContent = "ID Number is required";
    return;
  }

  try {
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();

    const rows = data.values.slice(1); // skip header
    memberRow = rows.find((r) => r[0] === id);

    if (!memberRow) {
      errorEl.textContent = "ID not found";
      return;
    }

    currentID = id;
    pinExists = memberRow[5] && memberRow[5].trim() !== "";

    pinLabel.textContent = pinExists ? "Enter PIN" : "Create 4-digit PIN";

    pinInput.value = "";

    step1.style.display = "none";
    step2.style.display = "block";
    step2.classList.remove("animate-fade");
    void step2.offsetWidth;
    step2.classList.add("animate-fade");
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Error fetching members";
  }
};

// STEP 2 – LOGIN / CREATE PIN
document.getElementById("loginBtn").onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();

  if (!/^\d{4}$/.test(pin)) {
    errorEl.textContent = "PIN must be 4 digits";
    return;
  }

  try {
    // RECHECK MEMBER FOR SAFETY
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();
    const rows = data.values.slice(1);
    const member = rows.find((r) => r[0] === currentID);

    if (!member) {
      errorEl.textContent = "Member not found";
      return;
    }

    // EXISTING PIN → VALIDATE
    if (pinExists && member[5] !== pin) {
      errorEl.textContent = "Incorrect PIN";
      return;
    }

    // NEW PIN → WRITE TO RAW_DATA
    if (!pinExists) {
      await fetch(WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pin",
          id: currentID,
          pin: pin
        })
      });
    }

    sessionStorage.setItem("memberID", currentID);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("expiry", Date.now() + 3600000);

    window.location.replace("https://kbk-ops.github.io/kbkai/user/dashboard");
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Login failed";
  }
};
