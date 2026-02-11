const API_KEY="AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY";
const SHEET_ID="1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A";
const SHEET_NAME="Raw_Data";

const loggedInID=sessionStorage.getItem("memberID");

let allData=[];
let allowedRows=[];
let officerInfo={};
let currentRows=[];

const barangayFilter=document.getElementById("barangayFilter");
const districtFilter=document.getElementById("districtFilter");
const generateBtn=document.getElementById("generateBtn");
const pdfBtn=document.getElementById("pdfBtn");

async function fetchData(){
  const url=`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const res=await fetch(url);
  const data=await res.json();
  allData=data.values.slice(1);
  initAccess();
}

function initAccess(){
  officerInfo=allData.find(r=>r[0]==loggedInID);
  const special=officerInfo[23];

  if(special=="All"){
    allowedRows=allData.filter(r=>r[21]=="Active");
  }else{
    allowedRows=allData.filter(r=>r[15]==special && r[21]=="Active");
    if(allowedRows.length==0){
      allowedRows=allData.filter(r=>r[14]==special && r[21]=="Active");
    }
  }
  populateFilters();
}

function populateFilters(){
  const brgySet=[...new Set(allowedRows.map(r=>r[15]))];
  const distSet=[...new Set(allowedRows.map(r=>r[14]))];

  barangayFilter.innerHTML="";
  districtFilter.innerHTML="";

  if(brgySet.length > 1){
    barangayFilter.innerHTML="<option value=''>All Barangay</option>";
  }
  if(distSet.length > 1){
    districtFilter.innerHTML="<option value=''>All District</option>";
  }

  brgySet.forEach(b=>barangayFilter.innerHTML+=`<option>${b}</option>`);
  distSet.forEach(d=>districtFilter.innerHTML+=`<option>${d}</option>`);

  barangayFilter.value = brgySet.length === 1 ? brgySet[0] : (officerInfo[15]||"");
  districtFilter.value = distSet.length === 1 ? distSet[0] : (officerInfo[14]||"");
}

function generateData(){
  let rows=[...allowedRows];
  const b=barangayFilter.value;
  const d=districtFilter.value;

  if(b) rows=rows.filter(r=>r[15]==b);
  if(d) rows=rows.filter(r=>r[14]==d);

  const tbody=document.querySelector("#dataTable tbody");
  tbody.innerHTML="";

  rows.forEach(r=>{
    tbody.innerHTML+=`
    <tr>
      <td>${r[0]}</td>
      <td>${r[7]}</td>
      <td>${r[8]}</td>
      <td>${r[13]}</td>
      <td>${r[15]}</td>
    </tr>`;
  });
  currentRows=rows;
}

function downloadPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();

  doc.text("Active Kasangga ng Batang Kankaloo Association Inc.",14,15);
  doc.text(`Requested by: ${officerInfo[7]}`,14,25);
  doc.text(`Barangay: ${barangayFilter.value||"All"}`,14,35);
  doc.text(`District: ${districtFilter.value||"All"}`,14,45);

  const tableData=currentRows.map(r=>[
    r[0],r[7],r[8],r[13],r[15]
  ]);

  doc.autoTable({
    startY:55,
    head:[["ID Number","Full Name","Address","Phone","Barangay"]],
    body:tableData
  });

  doc.save("kasangga_report.pdf");
}

generateBtn.addEventListener("click",generateData);
pdfBtn.addEventListener("click",downloadPDF);

fetchData();
