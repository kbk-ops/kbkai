const memberID = sessionStorage.getItem("memberID");
if (!memberID) window.location.replace("../index.html");

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDE01iHOXt_0RQ9uUSPnc1uv833pH9wjwqIjkyQSBgw4U-0_vLUWErQi2iP-QH_2A4/exec";

/* ------------------ LOADER ------------------ */
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

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

  const idMatch =
    link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s200`;
  }

  return link;
}

/* ------------------ TAB NAVIGATION ------------------ */
function showTab(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function go(page) {
  window.location.replace(page);
}

function initDashboardTabs() {
  const tabs = document.querySelectorAll(".bottombar div, .center-btn");
  tabs.forEach((tab) =>
    tab.addEventListener("click", (e) => {
      const targetTab = e.currentTarget.dataset.tab;
      if (targetTab) showTab(targetTab);
    })
  );
}

/* ------------------ LOAD DASHBOARD DATA ------------------ */
function loadDashboard() {
  showLoader();

  Promise.all([
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "members" })
    }).then((r) => r.json()),
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "contributions" })
    }).then((r) => r.json())
  ])
    .then(([members, contributions]) => {
      // ---------------- PROFILE & GREETING ----------------
      const user = members.find((r) => r.id == memberID);
      const profilePic = formatImage(user?.profilePic);
      const profileImgEl = document.getElementById("profilePic");
      profileImgEl.src = profilePic;
      profileImgEl.alt = "Profile Picture";

      const hour = new Date().getHours();
      const greet =
        hour < 12
          ? "Good Morning"
          : hour < 18
          ? "Good Afternoon"
          : "Good Evening";
      document.getElementById("greet").textContent = `${greet}, ${
        user?.firstName || "Member"
      }!`;

      // ---------------- CONTRIBUTIONS TABLE ----------------
      const year = document.getElementById("yearFilter").value;
      let total = 0;
      let html = "";

      contributions
        .filter((r) => r.memberID == memberID)
        .filter((r) => year === "all" || r.year == year)
        .forEach((r) => {
          const dateObj = new Date(r.posted);
          const formattedDate =
            ("0" + (dateObj.getMonth() + 1)).slice(-2) +
            "/" +
            ("0" + dateObj.getDate()).slice(-2) +
            "/" +
            dateObj.getFullYear();

          total += Number(r.amount);

          html += `<tr>
      <td>${r.month}</td>
      <td>${r.amount}</td>
      <td>${formattedDate}</td>
    </tr>`;
        });

      document.getElementById("contriBody").innerHTML = html;
      document.getElementById("totalAmt").textContent = total;
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("greet").textContent = "Hello, Member!";
      document.getElementById("profilePic").src = formatImage("");
    })
    .finally(() => hideLoader());
}

// ------------------ INITIALIZE ------------------
initDashboardTabs();
loadDashboard();
