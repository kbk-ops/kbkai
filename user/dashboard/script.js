const memberID = sessionStorage.getItem("memberID");
if (!memberID) window.location.replace("../index.html");

const API_URL = "https://script.google.com/macros/s/AKfycbzDE01iHOXt_0RQ9uUSPnc1uv833pH9wjwqIjkyQSBgw4U-0_vLUWErQi2iP-QH_2A4/exec"; 

/* ------------------ DEFAULT PROFILE IMAGE ------------------ */
function formatImage(link) {
  const defaultProfile =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <circle cx='100' cy='100' r='100' fill='#e0e0e0'/>
      <circle cx='100' cy='80' r='35' fill='#9e9e9e'/>
      <path d='M40 160c0-30 25-50 60-50s60 20 60 50' fill='#9e9e9e'/>
    </svg>
  `);

  if (!link || link.trim() === "") return defaultProfile;

  const idMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s200`;
  }

  return link; // use original if not a Drive link
}

/* ------------------ TAB NAVIGATION ------------------ */
function showTab(id) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(page) {
  window.location.replace(page);
}

/* ------------------ GREETING ------------------ */
fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({ action: "members" })
})
  .then(res => res.json())
  .then(rows => {
    const user = rows.find(r => r.id == memberID);
    const name = user?.firstName || "Member";

    // Set profile picture
    const profilePic = formatImage(user?.profilePic);
    const profileImgEl = document.getElementById("profilePic");
    profileImgEl.src = profilePic;
    profileImgEl.alt = "Profile Picture";

    // Time-based greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    document.getElementById("greet").textContent = `${greet}, ${name}!`;

    console.log("Profile picture URL:", profilePic); // debug
  })
  .catch(() => {
    document.getElementById("greet").textContent = "Hello, Member!";
    document.getElementById("profilePic").src = formatImage("");
  });

/* ------------------ CONTRIBUTION TABLE ------------------ */
function loadContributions() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "contributions" })
  })
    .then(res => res.json())
    .then(rows => {
      const year = document.getElementById("yearFilter").value;
      let total = 0;
      let html = "";

      rows
        .filter(r => r.memberID == memberID)
        .filter(r => year === "all" || r.year == year)
        .forEach(r => {
          total += Number(r.amount);
          html += `<tr>
            <td>${r.month}</td>
            <td>${r.amount}</td>
            <td>${r.posted}</td>
          </tr>`;
        });

      document.getElementById("contriBody").innerHTML = html;
      document.getElementById("totalAmt").textContent = total;
    })
    .catch(err => console.error(err));
}

// Load contributions initially
loadContributions();

/* ------------------ INITIALIZE DASHBOARD TABS ------------------ */
function initDashboardTabs() {
  const tabs = document.querySelectorAll(".bottombar div, .center-btn");
  tabs.forEach(tab => tab.addEventListener("click", e => {
    const targetTab = e.currentTarget.dataset.tab;
    if (targetTab) showTab(targetTab);
  }));
}

// Call after page load
initDashboardTabs();
