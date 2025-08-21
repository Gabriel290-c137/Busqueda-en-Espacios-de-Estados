// /Scripts/Music/Sountrack.js
const audio = document.getElementById('bg-audio');

document.addEventListener('DOMContentLoaded', () => {
  // Primer clic activa el audio
  document.body.addEventListener('click', () => {
    audio.play();
  }, { once: true });
});

document.addEventListener("DOMContentLoaded", () => {
  const menuSound = document.getElementById("menu-sound");
  const botones = document.querySelectorAll("ol a");

  botones.forEach(boton => {
    boton.addEventListener("click", (e) => {
      e.preventDefault(); // evita que el enlace cambie de página inmediatamente
      menuSound.currentTime = 0; // reinicia el sonido
      menuSound.play().then(() => {
        // tras reproducir el sonido, redirige
        setTimeout(() => {
          window.location.href = boton.href;
        }, 300); // espera 300ms aprox para que suene el clic
      }).catch(err => console.log("Error al reproducir:", err));
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const menuSound = document.getElementById("menu-sound");
  const controles = document.querySelectorAll(".controls button, .controls a");

  controles.forEach(control => {
    control.addEventListener("click", (e) => {
      // Si es un link, espera un poquito antes de navegar
      if (control.tagName === "A") {
        e.preventDefault();
        menuSound.currentTime = 0;
        menuSound.play().then(() => {
          setTimeout(() => {
            window.location.href = control.href;
          }, 300);
        });
      } else {
        // Si es botón normal, solo sonar
        menuSound.currentTime = 0;
        menuSound.play();
      }
    });
  });
});