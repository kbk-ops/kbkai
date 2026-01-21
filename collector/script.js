const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";

async function verifyCollector() {
  const id = document.getElementById("collectorID").value;
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Collectors!A:B?key=${API_KEY}`);
  const data = await resp.json();
  const found = data.values?.find(r => r[0] === id);

  if (!found) {
    alert("You are not Authorize to collect monthly Dues");
    return;
  }

  document.getElementById("dashboard").hidden = false;
}

async function saveContribution() {
  const memberID = document.getElementById("memberID").value;
  const fullName = document.getElementById("fullName").value;
  const brgy = document.getElementById("brgy").value;
  const month = document.getElementById("month").value;
  const amount = document.getElementById("amount").value;

  const values = [
    [new Date().toLocaleDateString(), memberID, fullName, brgy, month, amount]
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contributions!A:F:append?valueInputOption=USER_ENTERED&key=${API_KEY}`, {
    method: "POST",
    body: JSON.stringify({ values }),
  });

  alert("Saved!");
}

document.getElementById("memberID").addEventListener("change", async function() {
  const id = this.value;
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:C?key=${API_KEY}`);
  const data = await resp.json();
  const found = data.values?.find(r => r[0] === id);
  if (found) {
    document.getElementById("fullName").value = found[2];
    document.getElementById("brgy").value = found[3];
  }
});
