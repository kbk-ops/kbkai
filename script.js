document.querySelectorAll(".portal-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Shake effect
    button.classList.add("shake");

    setTimeout(() => {
      button.classList.remove("shake");

      // Redirect after shake
      const link = button.getAttribute("data-link");
      if (link) {
        window.location.href = link;
      }
    }, 300);
  });
});
