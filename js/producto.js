const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nombre = document.getElementById("nombre");
const info = document.getElementById("info");
const galeria = document.getElementById("galeria");

async function cargarProducto() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error Supabase:", error);
    return;
  }

  nombre.textContent = data.nombre;
  info.textContent = `${data.equipo} · ${data.anio} · ${data.tipo_prenda}`;

  const imgs = [
    data.img_portada,
    data.img_2,
    data.img_3,
    data.img_4
  ].filter(Boolean);

  imgs.forEach(src => {
    const a = document.createElement("a");
    a.href = src;
    a.target = "_blank";

    const img = document.createElement("img");
    img.src = src;
    img.onerror = () => {
      img.src = "https://via.placeholder.com/400x600?text=Sin+imagen";
    };

    a.appendChild(img);
    galeria.appendChild(a);
  });
}

cargarProducto();
