const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";

const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:F?key=${API_KEY}`;
const CONTRI_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contribution!A:H?key=${API_KEY}`;

const memberID = sessionStorage.getItem("memberID");
if (!memberID) {
  window.location.replace("../index.html");
}

// Generic profile picture (always)
const GENERIC_ICON = "https://raw.github.com/kbk-ops/OrganizationFund/main/Icons/profileicon.png";

/* ------------------ TAB NAVIGATION ------------------ */
function showTab(id){
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(page) {
  window.location.replace(page);
}

/* ------------------ GREETING ------------------ */
fetch(MEMBERS_URL)
  .then(r => r.json())
  .then(d => {
    const rows = d.values?.slice(1) || [];
    const user = rows.find(r => r[0] == memberID);

    const name = user?.[1] || "Member";

    // Set generic profile picture
    const profileImg = document.getElementById("profilePic");
    profileImg.src = GENERIC_ICON;
    profileImg.alt = "Profile Picture";

    // Time-based greeting
    const hour = new Date().getHours();
    let greet = hour < 12 ? "Good Morning" :
                hour < 18 ? "Good Afternoon" :
                "Good Evening";

    document.getElementById("greet").textContent = `${greet}, ${name}!`;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("greet").textContent = "Hello, Member!";
    document.getElementById("profilePic").src = GENERIC_ICON;
  });

/* ------------------ CONTRIBUTION TABLE ------------------ */
function loadContributions(){
  fetch(CONTRI_URL)
    .then(r => r.json())
    .then(d => {
      const rows = d.values?.slice(1) || [];
      const year = document.getElementById("yearFilter").value;
      let total = 0;
      let html = "";

      rows
        .filter(r => r[1] == memberID)
        .filter(r => year == "all" || r[5] == year)
        .forEach(r => {
          total += Number(r[7]);
          html += `<tr>
            <td>${r[6]}</td>
            <td>${r[7]}</td>
            <td>${r[0]}</td>
          </tr>`;
        });

      document.getElementById("contriBody").innerHTML = html;
      document.getElementById("totalAmt").textContent = total;
    })
    .catch(err => console.error(err));
}

// Load contributions initially
loadContributions();
initDashboardTabs();
