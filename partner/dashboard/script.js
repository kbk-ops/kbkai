const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwoC7cXas7-YAI8hu-8UyvkhpRvyrPuQ1v3lz7NXozcEYDh7pQoO1-sBeLGk3E8nhzswQ/exec";

let sheetData = [];

async function loadData() {
  const loader = document.getElementById("loader");
  loader.style.display = "block"; // show loader

  try {
    const res = await fetch(WEB_APP_URL);
    sheetData = await res.json();
  } catch (err) {
    console.error("Failed to fetch sheet data:", err);
    alert("Failed to load data!");
  }

  loader.style.display = "none"; // hide loader
}

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

  const idMatch = link.match(/id=([^&]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s200`;
  }

  return defaultProfile;
}

/* ------------------ TAB NAVIGATION ------------------ */
function showTab(id) {
  // Switch tab
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // If returning to homeTab, clear search input and results
  if (id === "homeTab") {
    document.getElementById("searchInput").value = "";
    document.getElementById("results").innerHTML = "";
  }
}

/* ------------------ Search Member ------------------ */
function searchMember() {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  setTimeout(() => {
    const keyword = document
      .getElementById("searchInput")
      .value.toLowerCase()
      .trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!sheetData.length) {
      loader.style.display = "none";
      return;
    }

    const matches = sheetData.slice(1).filter((row) => {
      const id = row[0]?.toLowerCase() || "";
      const first = row[3]?.toLowerCase() || "";
      const last = row[5]?.toLowerCase() || "";
      return (
        id.includes(keyword) ||
        first.includes(keyword) ||
        last.includes(keyword)
      );
    });

    if (matches.length === 0) {
      resultsDiv.innerHTML = "<p>No member found.</p>";
    } else {
      matches.forEach((row) => {
        const id = row[0];
        const first = row[3];
        const middle = row[4];
        const last = row[5];
        const suffix = row[6] || "";
        const position = row[19] || "";
        const barangay = row[15] || "";
        const picture = formatImage(row[20]);
        const fullFirst = suffix ? `${first} ${suffix}` : first;

        const card = document.createElement("div");
        card.className = "member-card";
        card.innerHTML = `
  <img src="${picture}">
  <div class="member-info">
    <h3>${fullFirst} ${last}</h3> <!-- full name bold on top -->
    <p><strong>ID Number:</strong> ${id}</p>
    <p><strong>Last Name:</strong> ${last}</p>
    <p><strong>First Name:</strong> ${fullFirst}</p>
    <p><strong>Middle Name:</strong> ${middle}</p>
    <p><strong>Position:</strong> ${position}</p>
    <p><strong>Barangay:</strong> ${barangay}</p>
  </div>
`;
        resultsDiv.appendChild(card);
      });
    }

    loader.style.display = "none";
  }, 300);
}

loadData();
