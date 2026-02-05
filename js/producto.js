const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nombre = document.getElementById("nombre");
const info = document.getElementById("info");
const galeria = document.getElementById("galeria");

async function cargarProducto() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  nombre.innerText = data.nombre;
  info.innerText = `${data.equipo} · ${data.anio} · ${data.tipo_prenda}`;

  const imgs = [
    data.img_portada,
    data.img_2,
    data.img_3,
    data.img_4
  ].filter(Boolean);

  imgs.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    galeria.appendChild(img);
  });
}

cargarProducto();
