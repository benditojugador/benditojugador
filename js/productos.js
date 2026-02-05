const grid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");

let productos = [];

async function cargarProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando productos:", error);
    return;
  }

  productos = data;
  renderProductos(productos);
}

function renderProductos(lista) {
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = "<p>No hay productos</p>";
    return;
  }

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "producto";

    card.innerHTML = `
      <img src="${p.img_portada}" alt="${p.nombre}">
      <div class="producto-info">
        <h4>${p.equipo}</h4>
        <span>${p.anio}</span>
      </div>
    `;

    card.onclick = () => {
      window.location.href = `producto.html?id=${p.id}`;
    };

    grid.appendChild(card);
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
