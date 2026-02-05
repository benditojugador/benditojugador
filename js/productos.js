const grid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");

let productos = [];

async function cargarProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  productos = data;
  renderProductos(productos);
}

function renderProductos(lista) {
  grid.innerHTML = "";

  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";

    div.innerHTML = `
      <a href="producto.html?id=${p.id}">
        <img 
          src="${p.img_portada}" 
          alt="${p.nombre}"
          onerror="this.src='https://via.placeholder.com/400x600?text=Sin+imagen'"
        >
      </a>
    `;

    grid.appendChild(div);
  });
}

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtrados = productos.filter(p =>
    p.equipo.toLowerCase().includes(value)
  );
  renderProductos(filtrados);
});

cargarProductos();
