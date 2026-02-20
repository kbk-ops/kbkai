const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbznk2j4jL7XS8CcubM2dOhpN60dMFR_syLmmxa7mYC0C-0K5dxfpdrcGNBCvPGHUx-0FQ/exec";

// DOM
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

let currentOfficer = null;

// STEP 1
nextBtn.onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();
  if (!id) return (errorEl.textContent = "ID required");

  nextBtn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getOfficer",
        id: id
      })
    });

    const data = await res.json();
    loader.style.display = "none";

    if (data.status !== "success") {
      errorEl.textContent = "ID Number not found";
      nextBtn.disabled = false;
      return;
    }

    currentOfficer = data.officer;

    pinLabel.textContent = currentOfficer.pin
      ? "Enter 6-digit PIN"
      : "Create 6-digit PIN";

    step1.style.display = "none";
    step2.style.display = "block";
  } catch (err) {
    loader.style.display = "none";
    errorEl.textContent = "Connection failed";
    nextBtn.disabled = false;
  }
};

// STEP 2
loginBtn.onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();

  if (!/^\d{6}$/.test(pin)) return (errorEl.textContent = "6 digits only");

  loginBtn.disabled = true;
  loader.style.display = "block";

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "verifyPin",
        id: currentOfficer.id,
        pin: pin
      })
    });

    const data = await res.json();
    loader.style.display = "none";

    if (data.status !== "success") {
      errorEl.textContent = data.message;
      loginBtn.disabled = false;
      return;
    }

    const officer = data.officer;

    sessionStorage.setItem("memberID", officer.id);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("expiry", Date.now() + 3600000);
    sessionStorage.setItem("officerFirstName", officer.firstName);
    sessionStorage.setItem("officerFullName", officer.fullName);
    sessionStorage.setItem("officerBrgy", officer.brgy);
    sessionStorage.setItem("officerDistrict", officer.district);

    window.location.replace("https://kbk-ops.github.io/kbkai/ofc/dashboard");
  } catch (err) {
    loader.style.display = "none";
    errorEl.textContent = "Connection failed";
    loginBtn.disabled = false;
  }
};
