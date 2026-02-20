const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbznk2j4jL7XS8CcubM2dOhpN60dMFR_syLmmxa7mYC0C-0K5dxfpdrcGNBCvPGHUx-0FQ/exec";

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const idNumberInput = document.getElementById("idNumber");
const pinInput = document.getElementById("pin");
const pinLabel = document.getElementById("pinLabel");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");
const nextBtn = document.getElementById("nextBtn");
const loginBtn = document.getElementById("loginBtn");

sessionStorage.clear();

let currentID = "";
let pinExists = false;

// STEP 1 – CHECK ID
nextBtn.onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();
  if (!id) return (errorEl.textContent = "ID required");

  nextBtn.disabled = true;
  loader.style.display = "block";

  const res = await fetch(WEBAPP_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getOfficer",
      id: id
    })
  });

  const result = await res.json();

  loader.style.display = "none";
  nextBtn.disabled = false;

  if (result.status !== "success") {
    errorEl.textContent = result.message;
    return;
  }

  currentID = id;
  pinExists = result.officer.pin && result.officer.pin.trim() !== "";

  pinLabel.textContent = pinExists ? "Enter 6-digit PIN" : "Create 6-digit PIN";

  step1.style.display = "none";
  step2.style.display = "block";
};

// STEP 2 – VERIFY OR CREATE PIN
loginBtn.onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();

  if (!/^\d{6}$/.test(pin)) return (errorEl.textContent = "6 digits only");

  loginBtn.disabled = true;
  loader.style.display = "block";

  const res = await fetch(WEBAPP_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "verifyPin",
      id: currentID,
      pin: pin
    })
  });

  const result = await res.json();

  loader.style.display = "none";
  loginBtn.disabled = false;

  if (result.status !== "success") {
    errorEl.textContent = result.message;
    return;
  }

  sessionStorage.setItem("memberID", result.officer.id);
  sessionStorage.setItem("fullName", result.officer.fullName);
  sessionStorage.setItem("auth", "true");
  sessionStorage.setItem("expiry", Date.now() + 3600000);

  window.location.replace("https://kbk-ops.github.io/kbkai/user/dashboard");
};
