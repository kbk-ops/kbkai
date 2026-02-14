const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

const OFFICERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Officers!A:F?key=${API_KEY}`;
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;

const loggedInID = sessionStorage.getItem("memberID"); 
const loader = document.getElementById("loader");

let allowedRows = [];
let filteredRows = [];
let paginatedRows = [];
let currentOfficer = {};
let defaultSelections = { brgy: "all", dist: "all" };

let currentPage = 1;
const rowsPerPage = 10;

// ---------------- LOADER ----------------
function showLoader() {
  loader.style.display = "flex";
  document.querySelectorAll("button").forEach(b => b.disabled = true);
}

function hideLoader() {
  loader.style.display = "none";
  document.querySelectorAll("button").forEach(b => b.disabled = false);
}

// ---------------- INIT ----------------
async function initDashboard() {
  showLoader();
  try {
    const offRes = await fetch(OFFICERS_URL);
    const offData = await offRes.json();
    const officers = offData.values || [];
    
    const officerRow = officers.find(row => row[0] === loggedInID);
    if (!officerRow) return;

    currentOfficer = {
      firstName: officerRow[1],
      fullName: officerRow[2],
      barangay: officerRow[3],
      district: officerRow[4],
      access: officerRow[5] 
    };

    const duesRes = await fetch(DUES_URL);
    const duesData = await duesRes.json();
    const allDuesRows = duesData.values ? duesData.values.slice(1) : [];

    const accessValue = currentOfficer.access;

    if (accessValue === "All") {
      allowedRows = allDuesRows;
    } else {
      const brgyMatches = allDuesRows.filter(row => row[3] === accessValue);
      if (brgyMatches.length > 0) {
        allowedRows = brgyMatches;
        defaultSelections.brgy = accessValue;
        defaultSelections.dist = brgyMatches[0][4]; 
      } else {
        const distMatches = allDuesRows.filter(row => row[4] === accessValue);
        allowedRows = distMatches;
        defaultSelections.dist = accessValue;
      }
    }

    refreshFilterUI();
    document.getElementById("contriBody").innerHTML =
      '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
  } catch (err) {
    console.error(err);
  }
  hideLoader();
}

// ---------------- FILTER UI ----------------
function refreshFilterUI() {
  fillSelect("fBrgy", allowedRows.map(r => r[3]), defaultSelections.brgy);
  fillSelect("fDistrict", allowedRows.map(r => r[4]), defaultSelections.dist);
  fillSelect("fMonth", allowedRows.map(r => r[6]), "all");
  fillSelect("fYear", allowedRows.map(r => r[5]), "all");
  fillSelect("fReceived", allowedRows.map(r => r[9]), "all");
  document.getElementById("fID").value = "";
}

function fillSelect(id, data, defaultValue) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";
  const uniqueValues = [...new Set(data)].sort();
  if (defaultValue === "all") sel.innerHTML = `<option value="all">All</option>`;
  uniqueValues.forEach(v=>{
    if(v) sel.innerHTML += `<option ${v===defaultValue?"selected":""}>${v}</option>`;
  });
}

// ---------------- GENERATE ----------------
function loadContributions() {
  showLoader();

  setTimeout(()=>{
    const fID = document.getElementById("fID").value.toLowerCase();
    const fBrgy = document.getElementById("fBrgy").value;
    const fDistrict = document.getElementById("fDistrict").value;
    const fMonth = document.getElementById("fMonth").value;
    const fYear = document.getElementById("fYear").value;
    const fReceived = document.getElementById("fReceived").value;

    filteredRows = allowedRows.filter(r=>{
      if (fID && !r[1].toLowerCase().includes(fID)) return false;
      if (fBrgy !== "all" && r[3] !== fBrgy) return false;
      if (fDistrict !== "all" && r[4] !== fDistrict) return false;
      if (fMonth !== "all" && r[6] !== fMonth) return false;
      if (fYear !== "all" && r[5] !== fYear) return false;
      if (fReceived !== "all" && r[9] !== fReceived) return false;
      return true;
    });

    currentPage = 1;
    paginatedRows = filteredRows;
    renderPage();
    renderPagination();
    hideLoader();
  },300);
}

// ---------------- PAGINATION ----------------
function renderPage() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = paginatedRows.slice(start, end);

  let html = "";
  let total = 0;

  pageRows.forEach(r=>{
    total += Number(r[7] || 0);
    html += `
      <tr>
        <td>${r[1]}</td>
        <td>${r[2]}</td>
        <td>${r[6]}</td>
        <td>${r[5]}</td>
        <td>${Number(r[7]).toLocaleString()}</td>
        <td>${r[0]}</td>
        <td>${r[9]}</td>
      </tr>`;
  });

  document.getElementById("contriBody").innerHTML = html || 
    '<tr><td colspan="7">No records found.</td></tr>';
  document.getElementById("totalAmt").textContent = total.toLocaleString();
}

function renderPagination() {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  const container = document.getElementById("pagination");
  if (!container) return;

  let html = "";

  if (currentPage > 1) html += `<button onclick="gotoPage(${currentPage-1})">&laquo;</button>`;

  let start = Math.max(1, currentPage-1);
  let end = Math.min(totalPages, start+2);

  for(let i=start;i<=end;i++){
    html += `<button class="${i===currentPage?"active":""}" onclick="gotoPage(${i})">${i}</button>`;
  }

  if (end < totalPages) html += `<span>...</span><button onclick="gotoPage(${totalPages})">${totalPages}</button>`;
  if (currentPage < totalPages) html += `<button onclick="gotoPage(${currentPage+1})">&raquo;</button>`;

  container.innerHTML = html;
}

function gotoPage(p){
  currentPage = p;
  renderPage();
  renderPagination();
}

// ---------------- PDF (FULL DATA) ----------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  const tableData = paginatedRows.map(r=>[
    r[1],r[2],r[6],r[5],Number(r[7]).toLocaleString(),r[0],r[9]
  ]);

  doc.text("Monthly Dues Report",14,15);
  doc.text(`Requested by: ${currentOfficer.fullName}`,14,25);

  doc.autoTable({
    startY:35,
    head:[["ID","Full Name","Month","Year","Amount","Posted","Received"]],
    body:tableData
  });

  doc.save("Monthly_Dues_Report.pdf");
}

// ---------------- EVENTS ----------------
document.getElementById("generateBtn").addEventListener("click", loadContributions);
document.getElementById("pdfBtn").addEventListener("click", downloadPDF);

initDashboard();
