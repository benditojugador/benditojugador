const grid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");
let productos = [];

async function cargarProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
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
      <img src="${p.img_portada}" alt="${p.nombre}">
    `;

    div.onclick = () => {
      window.location.href = `producto.html?id=${p.id}`;
    };

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
