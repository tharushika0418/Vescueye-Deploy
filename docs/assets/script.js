// Function to check if element is in the viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}

// Add/remove "visible" class based on scroll position
function handleScroll() {
  const images = document.querySelectorAll(".scrolling-image");
  images.forEach((image) => {
    if (isInViewport(image)) {
      image.classList.add("visible");
    } else {
      image.classList.remove("visible");
    }
  });
}

function handleFeatureBoxes() {
  const boxes = document.querySelectorAll(".feature-box");
  let delay = 0;

  boxes.forEach((box, index) => {
    if (isInViewport(box)) {
      box.style.transitionDelay = `${delay}s`;
      box.classList.add("visible");
      delay += 0.2; // increase delay for next box
    } else {
      box.classList.remove("visible");
      box.style.transitionDelay = "0s";
    }
  });
}

function handleTeamCards() {
  const cards = document.querySelectorAll(".team-card");
  let delay = 0;
  cards.forEach((card) => {
    if (isInViewport(card)) {
      card.style.transitionDelay = `${delay}s`;
      card.classList.add("visible");
      delay += 0.2; // increase delay for next card
    } else {
      card.classList.remove("visible");
      card.style.transitionDelay = "0s";
    }
  });
}

// Listen for scroll events
window.addEventListener("scroll", handleScroll);
window.addEventListener("DOMContentLoaded", handleScroll);
window.addEventListener("scroll", handleFeatureBoxes);
window.addEventListener("DOMContentLoaded", handleFeatureBoxes);
window.addEventListener("scroll", handleTeamCards);
window.addEventListener("DOMContentLoaded", handleTeamCards);
