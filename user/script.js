const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const SHEET_NAME = "Members"; 
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:E?key=${API_KEY}`;
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwVpd3KLk1aCiCY44PTRePlzL-l8JEDRqh8mBKigCNznX6L6FqvgWL77AbhV-OQKLXG/exec";

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");

let currentID = "";
let pinExists = false;

document.getElementById("nextBtn").onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();
  if(!id) return errorEl.textContent = "ID Number is required";

  const res = await fetch(MEMBERS_URL);
  const data = await res.json();
  const rows = data.values.slice(1);
  const member = rows.find(r => r[0] == id);

  if(!member) return errorEl.textContent = "ID not found";

  currentID = id;
  pinExists = member[4] && member[4].trim() !== "";

  pinLabel.textContent = pinExists ? "Enter PIN" : "Create 4-digit PIN";
  pinInput.value = "";
  step1.style.display = "none";
  step2.style.display = "block";
};

document.getElementById("loginBtn").onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();
  if(!/^\d{4}$/.test(pin)) return errorEl.textContent = "PIN must be 4 digits";

  const res = await fetch(MEMBERS_URL);
  const data = await res.json();
  const rows = data.values.slice(1);
  const member = rows.find(r => r[0] == currentID);

  if(pinExists){
    if(member[4] !== pin) return errorEl.textContent = "Incorrect PIN";
  } else {
    await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({
        type:"pin",
        id: currentID,
        pin: pin
      })
    });
  }

  sessionStorage.setItem("memberID", currentID);
  sessionStorage.setItem("auth", "true");
  sessionStorage.setItem("expiry", Date.now() + (60*60*1000));
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/user/dashboard";
};
