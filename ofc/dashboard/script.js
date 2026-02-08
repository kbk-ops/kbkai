const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

const OFFICERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Officers!A:F?key=${API_KEY}`;
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;

const loggedInID = sessionStorage.getItem("memberID"); 

let allowedRows = [];
let currentOfficer = {};
let defaultSelections = { brgy: "all", dist: "all" };

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
      access: officerRow[5] 
    };

    document.getElementById("greet").textContent = `Hello ${currentOfficer.firstName}!`;

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
      } else {
        allowedRows = allDuesRows.filter(row => row[4] === accessValue);
        defaultSelections.dist = accessValue;
      }
    }

    // Populate filters (but we won't call loadContributions yet!)
    refreshFilterUI();
    
    // Set initial empty state for the table
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Filter" to view data.</td></tr>';

  } catch (err) {
    console.error("Initialization error:", err);
  }
}

/** * Populates/Resets the dropdown menus
 */
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
  sel.innerHTML = '<option value="all">All</option>';
  const uniqueValues = [...new Set(data)].sort();
  uniqueValues.forEach(v => {
    if (v) {
      const selected = (v === defaultValue) ? 'selected' : '';
      sel.innerHTML += `<option value="${v}" ${selected}>${v}</option>`;
    }
  });
}

/** * TRIGGERED ONLY ON CLICK
 */
function loadContributions() {
  const fID = document.getElementById("fID").value.toLowerCase();
  const fBrgy = document.getElementById("fBrgy").value;
  const fDistrict = document.getElementById("fDistrict").value;
  const fMonth = document.getElementById("fMonth").value;
  const fYear = document.getElementById("fYear").value;
  const fReceived = document.getElementById("fReceived").value;

  let html = "";
  let total = 0;

  allowedRows.forEach(r => {
    if (fID && !r[1].toLowerCase().includes(fID)) return;
    if (fBrgy !== "all" && r[3] !== fBrgy) return;
    if (fDistrict !== "all" && r[4] !== fDistrict) return;
    if (fMonth !== "all" && r[6] !== fMonth) return;
    if (fYear !== "all" && r[5] !== fYear) return;
    if (fReceived !== "all" && r[9] !== fReceived) return;

    total += Number(r[7] || 0);

    html += `<tr>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td>${r[6]}</td>
      <td>${r[5]}</td>
      <td>${Number(r[7]).toLocaleString()}</td>
      <td>${r[0]}</td>
      <td>${r[9]}</td>
    </tr>`;
  });

  document.getElementById("contriBody").innerHTML = html || '<tr><td colspan="7">No records found.</td></tr>';
  document.getElementById("totalAmt").textContent = total.toLocaleString();
}

/** * UPDATED TAB SWITCHER
 * Resets data when leaving the contribution tab
 */
function showTab(id) {
  // 1. Reset logic if moving to Home or About
  if (id === 'homeTab' || id === 'aboutTab') {
    refreshFilterUI();
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Generate" to view data.</td></tr>';
    document.getElementById("totalAmt").textContent = "0";
  }

  // 2. Standard Tab Switching
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function go(url) { window.location.href = url; }
function logout() { 
  sessionStorage.clear(); 
  window.location.replace("https://kbk-ops.github.io/kbkai"); 
}

initDashboard();
