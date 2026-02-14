const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAME = "Raw_Data";

const loggedInID = sessionStorage.getItem("memberID");
const loader = document.getElementById("loader");

let allData = [];
let allowedRows = [];
let officerInfo = {};
let currentRows = [];
let ageChart = null;

// pagination
let currentPage = 1;
const rowsPerPage = 300;
let paginatedRows = [];

// elements
const barangayFilter = document.getElementById("barangayFilter");
const districtFilter = document.getElementById("districtFilter");
const generateBtn = document.getElementById("generateBtn");
const pdfBtn = document.getElementById("pdfBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const totalActiveEl = document.getElementById("totalActive");
const tableWrapper = document.querySelector(".table-wrapper");
const paginationEl = document.getElementById("pagination");

// initial UI
tableWrapper.style.display = "none";
paginationEl.style.display = "none";

// ---------------- LOADER ----------------
function showLoader() {
  loader.style.display = "flex";
  generateBtn.disabled = true;
  pdfBtn.disabled = true;
}

function hideLoader() {
  loader.style.display = "none";
  generateBtn.disabled = false;
  pdfBtn.disabled = false;
}

// ---------------- FETCH ----------------
async function fetchData() {
  showLoader();
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    allData = data.values.slice(1);
    initAccess();
  } catch (err) {
    alert("Failed to load data");
  }
  hideLoader();
}

// ---------------- ACCESS ----------------
function initAccess() {
  officerInfo = allData.find(r => r[0] == loggedInID);
  const special = officerInfo[23];

  if (special === "All") {
    allowedRows = allData.filter(r => r[21] === "Active");
  } else {
    allowedRows = allData.filter(r => r[15] === special && r[21] === "Active");
    if (allowedRows.length === 0) {
      allowedRows = allData.filter(r => r[14] === special && r[21] === "Active");
    }
  }

  populateFilters();
  updateScoreCard(allowedRows);
  updateAgeChart(allowedRows);
}

// ---------------- FILTERS ----------------
function populateFilters() {
  const brgySet = [...new Set(allowedRows.map(r => r[15]))];
  const distSet = [...new Set(allowedRows.map(r => r[14]))];
  const special = officerInfo[23];

  barangayFilter.innerHTML = "";
  districtFilter.innerHTML = "";

  barangayFilter.innerHTML = "<option value=''>All Barangay</option>";
  districtFilter.innerHTML = "<option value=''>All District</option>";

  brgySet.sort().forEach(b => {
    barangayFilter.innerHTML += `<option value="${b}">${b}</option>`;
  });

  distSet.sort().forEach(d => {
    districtFilter.innerHTML += `<option value="${d}">${d}</option>`;
  });

  if (special === "All") {
    barangayFilter.value = "";
    districtFilter.value = "";
  } else if (special.startsWith("Dist.")) {
    barangayFilter.value = "";
    districtFilter.value = special;
  } else {
    barangayFilter.value = special;
  }
}

// live update
barangayFilter.addEventListener("change", updateStatsOnFilterChange);
districtFilter.addEventListener("change", updateStatsOnFilterChange);

function updateStatsOnFilterChange() {
  let rows = [...allowedRows];
  if (barangayFilter.value) rows = rows.filter(r => r[15] === barangayFilter.value);
  if (districtFilter.value) rows = rows.filter(r => r[14] === districtFilter.value);
  updateScoreCard(rows);
  updateAgeChart(rows);
}

// ---------------- GENERATE TABLE ----------------
function generateData() {
  showLoader();

  setTimeout(() => {
    let rows = [...allowedRows];
    const q = searchInput.value.toLowerCase();

    if (barangayFilter.value) rows = rows.filter(r => r[15] === barangayFilter.value);
    if (districtFilter.value) rows = rows.filter(r => r[14] === districtFilter.value);
    if (q) rows = rows.filter(r =>
      r[0].toLowerCase().includes(q) ||
      r[7].toLowerCase().includes(q)
    );

    paginatedRows = rows;
    currentPage = 1;

    tableWrapper.style.display = "block";
    paginationEl.style.display = "flex";
    document.querySelector(".score-card").style.display = "none";
    document.getElementById("ageChart").style.display = "none";

    renderPage();
    renderPagination();

    hideLoader();
  }, 200);
}

// ---------------- RENDER PAGE ----------------
function renderPage() {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = paginatedRows.slice(start, end);

  pageRows.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r[0]}</td>
        <td>${r[7]}</td>
        <td>${r[8]}</td>
        <td>${r[13]}</td>
        <td>${r[15]}</td>
      </tr>`;
  });

  currentRows = pageRows;
}

// ---------------- PAGINATION UI ----------------
function renderPagination() {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  let html = "";

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  html += `<button onclick="goPage(1)">«</button>`;
  html += `<button onclick="goPage(${currentPage - 1})">‹</button>`;

  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, currentPage + 1);

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }

  if (end < totalPages) html += `<span>...</span>`;

  html += `<button onclick="goPage(${currentPage + 1})">›</button>`;
  html += `<button onclick="goPage(${totalPages})">»</button>`;

  paginationEl.innerHTML = html;
}

function goPage(page) {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  renderPagination();
}

// ---------------- SCORECARD ----------------
function updateScoreCard(rows) {
  totalActiveEl.textContent = rows.length;
}

// ---------------- AGE CHART ----------------
function updateAgeChart(rows) {
  const ageGroups = {};
  rows.forEach(r => {
    const age = r[11];
    ageGroups[age] = (ageGroups[age] || 0) + 1;
  });

  const labels = Object.keys(ageGroups);
  const values = Object.values(ageGroups);
  const total = values.reduce((a,b)=>a+b,0);
  const percentages = values.map(v=>((v/total)*100).toFixed(1));

  if (ageChart) ageChart.destroy();

  ageChart = new Chart(document.getElementById("ageChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: percentages,
        backgroundColor: "#4bfa68"
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        title:{display:true,text:"Age Group"}
      },
      scales:{
        y:{beginAtZero:true,ticks:{callback:v=>v+"%"}}
      }
    }
  });

  document.querySelector(".score-card").style.display = "flex";
  document.getElementById("ageChart").style.display = "block";
}

// ---------------- PDF ----------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("KBKAI Monthly Dues", 14, 15);
  doc.text(`Requested by: ${officerInfo[7]}`, 14, 25);
  doc.text(`Barangay: ${barangayFilter.value || "All"}`, 14, 35);

  const tableData = paginatedRows.map(r => [r[0], r[7], r[8], r[13], r[15]]);
  doc.autoTable({
    startY: 45,
    head: [["ID","Full Name","Address","Phone","Barangay"]],
    body: tableData
  });

  doc.save("kbkai_dues_report.pdf");
}

// ---------------- EVENTS ----------------
generateBtn.addEventListener("click", generateData);
searchBtn.addEventListener("click", generateData);
searchInput.addEventListener("keyup", e => { if(e.key==="Enter") generateData(); });
pdfBtn.addEventListener("click", downloadPDF);

// ---------------- INIT ----------------
fetchData();
