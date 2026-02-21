const PROXY_URL = "https://script.google.com/macros/s/AKfycbyhItwXx49crZNH8neyPMuN_jJWjmvxtR3ZsUIVuUI-x-HpFaHSXUlesMQGXKmBcIDsGg/exec";

const loggedInID = sessionStorage.getItem("memberID");
const loader = document.getElementById("loader");

let allData = [];
let allowedRows = [];
let officerInfo = {};
let currentRows = [];
let ageChart = null;

// ---------------- TABLE PAGE ----------------
let currentPage = 1;
const rowsPerPage = 300;
let paginatedRows = [];
// ---------------- TABLE PAGE ---------------->

const barangayFilter = document.getElementById("barangayFilter");
const districtFilter = document.getElementById("districtFilter");
const generateBtn = document.getElementById("generateBtn");
const pdfBtn = document.getElementById("pdfBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const totalActiveEl = document.getElementById("totalActive");
const tableWrapper = document.querySelector(".table-wrapper");

// Hide table on load
tableWrapper.style.display = "none";

// ---------------- FETCH DATA ----------------
async function fetchData() {
  showLoader();
  try {
    const res = await fetch(PROXY_URL);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    allData = data.values.slice(1);
    initAccess();
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Security Error: Could not connect to data proxy.");
  }
  hideLoader();
}

// ---------------- ACCESS CONTROL ----------------
function initAccess() {
  officerInfo = allData.find((r) => r[0] == loggedInID);
  
  if (!officerInfo) {
    hideLoader();
    alert("Error: Member ID (" + loggedInID + ") not found.");
    return;
  }

  const special = officerInfo[23];

  if (special == "All") {
    allowedRows = allData.filter((r) => r[21] == "Active");
  } else {
    // Check if access is for a specific Barangay first
    allowedRows = allData.filter((r) => r[15] == special && r[21] == "Active");
    // If empty, check if access is for a specific District
    if (allowedRows.length == 0) {
      allowedRows = allData.filter((r) => r[14] == special && r[21] == "Active");
    }
  }

  populateDistrictFilter();
  populateBarangayFilter(); 
  updateStatsOnFilterChange();
}

// ---------------- FILTERS ----------------
function populateDistrictFilter() {
  const distSet = [...new Set(allowedRows.map((r) => r[14]))].sort();
  
  districtFilter.innerHTML = distSet.length > 1 ? "<option value=''>All Districts</option>" : "";
  distSet.forEach(d => {
    districtFilter.innerHTML += `<option value="${d}">${d}</option>`;
  });

  // If the user only has access to 1 district, lock the dropdown to that district
  if (distSet.length === 1) {
    districtFilter.value = distSet[0];
    districtFilter.disabled = true;
  } else {
    districtFilter.disabled = false;
  }

  // Populate barangays based on the initial district setup
  populateBarangayFilter(); 
}

function populateBarangayFilter() {
  const selectedDistrict = districtFilter.value;
  
  let filteredForBrgy = allowedRows;
  if (selectedDistrict) {
    filteredForBrgy = allowedRows.filter(r => r[14] === selectedDistrict);
  }

  const brgySet = [...new Set(filteredForBrgy.map((r) => r[15]))].sort((a, b) => parseInt(a) - parseInt(b));
  
  barangayFilter.innerHTML = brgySet.length > 1 ? "<option value=''>All Barangays</option>" : "";
  brgySet.forEach(b => {
    barangayFilter.innerHTML += `<option value="${b}">${b}</option>`;
  });

  // If the user only has access to 1 barangay, lock the dropdown to that barangay
  if (brgySet.length === 1) {
    barangayFilter.value = brgySet[0];
    barangayFilter.disabled = true;
  } else {
    barangayFilter.disabled = false;
  }
}

// ---------------- EVENT LISTENERS ----------------
districtFilter.addEventListener("change", () => {
  populateBarangayFilter();
  updateStatsOnFilterChange();
});

barangayFilter.addEventListener("change", updateStatsOnFilterChange);
districtFilter.addEventListener("change", updateStatsOnFilterChange);

// ---------------- live update chart + scorecard ----------------
function updateStatsOnFilterChange() {
  let rows = [...allowedRows];
  if (districtFilter.value) rows = rows.filter((r) => r[14] == districtFilter.value);
  if (barangayFilter.value) rows = rows.filter((r) => r[15] == barangayFilter.value);
  
  updateScoreCard(rows);
  updateAgeChart(rows);
}

// ---------------- LOADER ----------------
function showLoader() { loader.style.display = "flex"; generateBtn.disabled = true; }
function hideLoader() { loader.style.display = "none"; generateBtn.disabled = false; }

// ---------------- GENERATE ----------------
function generateData() {
  showLoader();
  setTimeout(() => {
    let rows = [...allowedRows];
    const q = searchInput.value.toLowerCase();

    if (districtFilter.value) rows = rows.filter((r) => r[14] == districtFilter.value);
    if (barangayFilter.value) rows = rows.filter((r) => r[15] == barangayFilter.value);
    
    if (q) {
      rows = rows.filter(r => r[0].toLowerCase().includes(q) || r[7].toLowerCase().includes(q));
    }

    rows.sort((a, b) => parseInt(a[15]) - parseInt(b[15]));
    paginatedRows = rows;
    currentPage = 1;

    tableWrapper.style.display = "block";
    document.querySelector(".score-card").style.display = "none";
    document.getElementById("ageChart").style.display = "none";

    renderPage();
    renderPagination();
    hideLoader();
  }, 300);
}

// ---------------- RENDER PAGE ----------------
function renderPage() {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = paginatedRows.slice(start, end);

  pageRows.forEach((r) => {
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

// ---------------- PAGE UI ----------------
function renderPagination() {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  const paginationEl = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationEl.innerHTML = ""; 
    return;
  }

  let html = "";

  html += `<button onclick="goPage(1)">«</button>`;
  html += `<button onclick="goPage(${currentPage - 1})">‹</button>`;

  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, currentPage + 1);

  for (let i = start; i <= end; i++) {
    html += `<button class="${
      i === currentPage ? "active" : ""
    }" onclick="goPage(${i})">${i}</button>`;
  }

  if (end < totalPages) html += `<span>...</span>`;

  html += `<button onclick="goPage(${currentPage + 1})">›</button>`;
  html += `<button onclick="goPage(${totalPages})">»</button>`;

  paginationEl.innerHTML = html;
}

// ---------------- PAGE NAVIGATION ----------------
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

// ---------------- CHART ----------------
function updateAgeChart(rows) {
  const ageGroups = {};
  rows.forEach((r) => {
    const age = r[11];
    ageGroups[age] = (ageGroups[age] || 0) + 1;
  });

  const labels = Object.keys(ageGroups);
  const values = Object.values(ageGroups);
  const total = values.reduce((a, b) => a + b, 0);
  const percentages = values.map((v) => ((v / total) * 100).toFixed(1));

  if (ageChart) ageChart.destroy();

  ageChart = new Chart(document.getElementById("ageChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: percentages,
          backgroundColor: "#4bfa68"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Age Group" }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => v + "%" } }
      }
    }
  });

  document.querySelector(".score-card").style.display = "flex";
  document.getElementById("ageChart").style.display = "block";
}

// ---------------- DOWNLOAD PDF ----------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Kasangga ng Batang Kankaloo Association Inc.", 14, 15);
  doc.setFontSize(11);
  doc.text(`Requested by: ${officerInfo[7]}`, 14, 22);
  doc.text(`Barangay: ${barangayFilter.value || "All"}`, 14, 27);
  doc.text(`District: ${districtFilter.value || "All"}`, 14, 32);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

  const tableData = paginatedRows.map(r=>[r[0],r[7],r[8],r[13],r[15]]);

  doc.autoTable({
    startY: 40,
    head: [["ID", "Full Name", "Address", "Phone", "Barangay"]],
    body: tableData,

    headStyles: {
      fillColor: [2, 163, 2],  
      textColor: 255,        
      fontStyle: 'bold',
      halign: 'center'
    }
  });

  doc.save("KBKAI_Membership_Data.pdf");
}

// ---------------- EVENTS ----------------
generateBtn.addEventListener("click", generateData);
searchBtn.addEventListener("click", generateData);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") generateData();
});
pdfBtn.addEventListener("click", downloadPDF);

fetchData();
