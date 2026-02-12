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

async function fetchData() {
  showLoader();
  try {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  allData = data.values.slice(1);
  initAccess();
} catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to load data.");
  }

  hideLoader();
}

function initAccess() {
  officerInfo = allData.find((r) => r[0] == loggedInID);
  const special = officerInfo[23];

  if (special == "All") {
    allowedRows = allData.filter((r) => r[21] == "Active");
  } else {
    allowedRows = allData.filter((r) => r[15] == special && r[21] == "Active");
    if (allowedRows.length == 0) {
      allowedRows = allData.filter(
        (r) => r[14] == special && r[21] == "Active"
      );
    }
  }

  populateFilters();
  updateAgeChart(allowedRows); // populate chart on load
  updateScoreCard(allowedRows); // optional: show total active on load
}

function populateFilters() {
  const brgySet = [...new Set(allowedRows.map((r) => r[15]))];
  const distSet = [...new Set(allowedRows.map((r) => r[14]))];

  barangayFilter.innerHTML = "";
  districtFilter.innerHTML = "";

  const special = officerInfo[23];

  if (brgySet.length > 1) {
    barangayFilter.innerHTML = "<option value=''>All Barangay</option>";
  }
  if (distSet.length > 1) {
    districtFilter.innerHTML = "<option value=''>All District</option>";
  }

  brgySet
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((b) => {
      barangayFilter.innerHTML += `<option>${b}</option>`;
    });
  distSet
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((d) => {
      districtFilter.innerHTML += `<option>${d}</option>`;
    });

  if (special === "All") {
    barangayFilter.value = "";
    districtFilter.value = "";
  } else if (special && special.startsWith("Dist.")) {
    barangayFilter.value = "";
    districtFilter.value = special;
  } else {
    barangayFilter.value = brgySet[0] || "";
    districtFilter.value = distSet[0] || "";
  }
}

// Filter changes update scorecard and chart
barangayFilter.addEventListener("change", updateStatsOnFilterChange);
districtFilter.addEventListener("change", updateStatsOnFilterChange);

function updateStatsOnFilterChange() {
  let rows = [...allowedRows];
  const b = barangayFilter.value;
  const d = districtFilter.value;

  if (b) rows = rows.filter((r) => r[15] == b);
  if (d) rows = rows.filter((r) => r[14] == d);

  updateScoreCard(rows);
  updateAgeChart(rows);
}

// Loader

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

function generateData() {

  showLoader();

  requestAnimationFrame(() => {
  
  let rows = [...allowedRows];
  const b = barangayFilter.value;
  const d = districtFilter.value;
  const q = searchInput.value.toLowerCase();

  if (b) rows = rows.filter((r) => r[15] == b);
  if (d) rows = rows.filter((r) => r[14] == d);
  if (q)
    rows = rows.filter(
        (r) =>
          r[0].toLowerCase().includes(q) ||
          r[7].toLowerCase().includes(q)
      );

  rows.sort((a, b) => parseInt(a[15]) - parseInt(b[15]));

  // Show table when generate clicked
  tableWrapper.style.display = "block";

  // Hide score card and chart
  document.querySelector(".score-card").style.display = "none";
  document.getElementById("ageChart").style.display = "none";

  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach((r) => {
    tbody.innerHTML += `
    <tr>
      <td>${r[0]}</td>
      <td>${r[7]}</td>
      <td>${r[8]}</td>
      <td>${r[13]}</td>
      <td>${r[15]}</td>
    </tr>`;
  });

  currentRows = rows;
  updateScoreCard(rows);

hideLoader();
  });
}
// Score card
function updateScoreCard(rows) {
  totalActiveEl.textContent = rows.length;
}

// Age chart
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
      labels: labels,
      datasets: [
        {
          label: "Age Group %",
          data: percentages,
          backgroundColor: "#4bfa68"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 5, bottom: 5, left: 0, right: 0 } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => v + "%" } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Age Group", font: { size: 16 } }
      }
    }
  });

  // show chart and score card on load
  document.querySelector(".score-card").style.display = "flex";
  document.getElementById("ageChart").style.display = "block";
}

// PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Active Kasangga ng Batang Kankaloo Association Inc.", 14, 15);
  doc.text(`Requested by: ${officerInfo[7]}`, 14, 25);
  doc.text(`Barangay: ${barangayFilter.value || "All"}`, 14, 35);
  doc.text(`District: ${districtFilter.value || "All"}`, 14, 45);

  const tableData = currentRows.map((r) => [r[0], r[7], r[8], r[13], r[15]]);

  doc.autoTable({
    startY: 55,
    head: [["ID Number", "Full Name", "Address", "Phone", "Barangay"]],
    body: tableData
  });

  doc.save("kasangga_report.pdf");
}

// Event listeners
generateBtn.addEventListener("click", generateData);
pdfBtn.addEventListener("click", downloadPDF);
searchBtn.addEventListener("click", generateData);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") generateData();
});

fetchData();
