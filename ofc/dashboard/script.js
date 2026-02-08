const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

const DUES_SHEET = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${DUES_SHEET}/values/Monthly_Dues!A:J?key=${API_KEY}`;

const officerFirstName = sessionStorage.getItem("officerFirstName") || "Officer";
const officerFullName = sessionStorage.getItem("officerFullName") || "Officer";
const officerAccess = sessionStorage.getItem("officerAccess") || "All";

document.getElementById("greet").textContent = `Hello ${officerFirstName}!`;
document.getElementById("profilePic").src =
  "https://raw.github.com/kbk-ops/OrganizationFund/main/Icons/profileicon.png";

document.body.classList.remove("locked");
document.getElementById("app").classList.remove("hidden");

function showTab(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(url) {
  window.location.href = url;
}

/* ---------------------- LOAD FILTER OPTIONS ---------------------- */
fetch(DUES_URL)
  .then((r) => r.json())
  .then((d) => {
    const rows = d.values.slice(1);
    fillSelect("fBrgy", rows.map((r) => r[3]));
    fillSelect("fDistrict", rows.map((r) => r[4]));
    fillSelect("fMonth", rows.map((r) => r[6]));
    fillSelect("fYear", rows.map((r) => r[5]));
    fillSelect("fReceived", rows.map((r) => r[9]));
  });

function fillSelect(id, data) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="all">All</option>';
  [...new Set(data)].forEach((v) => {
    if (v) sel.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

/* ---------------------- LOAD CONTRIBUTIONS ---------------------- */
function loadContributions() {
  fetch(DUES_URL)
    .then((r) => r.json())
    .then((d) => {
      const rows = d.values.slice(1);

      const fID = document.getElementById("fID").value;
      const fBrgy = document.getElementById("fBrgy").value;
      const fDistrict = document.getElementById("fDistrict").value;
      const fMonth = document.getElementById("fMonth").value;
      const fYear = document.getElementById("fYear").value;
      const fReceived = document.getElementById("fReceived").value;

      let html = "";
      let total = 0;

      // ----------------------
      // DETERMINE COLUMN FILTER FOR OFFICER ACCESS
      // ----------------------
      let filterColumn = null; // 3 = D, 4 = E
      if (officerAccess !== "All") {
        const hasD = rows.some(r => r[3] === officerAccess);
        const hasE = rows.some(r => r[4] === officerAccess);
        if (hasD) filterColumn = 3;
        else if (hasE) filterColumn = 4;
      }

      rows.forEach((r) => {
        // ----------------------
        // ACCESS CONTROL
        // ----------------------
        if (officerAccess !== "All" && filterColumn !== null) {
          if (r[filterColumn] !== officerAccess) return;
        }

        // ----------------------
        // FILTERS
        // ----------------------
        if (fID && fID !== "all" && r[1] != fID) return;
        if (fBrgy !== "all" && r[3] != fBrgy) return;
        if (fDistrict !== "all" && r[4] != fDistrict) return;
        if (fMonth !== "all" && r[6] != fMonth) return;
        if (fYear !== "all" && r[5] != fYear) return;
        if (fReceived !== "all" && r[9] != fReceived) return;

        total += Number(r[7] || 0);

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
      document.getElementById("totalAmt").textContent = total.toLocaleString();
    });
}

/* ---------------------- PDF DOWNLOAD ---------------------- */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const brgy = document.getElementById("fBrgy").value;
  const month = document.getElementById("fMonth").value;

  doc.setFontSize(12);
  doc.text(`Requested by: ${officerFullName}`, 14, 15);
  doc.text(`Barangay: ${brgy}`, 14, 22);
  doc.text(`Month: ${month}`, 14, 29);

  const rows = [];
  document.querySelectorAll("#contriBody tr").forEach((tr) => {
    const cols = tr.querySelectorAll("td");
    rows.push([
      cols[0].innerText,
      cols[1].innerText,
      cols[2].innerText,
      cols[3].innerText,
      cols[4].innerText,
      cols[5].innerText,
      cols[6].innerText,
    ]);
  });

  doc.autoTable({
    startY: 40,
    head: [["ID", "Full Name", "Month", "Year", "Amount", "Posted", "Received By"]],
    body: rows,
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  doc.text(`Total: ${document.getElementById("totalAmt").innerText}`, 14, finalY + 10);

  doc.save(`monthlydues_${brgy}.pdf`);
}
