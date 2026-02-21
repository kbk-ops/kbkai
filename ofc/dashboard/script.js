const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const BASE_URL =
  "https://script.google.com/macros/s/AKfycbz29zHrCPedCnAEaeHnR7AEX-FVUI0SOkpAjrR6De8Mmx8xrhC4RUlIr04xzlbrKuWi/exec";

const OFFICERS_URL = `${BASE_URL}?type=officers`;
const DUES_URL = `${BASE_URL}?type=dues`;

sessionStorage.setItem("memberID", "BK25-3010645");
const loggedInID = sessionStorage.getItem("memberID");
const generateBtn = document.getElementById("generateBtn");
const pdfBtn = document.getElementById("pdfBtn");
const loader = document.getElementById("loader");

let allowedRows = [];
let currentOfficer = {};
let defaultSelections = { brgy: "all", dist: "all" };

// ---------------- PAGE TABLE ----------------
let currentPage = 1;
const rowsPerPage = 30;
let paginatedRows = [];

// ---------------- IMAGE FORMATTER ----------------
function formatImage(link) {
  const defaultProfile =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
        <circle cx='100' cy='100' r='100' fill='#e0e0e0'/>
        <circle cx='100' cy='80' r='35' fill='#9e9e9e'/>
        <path d='M40 160c0-30 25-50 60-50s60 20 60 50' fill='#9e9e9e'/>
      </svg>
    `);

  if (!link || link.trim() === "") return defaultProfile;

  link = link.trim();

  let match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s200`;
  }

  match = link.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s200`;
  }

  if (link.startsWith("http")) return link;

  return defaultProfile;
}

// ---------------- INITIALIZED DASHBOARD ----------------
async function initDashboard() {
  showLoaderd();

  try {
    const offRes = await fetch(OFFICERS_URL, { cache: "no-store" });
    const offData = await offRes.json();
    const officers = offData.values || [];

    const officerRow = officers.find((row) => row[0] === loggedInID);
    if (!officerRow) return;

    currentOfficer = {
      firstName: officerRow[1],
      fullName: officerRow[2],
      barangay: officerRow[3],
      district: officerRow[4],
      access: officerRow[5]
    };

    // UI Greeting & Profile
    document.getElementById(
      "greet"
    ).textContent = `Hello ${currentOfficer.firstName}!`;
    const pic = document.getElementById("profilePic");

    try {
      const profileRes = await fetch(
        `${BASE_URL}?type=profile&id=${loggedInID}`,
        { cache: "no-store" }
      );
      const profileData = await profileRes.json();
      pic.src = formatImage(profileData.picture);
    } catch {
      pic.src = formatImage("");
    }

    // -------- Fetch Monthly Dues --------
    const duesRes = await fetch(DUES_URL, { cache: "no-store" });
    const duesData = await duesRes.json();
    const allDuesRows = duesData.values ? duesData.values.slice(1) : [];

    const accessValue = currentOfficer.access;

    if (accessValue === "All") {
      allowedRows = allDuesRows;
    } else {
      // 1. Try to match by Barangay (Column D / Index 3)
      const brgyMatches = allDuesRows.filter((row) => row[3] === accessValue);

      if (brgyMatches.length > 0) {
        allowedRows = brgyMatches;
        defaultSelections.brgy = accessValue;
        // Logic fix: Also pre-select the District this Barangay belongs to
        defaultSelections.dist = brgyMatches[0][4];
      } else {
        // 2. If no Barangay match, try District (Column E / Index 4)
        const distMatches = allDuesRows.filter((row) => row[4] === accessValue);
        allowedRows = distMatches;
        defaultSelections.dist = accessValue;
      }
    }

    refreshFilterUI();
    document.getElementById("contriBody").innerHTML =
      '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
  } catch (err) {
    console.error("Initialization error:", err);
  } finally {
    hideLoaderd();
  }
}

/* ------------------ DASHBOARD LOADER ------------------ */
function showLoaderd() {
  document.getElementById("loaderd").style.display = "flex";
}

function hideLoaderd() {
  document.getElementById("loaderd").style.display = "none";
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

// ---------------- Barangay Option ----------------
function updateBarangayOptions() {
  const selectedDist = document.getElementById("fDistrict").value;
  let filteredBrgys = [];

  if (selectedDist === "all") {
    filteredBrgys = allowedRows.map((r) => r[3]);
  } else {
    filteredBrgys = allowedRows
      .filter((r) => r[4] === selectedDist)
      .map((r) => r[3]);
  }

  fillSelect("fBrgy", filteredBrgys, defaultSelections.brgy);
}

// ---------------- Filter ----------------
function refreshFilterUI() {
  fillSelect(
    "fDistrict",
    allowedRows.map((r) => r[4]),
    defaultSelections.dist
  );
  updateBarangayOptions();
  fillSelect(
    "fMonth",
    allowedRows.map((r) => r[6]),
    "all"
  );
  fillSelect(
    "fYear",
    allowedRows.map((r) => r[5]),
    "all"
  );
  fillSelect(
    "fReceived",
    allowedRows.map((r) => r[9]),
    "all"
  );
  document.getElementById("fID").value = "";
}

function fillSelect(id, data, defaultValue) {
  const sel = document.getElementById(id);
  if (!sel) return;

  sel.innerHTML = "";

  const uniqueValues = [...new Set(data)].sort();

  uniqueValues.forEach((v) => {
    if (v) {
      const selected = v === defaultValue ? "selected" : "";
      sel.innerHTML += `<option value="${v}" ${selected}>${v}</option>`;
    }
  });

  if (defaultValue === "all") {
    sel.insertAdjacentHTML(
      "afterbegin",
      `<option value="all" selected>All</option>`
    );
  }
}

document
  .getElementById("fDistrict")
  .addEventListener("change", updateBarangayOptions);

// ---------------- FORMAT DATE ----------------
function formatDateMMDDYYYY(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
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
      let rows = allowedRows.filter((r) => {
        if (fID && !r[1]?.toLowerCase().includes(fID)) return false;
        if (fBrgy !== "all" && r[3]?.toString().trim() !== fBrgy.trim())
          return false;
        if (fDistrict !== "all" && r[4]?.toString().trim() !== fDistrict.trim())
          return false;
        if (fMonth !== "all" && r[6]?.toString().trim() !== fMonth.trim())
          return false;
        if (fYear !== "all" && r[5]?.toString().trim() !== fYear.trim())
          return false;
        if (fReceived !== "all" && r[8]?.toString().trim() !== fReceived.trim())
          return false;
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
  pageRows.forEach((r) => {
    total += Number(r[7] || 0);
    tbody.innerHTML += `<tr>
      <td>${r[1] || ""}</td>
      <td>${r[2] || ""}</td>
      <td>${r[6] || ""}</td>
      <td>${r[5] || ""}</td>
      <td>${Number(r[7] || 0).toLocaleString()}</td>
      <td>${formatDateMMDDYYYY(r[0])}</td>
      <td>${r[8] || ""}</td>
      <td>${r[3] || ""}</td>
    </tr>`;
  });

  document.getElementById("totalAmt").textContent = total.toLocaleString();
}

// ---------------- PAGE UI ----------------
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
    html += `<button class="${
      i === currentPage ? "active" : ""
    }" onclick="goPage(${i})">${i}</button>`;
  }

  if (end < totalPages) html += `<span>...</span>`;

  html += `<button onclick="goPage(${currentPage + 1})">›</button>`;
  html += `<button onclick="goPage(${totalPages})">»</button>`;

  container.innerHTML = html;
}

