const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contribution!A:H?key=${API_KEY}`;

async function searchData(){
  const id = idNumber.value.trim();
  const errorEl = document.getElementById("error");
  const tbody = document.querySelector("#resultTable tbody");
  const totalEl = document.getElementById("totalAmount");
  const totalRow = document.getElementById("totalRow"); // <--- added
  totalRow.classList.add("hidden"); // hide initially

  errorEl.textContent = "";
  tbody.innerHTML = "";
  totalEl.textContent = "0";

  if(!id){
    errorEl.textContent = "ID Number is Empty";
    return;
  }

  const res = await fetch(URL);
  const data = await res.json();
  const rows = data.values.slice(1);

  const records = rows.filter(r => r[1] == id);

  if(records.length === 0){
    errorEl.textContent = "No records found";
    return;
  }

  fullName.value = records[0][3];
  brgy.value = records[0][4];

  let total = 0;

  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r[5]}</td>
      <td>${r[6]}</td>
      <td>${r[7]}</td>
      <td>${new Date(r[0]).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
    total += parseFloat(r[7]);
  });

  totalEl.textContent = total.toFixed(2);
}

function goBack(){
  window.history.back();
}
