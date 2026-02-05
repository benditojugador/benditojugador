const form = document.getElementById("loginForm");
const errorP = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorP.textContent = error.message;
  } else {
    window.location.href = "dashboard.html";
  }
});
