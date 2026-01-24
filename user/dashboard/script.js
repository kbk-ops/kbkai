const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";

const MEMBERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:F?key=${API_KEY}`;
const CONTRI_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contribution!A:H?key=${API_KEY}`;

const memberID = sessionStorage.getItem("memberID");
if(!memberID) location.href="../index.html";

function showTab(id){
  document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(page){
  location.href = page;
}

window.onload = () => {
fetch(MEMBERS_URL)
.then(r => r.json())
.then(d => {
  const rows = d.values.slice(1);
  const user = rows.find(r => r[0] == memberID);

  if (!user) return;

  const name = user[1];     // Column B
  const photo = user[5];    // Column F

  document.getElementById("greet").textContent = `Hi ${name}!`;
  document.getElementById("profilePic").src = photo || "https://via.placeholder.com/100";
});
};

function loadContributions(){
  fetch(CONTRI_URL)
  .then(r=>r.json())
  .then(d=>{
    const rows=d.values.slice(1);
    const year=document.getElementById("yearFilter").value;
    let total=0;
    let html="";

    rows.filter(r=>r[1]==memberID)
        .filter(r=>year=="all" || r[5]==year)
        .forEach(r=>{
          total+=Number(r[7]);
          html+=`<tr>
            <td>${r[6]}</td>
            <td>${r[7]}</td>
            <td>${r[0]}</td>
          </tr>`;
        });

    document.getElementById("contriBody").innerHTML=html;
    document.getElementById("totalAmt").textContent=total;
  });
}

loadContributions();
