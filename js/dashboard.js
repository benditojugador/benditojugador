const logoutBtn = document.getElementById("logout");

async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) {
    window.location.href = "login.html";
  }
}

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
});

checkUser();
