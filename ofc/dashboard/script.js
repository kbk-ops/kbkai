const API_KEY = "AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";

const DUES_SHEET = "1uTqiPjXSExPlf69unDi7Z1_deJCqvPIGvU3eh08qyoU";
const DUES_URL = `https://sheets.googleapis.com/v4/spreadsheets/${DUES_SHEET}/values/Monthly_Dues!A:J?key=${API_KEY}`;

const officerName = sessionStorage.getItem("officerName") || "Officer";
document.getElementById("greet").textContent = `Welcome, ${officerName}!`;
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

/* LOAD FILTER OPTIONS */
fetch(DUES_URL)
  .then((r) => r.json())
  .then((d) => {
    const rows = d.values.slice(1);
    fillSelect(
      "fBrgy",
      rows.map((r) => r[3])
    );
    fillSelect(
      "fDistrict",
      rows.map((r) => r[4])
    );
    fillSelect(
      "fMonth",
      rows.map((r) => r[6])
    );
    fillSelect(
      "fYear",
      rows.map((r) => r[5])
    );
    fillSelect(
      "fReceived",
      rows.map((r) => r[9])
    );
  });

function fillSelect(id, data) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="all">All</option>';
  [...new Set(data)].forEach((v) => {
    if (v) sel.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

/* CONTRIBUTION */
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

      rows
        .filter(
          (r) =>
            (!fID || r[1] == fID) &&
            (fBrgy == "all" || r[3] == fBrgy) &&
            (fDistrict == "all" || r[4] == fDistrict) &&
            (fMonth == "all" || r[6] == fMonth) &&
            (fYear == "all" || r[5] == fYear) &&
            (fReceived == "all" || r[9] == fReceived)
        )
        .forEach((r) => {
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

/* PDF */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Requested by: ${officerName}`, 10, 10);
  doc.text(`Barangay: ${fBrgy.value}`, 10, 18);
  doc.text(`Month: ${fMonth.value}`, 10, 26);
  doc.fromHTML(document.querySelector("table"), 10, 40);
  doc.save("contributions.pdf");
}
