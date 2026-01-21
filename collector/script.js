const API_KEY = "AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID = "1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";

async function verifyCollector() {
  const id = document.getElementById("collectorID").value.trim();

  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Collectors!A:B?key=${API_KEY}`);
  const data = await resp.json();

  const found = data.values.some(r => r[0].toString().trim() === id);

  if (!found) {
    alert("You are not Authorize to collect monthly Dues");
    return;
  }

  document.getElementById("login").hidden = true;
  document.getElementById("form").hidden = false;
  startScanner();
}

function startScanner() {
  const qr = new Html5Qrcode("reader");
  qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    code => {
      document.getElementById("memberID").value = code;
      lookupMember();
    }
  );
}

document.getElementById("memberID").addEventListener("input", lookupMember);

async function lookupMember() {
  const id = document.getElementById("memberID").value.trim();

  if (id === "") {
    document.getElementById("fullName").value = "";
    document.getElementById("brgy").value = "";
    return;
  }

  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:C?key=${API_KEY}`);
  const data = await resp.json();

  const found = data.values.find(r => r[0].toString().trim() === id);

  if (!found) {
    document.getElementById("fullName").value = "";
    document.getElementById("brgy").value = "";
    return;
  }

  document.getElementById("fullName").value = found[1];
  document.getElementById("brgy").value = found[2];
}

async function saveContribution() {
  const memberID = document.getElementById("memberID").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const brgy = document.getElementById("brgy").value.trim();
  const month = document.getElementById("month").value;
  const amount = document.getElementById("amount").value;

  if (!memberID || !fullName || !brgy || !month || !amount) {
    alert("All fields required");
    return;
  }

  const values = [
    [new Date().toLocaleDateString(), memberID, fullName, brgy, month, amount]
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Contributions!A:F:append?valueInputOption=USER_ENTERED&key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values })
  });

  document.getElementById("memberID").value = "";
  document.getElementById("fullName").value = "";
  document.getElementById("brgy").value = "";
  document.getElementById("month").value = "";
  document.getElementById("amount").value = "";

  alert("Saved");
}