// ---------------- PAGE NAVIGATION ----------------
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
    doc.text(`Date: ${formatDateMMDDYYYY(new Date())}`, 14, 37);

    const tableData = paginatedRows.map((r) => [
      r[1],
      r[2],
      r[6],
      r[5],
      Number(r[7] || 0).toLocaleString(),
      formatDateMMDDYYYY(r[0]),
      r[8],
      r[3]
    ]);

    doc.autoTable({
      startY: 40,
      head: [
        [
          "ID",
          "Full Name",
          "Month",
          "Year",
          "Amount",
          "Posted",
          "Received By",
          "Barangay"
        ]
      ],
      body: tableData,
      headStyles: {
        fillColor: [2, 163, 2],
        textColor: 255,
        fontStyle: "bold",
        halign: "center"
      }
    });

    const finalY = doc.lastAutoTable.finalY || 40;

    // Compute GRAND TOTAL
    const grandTotal = paginatedRows.reduce((sum, r) => {
      return sum + (Number(r[7]) || 0);
    }, 0);

    doc.text(`Total: PHP ${grandTotal.toLocaleString()}`, 14, finalY + 10);

    doc.save(`Monthly Dues_Report_${Date.now()}.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Error generating PDF.");
  }
}

function showTab(id) {
  if (id === "homeTab" || id === "aboutTab") {
    refreshFilterUI();
    document.getElementById("contriBody").innerHTML =
      '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
    document.getElementById("totalAmt").textContent = "0";
  }
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function go(url) {
  window.location.replace(url);
}

function logout() {
  sessionStorage.clear();
  window.location.replace("https://kbk-ops.github.io/kbkai");
}

initDashboard();
