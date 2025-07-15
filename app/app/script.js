// Button Bounce and Redirect
function bounceAndGo(button) {
  button.classList.add("clicked");

  // Remove class and redirect after animation
  setTimeout(() => {
    button.classList.remove("clicked");
    window.location.href = "chat.html";
  }, 600); // Duration matches CSS animation
}

// Hamburger Animation
const hamburgerIcon = document.getElementById("hamburgerIcon");
const offcanvasEl = document.getElementById("offcanvasMenu");

offcanvasEl.addEventListener("show.bs.offcanvas", () => {
  hamburgerIcon.classList.remove("bi-list");
  hamburgerIcon.classList.add("bi-x");
});

offcanvasEl.addEventListener("hide.bs.offcanvas", () => {
  hamburgerIcon.classList.remove("bi-x");
  hamburgerIcon.classList.add("bi-list");
});

// Loading Screen
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 600);
});



