const cards = document.querySelectorAll(".card");
const fullscreen = document.getElementById("fullscreen");
const fsText = document.getElementById("fs-text");

cards.forEach(card=>{
  card.addEventListener("click",()=>{
    card.classList.add("flipped"); // triggers blank flip

    setTimeout(() => {
      const back = card.querySelector(".card-back");
      if (back) {
        fsText.innerHTML = back.innerHTML; // Show the back div content
      }
      fullscreen.classList.add("active");
      card.classList.remove("flipped");
    }, 600);
  });
});

function closeFullscreen() {
  fullscreen.classList.remove("active");
}
