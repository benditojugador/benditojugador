const form = document.getElementById("loginForm");
const errorP = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const contra = document.getElementById("password").value;

  const { data, error } = await supabaseClient
    .from("usuario")
    .select("*")
    .eq("nombre", nombre)
    .eq("contra", contra)
    .single();

  if (error || !data) {
    errorP.textContent = "Usuario o contraseña incorrectos";
    return;
  }

  // guardar sesión simple
  localStorage.setItem("usuario", JSON.stringify(data));

  window.location.href = "dashboard.html";
});
