const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";

// URLs
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Monthly_Dues!A:J?key=${API_KEY}`;
const RAW_DATA_URL = `https://sheets.googleapis.com/v4/spreadsheets/1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A/values/Raw_Data!A:X?key=${API_KEY}`;

// Officer info from sessionStorage
const officerID = sessionStorage.getItem("memberID");
const officerFirstName = sessionStorage.getItem("officerFirstName") || "Officer";
const officerFullName = sessionStorage.getItem("officerFullName") || "Officer";
const officerBrgy = sessionStorage.getItem("officerBrgy") || "All";
const officerDistrict = sessionStorage.getItem("officerDistrict") || "All";
const officerAccess = sessionStorage.getItem("officerAccess") || "All";

// Redirect if not logged in
if (!officerID) {
  window.location.replace("../index.html");
}

// Greeting
document.getElementById("greet").textContent = `Hello ${officerFirstName}!`;

// -------------------------
// Tab navigation
// -------------------------
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(page) {
  window.location.replace(page);
}

// -------------------------
// Load Contributions with access control
// -------------------------
async function loadContributions() {
  try {
    const res = await fetch(DUES_URL);
    const data = await res.json();
    const rows = data.values?.slice(1) || [];

    const yearFilter = document.getElementById("fYear")?.value.toLowerCase() || "all";
    const idFilter = document.getElementById("fID")?.value.toLowerCase() || "all";
    const brgyFilter = document.getElementById("fBrgy")?.value.toLowerCase() || "all";
    const districtFilter = document.getElementById("fDistrict")?.value.toLowerCase() || "all";
    const monthFilter = document.getElementById("fMonth")?.value.toLowerCase() || "all";
    const receivedByFilter = document.getElementById("fReceivedBy")?.value.toLowerCase() || "all";

    let total = 0;
    let html = "";

    rows.forEach(r => {
      const rowAccess = r[23] || "All"; // Column X in Raw_Data

      // -----------------------------
      // ACCESS CONTROL
      // -----------------------------
      if (rowAccess !== "All" && rowAccess !== officerAccess) return;

      // Filters
      if (idFilter !== "all" && r[1].toLowerCase() !== idFilter) return;
      if (brgyFilter !== "all" && r[3].toLowerCase() !== brgyFilter) return;
      if (districtFilter !== "all" && r[4].toLowerCase() !== districtFilter) return;
      if (monthFilter !== "all" && r[6].toLowerCase() !== monthFilter) return;
      if (yearFilter !== "all" && r[5] !== yearFilter) return;
      if (receivedByFilter !== "all" && r[9].toLowerCase() !== receivedByFilter) return;

      total += Number(r[7]);
      html += `<tr>
        <td>${r[1]}</td>
        <td>${r[2]}</td>
        <td>${r[6]}</td>
        <td>${r[5]}</td>
        <td>${r[7]}</td>
        <td>${r[0]}</td>
        <td>${r[9]}</td>
      </tr>`;
    });

    document.getElementById("contriBody").innerHTML = html;
    document.getElementById("totalAmt").textContent = total;

  } catch (err) {
    console.error(err);
  }
}

// Initial load
loadContributions();

// -------------------------
// Download PDF
// -------------------------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  const brgy = document.getElementById("fBrgy")?.value || "All";
  const month = document.getElementById("fMonth")?.value || "All";

  doc.setFontSize(12);
  doc.text(`Requested by: ${officerFullName}`, 14, 15); // full name for PDF
  doc.text(`Barangay: ${brgy}`, 14, 22);
  doc.text(`Month: ${month}`, 14, 29);

  const rows = [];
  document.querySelectorAll("#contriBody tr").forEach(tr => {
    const cols = tr.querySelectorAll("td");
    rows.push([
      cols[0].innerText,
      cols[1].innerText,
      cols[2].innerText,
      cols[3].innerText,
      cols[4].innerText,
      cols[5].innerText,
      cols[6].innerText
    ]);
  });

  doc.autoTable({
    startY: 40,
    head: [[
      "ID","Full Name","Month","Year","Amount","Posted","Received By"
    ]],
    body: rows
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  doc.text(`Total: ${document.getElementById("totalAmt").innerText}`, 14, finalY + 10);

  doc.save(`monthlydues_${brgy}.pdf`);
}
