// ============================
// CONFIG
// ============================
const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:E?key=${API_KEY}`;
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxKd8f5PBv7_mKTUe03iIrxt3RAkU35b-9oXN-4cr9aUsXFwhb74rq6499TRdrHku-o/exec";
const loader = document.getElementById("loader");
const submitBtn = document.getElementById("submitBtn");

// Officer ID from login session
const collectorID = sessionStorage.getItem("memberID");

// ============================
// HELPER: CLEAR FIELDS
// ============================
function clearFields() {
  document.getElementById("idNumber").value = "";
  document.getElementById("fullName").value = "";
  document.getElementById("brgy").value = "";
  document.getElementById("dist").value = "";
  document.getElementById("year").value = "2026";
  document.getElementById("month").value = "";
  document.getElementById("amount").value = "30";
}

// ============================
// QR SCANNER
// ============================
let html5Qr;
let cameraOn = false;

const toggleBtn = document.getElementById("toggleCam");
toggleBtn.onclick = async function () {
  if (!cameraOn) {
    html5Qr = new Html5Qrcode("reader");
    await html5Qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (qr) => {
        document.getElementById("idNumber").value = qr;
        loadMember();
        navigator.vibrate(200);
        new Audio(
          "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
        ).play();
        html5Qr.stop();
        cameraOn = false;
        toggleBtn.textContent = "Scan";
      }
    );
    cameraOn = true;
    toggleBtn.textContent = "Stop";
  } else {
    await html5Qr.stop();
    cameraOn = false;
    toggleBtn.textContent = "Scan";
  }
};

// ============================
// LOAD MEMBER INFO
// ============================
document.getElementById("idNumber").addEventListener("change", loadMember);

async function loadMember() {
  const id = document.getElementById("idNumber").value.trim();

  // If ID is empty, clear all fields
  if (!id) {
    clearFields();
    return;
  }

  try {
    const res = await fetch(MEMBERS_URL);
    const data = await res.json();

    // Columns: A=ID, C=Name, D=Barangay, E=District
    const row = data.values.find((r) => r[0] == id);

    if (row) {
      document.getElementById("fullName").value = row[2] || ""; // Name
      document.getElementById("brgy").value = row[3] || ""; // Barangay
      document.getElementById("dist").value = row[4] || ""; // District
    } else {
      clearFields();
      alert("ID not found");
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching member data");
  }
}

// ============================
// Loader
// ============================

function showLoader() {
  loader.style.display = "block";
  submitBtn.disabled = true;
}

function hideLoader() {
  loader.style.display = "none";
  submitBtn.disabled = false;
}

// ============================
// SUBMIT DATA
// ============================
async function submitData() {
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";
  errorEl.style.color = "red";

  // VALIDATION
  if (!document.getElementById("idNumber").value.trim()) {
    errorEl.textContent = "ID Number is required";
    return;
  }
  if (!document.getElementById("fullName").value.trim()) {
    errorEl.textContent = "Name is required";
    return;
  }
  if (!document.getElementById("month").value.trim()) {
    errorEl.textContent = "Month is required";
    return;
  }

  if (!confirm("Do you want to submit?")) return;

  const payload = {
    id: document.getElementById("idNumber").value.trim(),
    name: document.getElementById("fullName").value.trim(),
    brgy: document.getElementById("brgy").value.trim(),
    dist: document.getElementById("dist").value.trim(),
    year: document.getElementById("year").value.trim(),
    month: document.getElementById("month").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    collector: collectorID
  };

  showLoader();

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    hideLoader();

    if (res.ok) {
      errorEl.style.color = "green";
      errorEl.textContent = "successfully recorded";
      clearFields();

      setTimeout(() => {
        errorEl.textContent = "";
      }, 6000);
    } else {
      errorEl.textContent = "Failed to record";
    }
  } catch (err) {
    hideLoader();
    console.error(err);
    errorEl.textContent = "Error connecting to server";
  }
}

// ============================
// OPTIONAL: RELOAD PAGE FUNCTION
// ============================
function reloadPage() {
  if (confirm("Do you want to reload this page?")) clearFields();
}
