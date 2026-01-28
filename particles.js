const canvas = document.getElementById("particles-bg");
const ctx = canvas.getContext("2d");

let particlesArray;
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);

const colors = [
  "rgba(50, 150, 50, 0.8)", // green
  "rgba(255, 165, 0, 0.8)", // orange
  "rgba(255, 50, 50, 0.8)" // red
];

const maxDistance = 120; // distance to draw lines

class Particle {
  constructor() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce on edges
    if (this.x < 0 || this.x > w) this.speedX = -this.speedX;
    if (this.y < 0 || this.y > h) this.speedY = -this.speedY;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function init() {
  particlesArray = [];
  for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle());
  }
}

function connectParticles() {
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      const dx = particlesArray[a].x - particlesArray[b].x;
      const dy = particlesArray[a].y - particlesArray[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        ctx.strokeStyle = `rgba(100, 100, 100, ${1 - distance / maxDistance})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, w, h);
  particlesArray.forEach((p) => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animate);
}

// Resize handling
window.addEventListener("resize", () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  init();
});

init();
animate();
