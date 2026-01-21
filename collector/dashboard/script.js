const API_KEY="AIzaSyByoZuo-QPFOfz1Kuqcc_V4CxFr7G5mW_c";
const SHEET_ID="1SoF6jtjeu7dWUHcTAL02_TKLBFslQgEpEbKQMHyFVdk";
const MEMBERS_URL=`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Members!A:D?key=${API_KEY}`;
const WEBAPP_URL="https://script.google.com/macros/s/AKfycbzMWIlDBNuuQg8vSc7tSC_-WYQMnud6__-cPWkM7L1ZJgZHy8pDwOGhFWTeqYYlewGi/exec";

const collectorID=sessionStorage.getItem("collectorID");

new Html5Qrcode("reader").start(
 { facingMode: "environment" },
 {},
 qr => { document.getElementById("idNumber").value=qr; loadMember(); }
);

document.getElementById("idNumber").onchange=loadMember;

async function loadMember(){
 const id=document.getElementById("idNumber").value.trim();
 const res=await fetch(MEMBERS_URL);
 const data=await res.json();
 const row=data.values.find(r=>r[0]==id);
 if(row){
  fullName.value=row[2];
  brgy.value=row[3];
 }
}

async function submitData(){
 if(!confirm("Do you want to submit?")) return;
 const payload={
  id:idNumber.value,
  name:fullName.value,
  brgy:brgy.value,
  year:year.value,
  month:month.value,
  amount:amount.value,
  collector:collectorID
 };
 await fetch(WEBAPP_URL,{method:"POST",body:JSON.stringify(payload)});
 location.reload();
}

function reloadPage(){
 if(confirm("Are you sure?")) location.reload();
}

function exitPage(){
 if(confirm("Are you sure?")) window.close();
}
