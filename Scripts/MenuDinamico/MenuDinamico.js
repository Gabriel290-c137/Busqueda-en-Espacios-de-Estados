const video = document.getElementById("bg-video");
const buttons = document.querySelectorAll("ol a");

const defaultSrc = video.querySelector("source").src;

buttons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    const newSrc = btn.getAttribute("data-bg");
    if (newSrc && video.querySelector("source").src !== newSrc) {
      video.querySelector("source").src = newSrc;
      video.load();
      video.play();
    }
  });

  btn.addEventListener("mouseleave", () => {
    if (video.querySelector("source").src !== defaultSrc) {
      video.querySelector("source").src = defaultSrc;
      video.load();
      video.play();
    }
  });
});
