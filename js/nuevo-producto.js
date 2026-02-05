const form = document.getElementById("productoForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = {
    nombre: nombre.value,
    equipo: equipo.value,
    anio: anio.value,
    tipo_prenda: tipo_prenda.value,
    img_portada: img_portada.value,
    img_2: img_2.value,
    img_3: img_3.value,
    img_4: img_4.value
  };

  const { error } = await supabaseClient
    .from("productos")
    .insert([producto]);

  if (error) {
    msg.textContent = error.message;
  } else {
    msg.textContent = "Producto agregado correctamente";
    form.reset();
  }
});

const producto = {
  nombre: nombre.value,
  anio: anio.value,
  tipo_equipo: tipo_equipo.value, // 👈 ESTO
  equipo: equipo.value,
  tipo_prenda: tipo_prenda.value,
  nacionalidad: nacionalidad.value,
  etiquetas: etiquetas.value,
  img_portada: img_portada.value,
  img_2: img_2.value,
  img_3: img_3.value,
  img_4: img_4.value
};
