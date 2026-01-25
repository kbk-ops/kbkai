const cards = document.querySelectorAll(".card");
const fullscreen = document.getElementById("fullscreen");
const fsText = document.getElementById("fs-text");
const fsInner = document.getElementById("fs-inner");

cards.forEach(card=>{
  card.addEventListener("click",()=>{
    card.classList.add("flipped");

    setTimeout(()=>{
      fsText.textContent = card.dataset.text;
      fullscreen.classList.add("active");
      card.classList.remove("flipped");
    },600);
  });
});

function closeFullscreen(){
  fullscreen.classList.remove("active");
}
