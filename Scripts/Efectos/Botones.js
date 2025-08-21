//Botones.js
const btns = document.querySelectorAll(".btn__");

btns.forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.setProperty("--x", x + "px");
    btn.style.setProperty("--y", y + "px");
  });
});