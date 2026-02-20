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

let currentMember = null;

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
        action: "getMember",
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

    currentMember = data.member;

    pinLabel.textContent = currentMember.pin
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
        id: currentMember.id,
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

    const member = data.member;

    sessionStorage.setItem("memberID", member.id);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("expiry", Date.now() + 3600000);
    sessionStorage.setItem("FirstName", member.firstName);
    sessionStorage.setItem("FullName", member.fullName);
    sessionStorage.setItem("Brgy", member.brgy);
    sessionStorage.setItem("District", member.district);

    window.location.replace("https://kbk-ops.github.io/kbkai/user/dashboard");
  } catch (err) {
    loader.style.display = "none";
    errorEl.textContent = "Connection failed";
    loginBtn.disabled = false;
  }
};
