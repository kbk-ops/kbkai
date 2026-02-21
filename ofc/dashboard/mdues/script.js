const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycby1yoiBk6Hryg7chjKjA-f0Bzvskd5vBH30vNod7G0nzPAZPEb2SwYzAWMiGkq5afIl/exec";

const loader = document.getElementById("loader");
const submitBtn = document.getElementById("submitBtn");

// ============================
// OFFICER LOGIN STORAGE
// ============================
const collectorID = sessionStorage.getItem("memberID");
const officerFullname = sessionStorage.getItem("officerFullName");

// ============================
// CLEAR FIELDS
// ============================
function clearFields(keepId = false) {
  if (!keepId) {
    document.getElementById("idNumber").value = "";
  }
  document.getElementById("fullName").value = "";
  document.getElementById("brgy").value = "";
  document.getElementById("dist").value = "";
  document.getElementById("month").value = "";
  // Keep year and amount as defaults
  document.getElementById("year").value = "2026";
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
// LOAD MEMBER
// ============================
document.getElementById("idNumber").addEventListener("input", function () {
  const id = this.value.trim();
  // Only trigger if the ID is a certain length to avoid spamming the server
  if (id.length >= 5) {
    loadMember();
  }
});

async function loadMember() {
  const id = document.getElementById("idNumber").value.trim();
  const statusEl = document.getElementById("idStatus"); // The new message element

  // 1. Reset state
  statusEl.textContent = "";
  if (!id) {
    clearFields();
    return;
  }

  // ============================
  // CLEAR DATA ON ID CHANGE
  // ============================
  document.getElementById("fullName").value = "";
  document.getElementById("brgy").value = "";
  document.getElementById("dist").value = "";

  if (id.length < 12) return;

  showLoader();

  try {
    const res = await fetch(
      WEBAPP_URL + "?action=getMember&id=" + encodeURIComponent(id)
    );
    const data = await res.json();

    if (data.status === "success") {
      // FOUND: Fill fields and ensure message is empty
      document.getElementById("fullName").value = data.member.name || "";
      document.getElementById("brgy").value = data.member.brgy || "";
      document.getElementById("dist").value = data.member.dist || "";
      statusEl.textContent = "";
    } else {
      // NOT FOUND: Show the error message
      statusEl.style.color = "red";
      statusEl.textContent = "❌ Member not found";
    }
  } catch (err) {
    statusEl.textContent = "⚠️ Connection error";
  } finally {
    hideLoader();
  }
}

// ============================
// LOADER
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
// SUBMIT DATA (SECURE)
// ============================
async function submitData() {
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";
  errorEl.style.color = "red";

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
    action: "submitDues",
    id: document.getElementById("idNumber").value.trim(),
    name: document.getElementById("fullName").value.trim(),
    brgy: document.getElementById("brgy").value.trim(),
    dist: document.getElementById("dist").value.trim(),
    year: document.getElementById("year").value.trim(),
    month: document.getElementById("month").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    collector: officerFullname
  };

  showLoader();

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    hideLoader();

    if (result.status === "success") {
      errorEl.style.color = "green";
      errorEl.textContent = "successfully recorded";
      clearFields();
      setTimeout(() => (errorEl.textContent = ""), 5000);
    } else {
      errorEl.textContent = "Failed to record";
    }
  } catch (err) {
    hideLoader();
    errorEl.textContent = "Error connecting to server";
  }
}

function reloadPage() {
  if (confirm("Do you want to reload this page?")) clearFields();
}
