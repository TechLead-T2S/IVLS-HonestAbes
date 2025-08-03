const header = document.querySelector("header");

// Logo loading verification
const logo = document.querySelector(".logo");
if (logo) {
  logo.addEventListener('load', () => {
    console.log('Logo loaded successfully');
  });
  logo.addEventListener('error', () => {
    console.error('Logo failed to load');
  });
}

const images = [
  "images/fire.jpg",
  "images/plainlogs.jpg",
  "images/greenlog.jpg",
  "images/samplegreenbg.jpg"
];

let index = 0;

// Set initial background
header.style.backgroundImage = `url('${images[0]}')`;
header.style.backgroundSize = 'cover';
header.style.backgroundPosition = 'center';
header.style.backgroundRepeat = 'no-repeat';

setInterval(() => {
  index = (index + 1) % images.length;
  header.style.backgroundImage = `url('${images[index]}')`;
  header.style.backgroundSize = 'cover';
  header.style.backgroundPosition = 'center';
  header.style.backgroundRepeat = 'no-repeat';
}, 3000); // 3 seconds image switch

const scrollHeader = document.getElementById("scrollHeader");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    scrollHeader.style.display = "flex";
  } else {
    scrollHeader.style.display = "none";
  }
});
