const cards = document.querySelectorAll(".card");
const fullscreen = document.getElementById("fullscreen");
const fsText = document.getElementById("fs-text");

cards.forEach(card => {
  card.addEventListener("click", () => {
    // Get the back content of the clicked card
    const backContent = card.querySelector(".card-back").innerHTML;

    // Show fullscreen with that content
    fsText.innerHTML = backContent;
    fullscreen.classList.add("active");
  });
});

function closeFullscreen() {
  fullscreen.classList.remove("active");
}
