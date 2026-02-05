const logoutBtn = document.getElementById("logout");

// ====== CHECK DE SESIÓN MANUAL ======
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "login.html";
}

// ejemplo: mostrar rol
console.log("Rol:", usuario.rol);

// ====== LOGOUT ======
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
});
