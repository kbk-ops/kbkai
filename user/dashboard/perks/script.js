const cards = document.querySelectorAll(".card");
const fullscreen = document.getElementById("fullscreen");
const fsText = document.getElementById("fs-text");

cards.forEach(card=>{
  card.addEventListener("click",()=>{
    fsText.textContent = card.dataset.text;
    fullscreen.classList.add("active");
  });
});

function closeFullscreen(){
  fullscreen.classList.remove("active");
}
