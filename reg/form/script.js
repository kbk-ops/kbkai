const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwaZVaYhTjCkpl4en1Pb1jN72DevneqpYUr2c9P5tISTfm6ojBaHueznI22hGpDaKn4QQ/exec";

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
  const reader = new FileReader();
  reader.onload = (event) => {
    base64Image = event.target.result;
    document.getElementById(
      "previewArea"
    ).innerHTML = `<img src="${base64Image}">`;
  };
  reader.readAsDataURL(e.target.files[0]);
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
    dob: dob.split("-").reverse().join("/"), // Convert to DD/MM/YYYY or adjust to your sheet preference
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
