const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:D?key=${API_KEY}`;
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzMWIlDBNuuQg8vSc7tSC_-WYQMnud6__-cPWkM7L1ZJgZHy8pDwOGhFWTeqYYlewGi/exec";

const collectorID = sessionStorage.getItem("collectorID");

// QR Scanner variables
let html5QrCode;
let isScanning = false;

// Start / Stop Camera button
const toggleBtn = document.getElementById("toggleCam");
const readerDiv = document.getElementById("reader");

toggleBtn.onclick = async () => {
  if(!isScanning){
    html5QrCode = new Html5Qrcode("reader");
    isScanning = true;
    toggleBtn.textContent = "Stop";

    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 300, height: 300 } },
      async (decodedText) => {
        idNumber.value = decodedText.trim();

        await html5QrCode.stop();
        isScanning = false;
        toggleBtn.textContent = "Scan";

        // auto trigger lookup after scan
        fetchMember(); 
      }
    );
  } else {
    await html5QrCode.stop();
    isScanning = false;
    toggleBtn.textContent = "Scan";
  }
};

// Load member info from Members sheet
async function fetchMember(){
  const id = idNumber.value.trim();
  if(!id) return;

  const res = await fetch(URL);   // your existing sheet URL
  const data = await res.json();
  const rows = data.values.slice(1);

  const record = rows.find(r => r[0] === id);
  if(record){
    fullName.value = record[1];
    brgy.value = record[2];
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

// Summary page
document.getElementById("summaryPage").addEventListener("click", () => {
  window.location.href = "https://kbk-ops.github.io/OrganizationFund/collector/dashboard/summary";
});
