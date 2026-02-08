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
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Filter" to view data.</td></tr>';

  } catch (err) {
    console.error("Initialization error:", err);
  }
}

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
    doc.setFontSize(10);
    doc.text(`Requested by: ${currentOfficer.fullName || "Officer"}`, 14, 22);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 27);

    const tableData = [];
    tableRows.forEach(tr => {
      const cols = tr.querySelectorAll("td");
      if (cols.length > 1) tableData.push(Array.from(cols).map(td => td.innerText));
    });

    doc.autoTable({
      startY: 35,
      head: [["ID", "Full Name", "Month", "Year", "Amount", "Posted", "Received By"]],
      body: tableData,
      headStyles: { fillColor: [30, 155, 67] }
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.text(`Total: PHP ${document.getElementById("totalAmt").textContent}`, 14, finalY + 10);
    doc.save(`Dues_Report_${Date.now()}.pdf`);
  } catch (err) {
    console.error("PDF Error:", err);
    alert("Error generating PDF.");
  }
}

function showTab(id) {
  if (id === 'homeTab' || id === 'aboutTab') {
    refreshFilterUI();
    document.getElementById("contriBody").innerHTML = '<tr><td colspan="7">Adjust filters and click "Filter" to view data.</td></tr>';
    document.getElementById("totalAmt").textContent = "0";
  }
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
