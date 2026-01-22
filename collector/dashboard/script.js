const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:D?key=${API_KEY}`;
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzMWIlDBNuuQg8vSc7tSC_-WYQMnud6__-cPWkM7L1ZJgZHy8pDwOGhFWTeqYYlewGi/exec";

const collectorID = sessionStorage.getItem("collectorID");

// QR Scanner variables
let html5Qr;
let cameraOn = false;

// Start / Stop Camera button
const toggleBtn = document.getElementById("toggleCam");
toggleBtn.onclick = async function () {
  if (!cameraOn) {
    html5Qr = new Html5Qrcode("reader");
    await html5Qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      qr => {
        document.getElementById("idNumber").value = qr;
        loadMember();
        navigator.vibrate(200); // vibrate on scan
        new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg").play(); // sound on scan
        html5Qr.stop();
        cameraOn = false;
        toggleBtn.textContent = "Start Camera";
      }
    );
    cameraOn = true;
    toggleBtn.textContent = "Stop Camera";
  } else {
    await html5Qr.stop();
    cameraOn = false;
    toggleBtn.textContent = "Start Camera";
  }
};

// Load member info from Members sheet
document.getElementById("idNumber").onchange = loadMember;
async function loadMember() {
  const id = document.getElementById("idNumber").value.trim();
  if (!id) return;

  const res = await fetch(MEMBERS_URL);
  const data = await res.json();
  const row = data.values.find(r => r[0] == id);

  if (row) {
    fullName.value = row[2];
    brgy.value = row[3];
  } else {
    fullName.value = "";
    brgy.value = "";
  }
}

// Submit data to Contribution sheet
async function submitData(){
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";

  if(!idNumber.value.trim() || !fullName.value.trim()){
    errorEl.textContent = "ID Number is Empty";
    return;
  }

  if(!confirm("Do you want to submit?")) return;

  const payload={
    id:idNumber.value,
    name:fullName.value,
    brgy:brgy.value,
    year:year.value,
    month:month.value,
    amount:amount.value,
    collector:collectorID
  };

  try {
    const res = await fetch(WEBAPP_URL,{method:"POST",body:JSON.stringify(payload)});
    
    if(res.ok){
      errorEl.style.color = "green";
      errorEl.textContent = "Contribution successfully recorded";
      setTimeout(() => {
        location.reload();
      }, 3000);
    } else {
      errorEl.style.color = "red";
      errorEl.textContent = "Failed to record contribution";
    }
  } catch {
    errorEl.style.color = "red";
    errorEl.textContent = "Error connecting to server";
  }
}

// Reload page
function reloadPage() {
  if (confirm("Do you want to reload this page?")) location.reload();
}

// Exit page
function exitPage() {
  if (confirm("Are you sure you want  to exit?")) window.close();
}
