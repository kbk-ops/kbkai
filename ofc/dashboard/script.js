const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

// Sheet URLs
const OFFICERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Officers!A:F?key=${API_KEY}`;
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;

// Get current user ID from session (set during login)
const loggedInID = sessionStorage.getItem("officerID"); 

// Global variables for data handling
let allowedRows = [];
let currentOfficer = {};

// Initial Load
async function init() {
  try {
    // 1. Fetch Officer Data to verify Access
    const offRes = await fetch(OFFICERS_URL);
    const offData = await offRes.json();
    const officers = offData.values || [];
    
    // Find the specific officer row by ID (Column A)
    const officerRow = officers.find(row => row[0] === loggedInID);

    if (!officerRow) {
      alert("Access Denied: Officer ID not found in database.");
      window.location.href = "../../index.html"; 
      return;
    }

    // Assign Officer Info (A=ID, B=First, C=Full, D=Brgy, E=Dist, F=Access)
    currentOfficer = {
      id: officerRow[0],
      firstName: officerRow[1],
      fullName: officerRow[2],
      barangay: officerRow[3],
      district: officerRow[4],
      access: officerRow[5]
    };

    // Update UI Header
    document.getElementById("greet").textContent = `Hello ${currentOfficer.firstName}!`;
    document.getElementById("profilePic").src = "https://raw.github.com/kbk-ops/OrganizationFund/main/Icons/profileicon.png";
    document.body.classList.remove("locked");
    document.getElementById("app").classList.remove("hidden");

    // 2. Fetch Monthly Dues Data
    const duesRes = await fetch(DUES_URL);
    const duesData = await duesRes.json();
    const allDuesRows = duesData.values ? duesData.values.slice(1) : [];

    // 3. Apply Restriction Goal Logic
    const accessValue = currentOfficer.access;

    if (accessValue === "All") {
      // Goal 1: If access is "All", show everything
      allowedRows = allDuesRows;
    } else {
      // Goal 2: Try to find exact match in Barangay (Dues Column D / Index 3)
      const brgyMatches = allDuesRows.filter(row => row[3] === accessValue);
      
      if (brgyMatches.length > 0) {
        allowedRows = brgyMatches;
      } else {
        // Goal 3: If no Brgy match, look for match in District (Dues Column E / Index 4)
        const distMatches = allDuesRows.filter(row => row[4] === accessValue);
        allowedRows = distMatches;
      }
    }

    // 4. Populate the Filter Dropdowns based on allowed data
    fillSelect("fBrgy", allowedRows.map(r => r[3]));
    fillSelect("fDistrict", allowedRows.map(r => r[4]));
    fillSelect("fMonth", allowedRows.map(r => r[6]));
    fillSelect("fYear", allowedRows.map(r => r[5]));
    fillSelect("fReceived", allowedRows.map(r => r[9]));

    // 5. Initial Table Load
    loadContributions();

  } catch (err) {
    console.error("Initialization error:", err);
    alert("Error loading data. Please check your internet connection.");
  }
}

/** ---------------------- UTILITY FUNCTIONS ---------------------- **/

function fillSelect(id, data) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="all">All</option>';
  // Remove duplicates and sort
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
    // UI Filter checks (ID, Brgy, Dist, Month, Year, Collector)
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

  document.getElementById("contriBody").innerHTML = html || '<tr><td colspan="7">No matching records found</td></tr>';
  document.getElementById("totalAmt").textContent = total.toLocaleString();
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(16);
  doc.text("Monthly Dues Report", 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Requested by: ${currentOfficer.fullName}`, 14, 22);
  doc.text(`Access Filter: ${currentOfficer.access}`, 14, 27);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 32);

  const tableRows = [];
  document.querySelectorAll("#contriBody tr").forEach(tr => {
    const cols = tr.querySelectorAll("td");
    if (cols.length > 1) {
      tableRows.push(Array.from(cols).map(td => td.innerText));
    }
  });

  doc.autoTable({
    startY: 38,
    head: [["ID", "Full Name", "Month", "Year", "Amount", "Timestamp", "Collector"]],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 155, 67] }
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  doc.setFont(undefined, 'bold');
  doc.text(`Total: PHP ${document.getElementById("totalAmt").innerText}`, 14, finalY + 10);

  doc.save(`Dues_${currentOfficer.access}_${Date.now()}.pdf`);
}

function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(url) {
  window.location.href = url;
}

function logout() {
  sessionStorage.clear();
  window.location.href = "../../index.html"; 
}

// Start the app
init();
