const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const SHEET_NAME = "Members";
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:E?key=${API_KEY}`;
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyUfWGCuStXo5TmBXIPmfiPL7e84STdYPU7QX-eGyfjzWKSWCaiRVkRTcZ9A7tXDTk/exec";

// Elements
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");

let currentID = "";
let pinExists = false;

// Step 1: check ID
document.getElementById("nextBtn").addEventListener("click", async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();
  if(!id){ errorEl.textContent = "ID Number is required"; return; }

  try {
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();
    const rows = data.values.slice(1); // skip header

    const member = rows.find(r => r[0] === id);
    if(!member){ errorEl.textContent = "ID not found"; return; }

    currentID = id;
    pinExists = member[4] && member[4].trim() !== "";

    // update step 2
    pinLabel.textContent = pinExists ? "Enter PIN" : "Create 4-digit PIN";
    pinInput.value = "";
    step1.style.display = "none";
    step2.style.display = "block";
  } catch(err){
    errorEl.textContent = "Error fetching data";
    console.error(err);
  }
});

// Step 2: login / create PIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const pin = pinInput.value.trim();
  if(!pin || !/^\d{4}$/.test(pin)){ errorEl.textContent = "PIN must be 4 digits"; return; }

  if(pinExists){
    // verify PIN
    try {
      const res = await fetch(MEMBERS_URL);
      const data = await res.json();
      const rows = data.values.slice(1);
      const member = rows.find(r => r[0] === currentID);
      if(member[4] === pin){
        sessionStorage.setItem("memberID", currentID);
        sessionStorage.setItem("auth", "true");
        window.location.href = "https://kbk-ops.github.io/OrganizationFund/user/dashboard";
      } else {
        errorEl.textContent = "Incorrect PIN";
      }
    } catch(err){
      errorEl.textContent = "Error verifying PIN";
    }
  } else {
    // save new PIN
    try {
      const WEBAPP_URL = "YOUR_GOOGLE_APPSCRIPT_WEBAPP_URL"; // must create a POST endpoint to update sheet
      const payload = { id: currentID, pin: pin };
      await fetch(WEBAPP_URL, { method: "POST", body: JSON.stringify(payload) });

      sessionStorage.setItem("memberID", currentID);
      sessionStorage.setItem("auth", "true");
      window.location.href = "https://kbk-ops.github.io/OrganizationFund/user/dashboard";
    } catch(err){
      errorEl.textContent = "Error saving PIN";
    }
  }
});
