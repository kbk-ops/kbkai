const DRIVE_API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const FOLDER_ID =
  "1-xXJOC-_ntlt4bYyfItlnmXSudUjZPr0-3HkoIB4EplM8rlsDci2RPZll_9kbbRvL95R2Xet";
const SHEET_ID = "1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAME = "Raw_Data";
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwAI7gXqEs_AqzPIs-L-ksTYRH9t2EWK7dMiY4OHil6pfbcMvqoypqVBmVjy0cu7_fcdg/exec";

// ===== GET STORED DATA =====
const storedEmail = sessionStorage.getItem("registerEmail");
const storedReferrerID = sessionStorage.getItem("referrerID");

let referrerFullName = "";

// ===== FETCH REFERRER FULL NAME =====
async function fetchReferrerName() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:H?key=${SHEET_API_KEY}`
  );
  const data = await res.json();

  const rows = data.values.slice(1);
  const match = rows.find((r) => r[0] == storedReferrerID);

  if (match) {
    referrerFullName = match[7]; // Column H index 7
  }
}

fetchReferrerName();

// ===== DEVICE DETECTION =====
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const mobileSection = document.getElementById("mobileSection");
const desktopSection = document.getElementById("desktopSection");

if (isMobile) {
  mobileSection.classList.remove("hidden");
  startCamera();
} else {
  desktopSection.classList.remove("hidden");
}

// ===== CAMERA =====
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const captureBtn = document.getElementById("captureBtn");
const switchBtn = document.getElementById("switchBtn");

let stream;
let useFront = true;
let imageBlob = null;

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: useFront ? "user" : "environment" }
  });
  video.srcObject = stream;
}

if (captureBtn) {
  captureBtn.onclick = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        imageBlob = blob;
        preview.src = URL.createObjectURL(blob);
        preview.classList.remove("hidden");
        video.classList.add("hidden");
      },
      "image/jpeg",
      0.9
    );
  };

  switchBtn.onclick = () => {
    useFront = !useFront;
    stream.getTracks().forEach((t) => t.stop());
    startCamera();
  };
}

// ===== DESKTOP UPLOAD =====
const fileInput = document.getElementById("fileInput");
const desktopPreview = document.getElementById("desktopPreview");

if (fileInput) {
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      imageBlob = file;
      desktopPreview.src = URL.createObjectURL(file);
      desktopPreview.classList.remove("hidden");
    }
  };
}

// ===== SUBMIT =====
const submitBtn = document.getElementById("submitBtn");
const loader = document.getElementById("loader");

submitBtn.onclick = async () => {
  if (!imageBlob) {
    alert("Please capture or upload photo.");
    return;
  }

  loader.style.display = "block";
  submitBtn.disabled = true;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const fileName = `${firstName}_${lastName}.jpeg`;

  // Convert image to Base64
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64 = reader.result.split(",")[1];

    const payload = {
      email: storedEmail,
      firstName: firstName,
      middleName: document.getElementById("middleName").value,
      lastName: lastName,
      suffix: document.getElementById("suffix").value,
      address: document.getElementById("address").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      phone: document.getElementById("phone").value,
      barangay: document.getElementById("barangay").value,
      precinct: document.getElementById("precinct").value,
      designation: document.getElementById("designation").value,
      referrerID: storedReferrerID,
      referrerName: referrerFullName,
      fileName: fileName,
      imageBase64: base64
    };

    await fetch(WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });

    loader.style.display = "none";
    alert("Registration Successful!");
  };

  reader.readAsDataURL(imageBlob);
};
