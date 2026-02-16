const URL = "https://script.google.com/macros/s/AKfycbwAI7gXqEs_AqzPIs-L-ksTYRH9t2EWK7dMiY4OHil6pfbcMvqoypqVBmVjy0cu7_fcdg/exec";
const email = sessionStorage.getItem("registerEmail");
const referrerID = sessionStorage.getItem("referrerID");

const cap = s => s.replace(/\w\S*/g,t=>t[0].toUpperCase()+t.substr(1).toLowerCase());

const validBrgy = v =>
  /^(?:[1-9]|[1-9][0-9]|1[0-6][0-9]|17[0-5]|17[7-9]|18[0-8]|176-[A-F])$/.test(v);

const age15 = d => (new Date().getFullYear() - new Date(d).getFullYear()) >= 15;

const posAll = [
 "Barangay Manager","Asst. Barangay Manager","Secretary","Asst. Secretary",
 "Youth Coordinator","Asst. Youth Coordinator","Youth Secretary","Asst. Youth Secretary"
];

async function loadPositions(){
 const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1lDzzDvwpPTp4GGhsBQ6kH-tVhAdhuFidP0ujpDTrp9A/values/Raw_Data!P:T?key=AIzaSyBrbhdscfZ1Gwgw_jnur3z5vSKTbFEpguY`);
 const data = await res.json();
 const brgy = document.getElementById("brgy").value;
 const taken = data.values.filter(r=>r[0]==brgy).map(r=>r[4]);
 let available = posAll.filter(p=>!taken.includes(p));
 if(available.length==0) available=["Team Leader","Family Member"];
 document.getElementById("position").innerHTML =
  available.map(p=>`<option>${p}</option>`).join("");
}

document.getElementById("brgy").onblur = loadPositions;

pic.onchange = e=>{
 const f = e.target.files[0];
 preview.src = URL.createObjectURL(f);
};

form.onsubmit = async e=>{
 e.preventDefault();

 if(!/^0\d{10}$/.test(phone.value)) return;
 if(!validBrgy(brgy.value)) return;
 if(!age15(dob.value)) return;

 let addr = cap(address.value);
 if(/caloocan|kalookan|city/i.test(addr))
   addr = addr.replace(/caloocan|kalookan|city/ig,"") + " Caloocan City";

 const reader = new FileReader();
 reader.onload = async ()=>{
  await fetch(URL,{
   method:"POST",
   body: JSON.stringify({
    email,
    first_name: cap(fname.value),
    middle_name: cap(mname.value),
    last_name: cap(lname.value),
    suffix: suffix.value,
    address: addr.trim(),
    birth_date: dob.value,
    gender: gender.value,
    phone_number: phone.value,
    barangay: brgy.value,
    precint_no: precinct.value.toUpperCase(),
    referrerID,
    designation: position.value,
    picture: reader.result
   })
  });
 };
 reader.readAsDataURL(pic.files[0]);
};
