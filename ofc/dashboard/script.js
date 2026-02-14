const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

const OFFICERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Officers!A:F?key=${API_KEY}`;
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;

const loggedInID = sessionStorage.getItem("memberID");
const generateBtn = document.getElementById("generateBtn");
const pdfBtn = document.getElementById("pdfBtn");
const loader = document.getElementById("loader");

let allowedRows = [];
let currentOfficer = {};
let defaultSelections = { brgy: "all", dist: "all" };

// ---------------- PAGE TABLE ----------------
let currentPage = 1;
const rowsPerPage = 20; // adjust as needed
let paginatedRows = [];

// ---------------- INITIALIZED DASHBOARD ----------------
async function initDashboard() {
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

    // UI Greeting & Profile
    document.getElementById("greet").textContent = `Hello ${currentOfficer.firstName}!`;
    const pic = document.getElementById("profilePic");
    if (pic) pic.src = "https://raw.githubusercontent.com/kbk-ops/kbkai/main/Icons/profileicon.png";

    const duesRes = await fetch(DUES_URL);
    const duesData = await duesRes.json();
    const allDuesRows = duesData.values ? duesData.values.slice(1) : [];

    const accessValue = currentOfficer.access;

    if (accessValue === "All") {
      allowedRows = allDuesRows;
    } else {
      // 1. Try to match by Barangay (Column D / Index 3)
      const brgyMatches = allDuesRows.filter(row => row[3] === accessValue);
      
      if (brgyMatches.length > 0) {
        allowedRows = brgyMatches;
        defaultSelections.brgy = accessValue;
        // Logic fix: Also pre-select the District this Barangay belongs to
        defaultSelections.dist = brgyMatches[0][4]; 
      } else {
        // 2. If no Barangay match, try District (Column E / Index 4)
        const distMatches = allDuesRows.filter(row => row[4] === accessValue);
        allowedRows = distMatches;
        defaultSelections.dist = accessValue;
      }
    }

    refreshFilterUI();
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';

  } catch (err) {
    console.error("Initialization error:", err);
  }
}

// ---------------- LOADER ----------------
function showLoader() {
  loader.style.display = "flex";
  if (generateBtn) generateBtn.disabled = true;
  if (pdfBtn) pdfBtn.disabled = true;
}

function hideLoader() {
  loader.style.display = "none";
  if (generateBtn) generateBtn.disabled = false;
  if (pdfBtn) pdfBtn.disabled = false;
}

// ---------------- Filter ----------------
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
  if (!sel) return;

  sel.innerHTML = ""; // clear everything

  // Only include the default selection or unique allowed values
  const uniqueValues = [...new Set(data)].sort();

  uniqueValues.forEach(v => {
    if (v) {
      const selected = (v === defaultValue) ? 'selected' : '';
      sel.innerHTML += `<option value="${v}" ${selected}>${v}</option>`;
    }
  });

  // If default is "all", include "All" option
  if (defaultValue === "all") {
    sel.insertAdjacentHTML('afterbegin', `<option value="all" selected>All</option>`);
  }
}

// ---------------- LOAD CONTRIBUTION ----------------
function loadContributions() {
  showLoader();

  setTimeout(() => {
    try {
      const fID = document.getElementById("fID").value.toLowerCase();
      const fBrgy = document.getElementById("fBrgy").value;
      const fDistrict = document.getElementById("fDistrict").value;
      const fMonth = document.getElementById("fMonth").value;
      const fYear = document.getElementById("fYear").value;
      const fReceived = document.getElementById("fReceived").value;

      // Filter rows
      let rows = allowedRows.filter(r => {
        if (fID && !r[1]?.toLowerCase().includes(fID)) return false;
        if (fBrgy !== "all" && r[3] !== fBrgy) return false;
        if (fDistrict !== "all" && r[4] !== fDistrict) return false;
        if (fMonth !== "all" && r[6] !== fMonth) return false;
        if (fYear !== "all" && r[5] !== fYear) return false;
        if (fReceived !== "all" && r[9] !== fReceived) return false;
        return true;
      });

      paginatedRows = rows;
      currentPage = 1;

      renderPage();
      renderPagination();

    } catch (err) {
      console.error("Load error:", err);
    } finally {
      hideLoader();
    }
  }, 300);
}

// ---------------- RENDER PAGE ----------------
function renderPage() {
  const tbody = document.getElementById("contriBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = paginatedRows.slice(start, end);

  let total = 0;
  pageRows.forEach(r => {
    total += Number(r[7] || 0);
    tbody.innerHTML += `<tr>
      <td>${r[1] || ""}</td>
      <td>${r[2] || ""}</td>
      <td>${r[6] || ""}</td>
      <td>${r[5] || ""}</td>
      <td>${Number(r[7] || 0).toLocaleString()}</td>
      <td>${r[0] || ""}</td>
      <td>${r[9] || ""}</td>
      <td>${r[3] || ""}</td>
    </tr>`;
  });

  document.getElementById("totalAmt").textContent = total.toLocaleString();
}

// ---------------- RENDER PAGINATION ----------------
function renderPagination() {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  const container = document.getElementById("pagination");
  if (!container) return;
  let html = "";

  if (totalPages <= 1) {
    container.innerHTML = "";
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

  container.innerHTML = html;
}

function goPage(page) {
  const totalPages = Math.ceil(paginatedRows.length / rowsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  renderPagination();
}

// ---------------- DOWNLOAD PDF ----------------
function downloadPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const tableRows = document.querySelectorAll("#contriBody tr");
    if (tableRows.length === 0 || tableRows[0].cells.length < 2) {
      alert("Please generate data before downloading.");
      return;
    }

    doc.setFontSize(16);
    doc.text("Monthly Dues Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Requested by: ${currentOfficer.fullName || "Officer"}`, 14, 22);
    doc.text(`Barangay: ${fBrgy.value || "All"}`, 14, 27);
    doc.text(`District: ${fDistrict.value || "All"}`, 14, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

    const tableData = [];
    tableRows.forEach(tr => {
      const cols = tr.querySelectorAll("td");
      if (cols.length > 1) tableData.push(Array.from(cols).map(td => td.innerText));
    });

    doc.autoTable({
      startY: 40,
      head: [["ID", "Full Name", "Month", "Year", "Amount", "Posted", "Received By", "Barangay"]],
      body: tableData,
      headStyles: { 
        fillColor: [2, 163, 2],
        textColor: 255,        
        fontStyle: 'bold',
        halign: 'center'
      }
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.text(`Total: PHP ${document.getElementById("totalAmt").textContent}`, 14, finalY + 10);
    doc.save(`Monthly Dues_Report_${Date.now()}.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Error generating PDF.");
  }
}

function showTab(id) {
  if (id === 'homeTab' || id === 'aboutTab') {
    refreshFilterUI();
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
    document.getElementById("totalAmt").textContent = "0";
  }
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function go(url) { window.location.replace(url); }

function logout() { 
  sessionStorage.clear(); 
  window.location.replace("https://kbk-ops.github.io/kbkai"); 
}

initDashboard();
