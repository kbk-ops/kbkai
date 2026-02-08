const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

// Sheet URLs
const OFFICERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Officers!A:F?key=${API_KEY}`;
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;

// Get ID from auth.js session key
const loggedInID = sessionStorage.getItem("memberID"); 

let allowedRows = [];
let currentOfficer = {};

/** * CORE INITIALIZATION 
 * Verify who the officer is, find their access level, then fetch dues.
 */
async function initDashboard() {
  try {
    // 1. Fetch the Officers sheet to find the logged-in user's permissions
    const offRes = await fetch(OFFICERS_URL);
    const offData = await offRes.json();
    const officers = offData.values || [];
    
    // Look for match in Column A (ID Number)
    const officerRow = officers.find(row => row[0] === loggedInID);

    if (!officerRow) {
      console.error("ID not found in Officers sheet.");
      return; // auth.js will eventually kick them out if session is invalid
    }

    // Mapping: A=0(ID), B=1(First), C=2(Full), D=3(Brgy), E=4(Dist), F=5(Access)
    currentOfficer = {
      firstName: officerRow[1],
      fullName: officerRow[2],
      access: officerRow[5] 
    };

    // Update Greeting
    const greetEl = document.getElementById("greet");
    if (greetEl) greetEl.textContent = `Hello ${currentOfficer.firstName}!`;

    // 2. Fetch all Monthly Dues
    const duesRes = await fetch(DUES_URL);
    const duesData = await duesRes.json();
    const allDuesRows = duesData.values ? duesData.values.slice(1) : [];

    // 3. APPLY YOUR GOAL RESTRICTIONS
    const accessValue = currentOfficer.access;

    if (accessValue === "All") {
      // GOAL: If "All", see everything
      allowedRows = allDuesRows;
    } else {
      // GOAL: Look for exact match in Dues Column D (Barangay - Index 3)
      const brgyMatches = allDuesRows.filter(row => row[3] === accessValue);
      
      if (brgyMatches.length > 0) {
        allowedRows = brgyMatches;
      } else {
        // GOAL: If no Brgy match, look for match in Dues Column E (District - Index 4)
        allowedRows = allDuesRows.filter(row => row[4] === accessValue);
      }
    }

    // 4. Set up the UI with the restricted data
    fillSelect("fBrgy", allowedRows.map(r => r[3]));
    fillSelect("fDistrict", allowedRows.map(r => r[4]));
    fillSelect("fMonth", allowedRows.map(r => r[6]));
    fillSelect("fYear", allowedRows.map(r => r[5]));
    fillSelect("fReceived", allowedRows.map(r => r[9]));

    loadContributions();

  } catch (err) {
    console.error("Initialization error:", err);
  }
}

/** ---------------------- UI RENDERERS ---------------------- **/

function fillSelect(id, data) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="all">All</option>';
  [...new Set(data)].sort().forEach(v => {
    if (v) sel.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

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
    // Front-end Filter Logic
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

  const body = document.getElementById("contriBody");
  if (body) {
      body.innerHTML = html || '<tr><td colspan="7">No records found</td></tr>';
  }
  
  const totalEl = document.getElementById("totalAmt");
  if (totalEl) totalEl.textContent = total.toLocaleString();
}

/** ---------------------- PDF GENERATION ---------------------- **/

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(16);
  doc.text("Monthly Dues Report", 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Requested by: ${currentOfficer.fullName || "Officer"}`, 14, 22);
  doc.text(`Scope: ${currentOfficer.access}`, 14, 27);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  const tableData = [];
  document.querySelectorAll("#contriBody tr").forEach(tr => {
    const cols = tr.querySelectorAll("td");
    if (cols.length > 1) {
      tableData.push(Array.from(cols).map(td => td.innerText));
    }
  });

  doc.autoTable({
    startY: 38,
    head: [["ID", "Full Name", "Month", "Year", "Amount", "Posted", "Received by"]],
    body: tableData,
    headStyles: { fillColor: [30, 155, 67] }
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  doc.text(`Total Amount: PHP ${document.getElementById("totalAmt").innerText}`, 14, finalY + 10);

  doc.save(`Report_${currentOfficer.access}_${Date.now()}.pdf`);
}

// Helper Functions
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

function go(url) {
  window.location.href = url;
}

// Start the process
initDashboard();
