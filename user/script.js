const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbyx6nI-1sF4nT0_8ICo8giRaDFKKPBBCqB9ld2MPdhxLnu8nGU8obYp0OTxUR_iSD_oBA/exec";

// ==============================
// ELEMENTS
// ==============================
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

// ==============================
// HELPER FUNCTION
// ==============================
async function callAPI(payload) {
  try {
    const response = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Network error");

    return await response.json();
  } catch (err) {
    console.error(err);
    throw new Error("Connection failed");
  }
}

// ==============================
// STEP 1: CHECK ID
// ==============================
nextBtn.onclick = async () => {
  errorEl.textContent = "";
  const id = idNumberInput.value.trim();

  if (!id) {
    errorEl.textContent = "ID required";
    return;
  }

  loader.style.display = "block";
  nextBtn.disabled = true;

  try {
    const result = await callAPI({
      action: "checkID",
      id: id
    });

    loader.style.display = "none";

    if (result.status !== "found") {
      errorEl.textContent = "ID not found";
      nextBtn.disabled = false;
      return;
    }

    currentID = id;
    pinExists = result.pin && result.pin.trim() !== "";

    pinLabel.textContent = pinExists
      ? "Enter 6-digit PIN"
      : "Create 6-digit PIN";

    step1.style.display = "none";
    step2.style.display = "block";
  } catch (err) {
    loader.style.display = "none";
    errorEl.textContent = err.message;
    nextBtn.disabled = false;
  }
};

// ==============================
// STEP 2: LOGIN / SET PIN
// ==============================
loginBtn.onclick = async () => {
  errorEl.textContent = "";
  const pin = pinInput.value.trim();

  if (!/^\d{6}$/.test(pin)) {
    errorEl.textContent = "6 digits only";
    return;
  }

  loader.style.display = "block";
  loginBtn.disabled = true;

  try {
    // If PIN exists, verify first
    if (pinExists) {
      const result = await callAPI({
        action: "checkID",
        id: currentID
      });

      if (result.pin !== pin) {
        loader.style.display = "none";
        errorEl.textContent = "Wrong PIN";
        loginBtn.disabled = false;
        return;
      }
    } else {
      // Save new PIN
      await callAPI({
        action: "setPIN",
        id: currentID,
        pin: pin
      });
    }

    // Success → create session
    sessionStorage.setItem("memberID", currentID);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("expiry", Date.now() + 3600000); // 1 hour

    window.location.replace("https://kbk-ops.github.io/kbkai/user/dashboard");
  } catch (err) {
    errorEl.textContent = err.message;
    loginBtn.disabled = false;
  }

  loader.style.display = "none";
};
