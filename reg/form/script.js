document.addEventListener("DOMContentLoaded", function () {
  
const DRIVE_API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const FOLDER_ID =
  "1-xXJOC-_ntlt4bYyfItlnmXSudUjZPr0-3HkoIB4EplM8rlsDci2RPZll_9kbbRvL95R2Xet";
const SHEET_ID = "1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAME = "Raw_Data";
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbwAI7gXqEs_AqzPIs-L-ksTYRH9t2EWK7dMiY4OHil6pfbcMvqoypqVBmVjy0cu7_fcdg/exec";




  // ===== STORED DATA =====
  const storedEmail = sessionStorage.getItem("registerEmail");
  const storedReferrerID = sessionStorage.getItem("referrerID");
  let referrerFullName = "";

  // ===== ELEMENTS =====
  const mobileSection = document.getElementById("mobileSection");
  const desktopSection = document.getElementById("desktopSection");

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");
  const captureBtn = document.getElementById("captureBtn");
  const switchBtn = document.getElementById("switchBtn");

  const fileInput = document.getElementById("fileInput");
  const desktopPreview = document.getElementById("desktopPreview");

  const submitBtn = document.getElementById("submitBtn");
  const loader = document.getElementById("loader");

  // ===== CAMERA STATE =====
  let stream = null;
  let useFront = true;
  let imageBlob = null;

  // ===== FETCH REFERRER NAME =====
  async function fetchReferrerName() {
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:H?key=${SHEET_API_KEY}`
      );
      const data = await res.json();

      if (!data.values) return;

      const rows = data.values.slice(1);
      const match = rows.find(r => r[0] == storedReferrerID);

      if (match) {
        referrerFullName = match[7];
      }
    } catch (err) {
      console.error("Referrer fetch error:", err);
    }
  }

  fetchReferrerName();

  // ===== DEVICE DETECTION =====
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    mobileSection?.classList.remove("hidden");
  } else {
    desktopSection?.classList.remove("hidden");
  }

  // ===== START CAMERA =====
  async function startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported on this device.");
        return;
      }

      // Stop previous stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useFront ? "user" : { ideal: "environment" }
        },
        audio: false
      });

      video.srcObject = stream;
      await video.play();

    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access failed: " + err.message);
    }
  }

  // ===== CAPTURE PHOTO =====
  captureBtn?.addEventListener("click", function () {
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      imageBlob = blob;
      preview.src = URL.createObjectURL(blob);
      preview.classList.remove("hidden");
      video.classList.add("hidden");
    }, "image/jpeg", 0.9);
  });

  // ===== SWITCH CAMERA =====
  switchBtn?.addEventListener("click", function () {
    useFront = !useFront;
    startCamera();
  });

  // ===== DESKTOP FILE UPLOAD =====
  fileInput?.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    imageBlob = file;
    desktopPreview.src = URL.createObjectURL(file);
    desktopPreview.classList.remove("hidden");
  });

  // ===== SUBMIT =====
  submitBtn?.addEventListener("click", async function () {

    if (!imageBlob) {
      alert("Please capture or upload photo.");
      return;
    }

    loader.style.display = "block";
    submitBtn.disabled = true;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    const reader = new FileReader();

    reader.onloadend = async function () {
      const base64 = reader.result.split(",")[1];

      const payload = {
        email: storedEmail,
        firstName,
        middleName: document.getElementById("middleName").value,
        lastName,
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
        fileName: `${firstName}_${lastName}.jpeg`,
        imageBase64: base64
      };

      try {
        await fetch(WEBAPP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(payload)
        });

        alert("Registration Successful!");
      } catch (err) {
        console.error("Submit error:", err);
        alert("Submission failed.");
      }

      loader.style.display = "none";
      submitBtn.disabled = false;
    };

    reader.readAsDataURL(imageBlob);
  });

  // ===== OPTIONAL: Start camera only after user tap =====
  if (isMobile) {
    document.getElementById("startCameraBtn")?.addEventListener("click", startCamera);
  }

});
