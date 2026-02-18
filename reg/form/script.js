const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwaZVaYhTjCkpl4en1Pb1jN72DevneqpYUr2c9P5tISTfm6ojBaHueznI22hGpDaKn4QQ/exec";

// Load Session
const referrerID = sessionStorage.getItem("referrerID") || "Unknown";
const registerEmail = sessionStorage.getItem("registerEmail") || "";

const titleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Input Logic
["firstName", "middleName", "lastName"].forEach((id) => {
  document
    .getElementById(id)
    .addEventListener(
      "input",
      (e) => (e.target.value = titleCase(e.target.value))
    );
});

// PASTE THE DOB FORMATTER HERE:
document.getElementById("dob").addEventListener("input", function (e) {
  let v = e.target.value.replace(/\D/g, "");
  let finalValue = "";
  if (v.length > 0) {
    let month = v.slice(0, 2);
    if (month.length === 2 && parseInt(month) > 12) month = "12";
    finalValue = month;
    if (v.length > 2) {
      let day = v.slice(2, 4);
      if (day.length === 2 && parseInt(day) > 31) day = "31";
      finalValue += "/" + day;
      if (v.length > 4) {
        let year = v.slice(4, 8);
        finalValue += "/" + year;
      }
    }
  }
  e.target.value = finalValue;
});

document.getElementById("address").addEventListener("blur", (e) => {
  let val = e.target.value.toLowerCase();
  val = val.replace(/caloocan|kalookan|city/gi, "").trim();
  e.target.value = titleCase(val) + " Caloocan City";
});

document.getElementById("phone").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
  if (e.target.value && e.target.value[0] !== "0") e.target.value = "0";
});

document
  .getElementById("precinct")
  .addEventListener(
    "input",
    (e) => (e.target.value = e.target.value.toUpperCase())
  );

let base64Image = "";
document.getElementById("photoInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show a "Processing" message in the preview area
  const preview = document.getElementById("previewArea");
  preview.innerHTML = "<span>Processing...</span>";

  // Disable the submit button temporarily
  const submitBtn = document.querySelector(".btn-submit");
  submitBtn.disabled = true;
  submitBtn.innerText = "Processing Photo...";

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set square size (500x500 is perfect for ID photos)
      const size = 500;
      canvas.width = size;
      canvas.height = size;

      // Math to find the center square
      let sourceX, sourceY, sourceWidth, sourceHeight;
      if (img.width > img.height) {
        sourceWidth = img.height;
        sourceHeight = img.height;
        sourceX = (img.width - img.height) / 2;
        sourceY = 0;
      } else {
        sourceWidth = img.width;
        sourceHeight = img.width;
        sourceX = 0;
        sourceY = (img.height - img.width) / 2;
      }

      // Draw the crop
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        size,
        size
      );

      // Save the result
      base64Image = canvas.toDataURL("image/png");

      // Show the preview and re-enable the form
      preview.innerHTML = `<img src="${base64Image}" style="width:100%; height:100%; object-fit:cover;">`;
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Registration";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("barangay").addEventListener("change", async (e) => {
  const val = e.target.value.toUpperCase();
  const posSel = document.getElementById("position");
  posSel.disabled = true;
  posSel.innerHTML = "<option>Loading...</option>";

  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=getPositions&barangay=${val}`
    );
    const data = await res.json();
    posSel.innerHTML = data
      .map((p) => `<option value="${p}">${p}</option>`)
      .join("");
    posSel.disabled = false;
  } catch {
    alert("Error loading positions");
  }
});

document.getElementById("memberForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dob = document.getElementById("dob").value;
  const age = Math.floor((new Date() - new Date(dob)) / 31557600000);
  if (age < 15) return alert("Must be 15 years old or above");
  if (!base64Image) return alert("Photo is required");
  if (document.getElementById("phone").value.length !== 11)
    return alert("Phone must be 11 digits");

  document.getElementById("loadingOverlay").style.display = "flex";

  const payload = {
    email: registerEmail,
    firstName: document.getElementById("firstName").value,
    middleName: document.getElementById("middleName").value,
    lastName: document.getElementById("lastName").value,
    suffix: document.getElementById("suffix").value,
    address: document.getElementById("address").value,
    dob: document.getElementById("dob").value,
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value,
    barangay: document.getElementById("barangay").value,
    precinct: document.getElementById("precinct").value,
    position: document.getElementById("position").value,
    referrer: referrerID,
    image: base64Image,
    mimeType: "image/png"
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    document.getElementById("spinner").style.display = "none";
    if (result.result === "success") {
      document.getElementById("overlayTitle").innerText = "Success!";
      document.getElementById("overlayText").innerText =
        "Data Successfully submitted please check your email within the day for the confirmation";
    } else {
      document.getElementById("overlayTitle").innerText = "Notice";
      document.getElementById("overlayText").innerText = result.message;
    }
    document.getElementById("closeBtn").style.display = "block";
  } catch {
    alert("Submission failed. Check connection.");
  }
});

function showTab(id) {
  // Remove active from all tabs
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));

  // Show selected tab
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}
