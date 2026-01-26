const cards = document.querySelectorAll(".card");
const fullscreen = document.getElementById("fullscreen");
const fsText = document.getElementById("fs-text");
const fsInner = document.getElementById('fs-inner');

cards.forEach(card => {
  card.addEventListener("click", () => {
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
  // Add flip-back animation
  fsInner.classList.add('flip-back');

  fsInner.addEventListener('animationend', function handler() {
    fullscreen.classList.remove('active');
    fsInner.classList.remove('flip-back'); // reset
    fsInner.removeEventListener('animationend', handler);

    // STOP THE VIDEO when the fullscreen closes
    const iframe = fullscreen.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src; // reload iframe to stop playback
    }
  });
}
