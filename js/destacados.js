import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "TU_SUPABASE_URL";
const supabaseKey = "TU_SUPABASE_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cargarProductosDestacados() {
  const { data, error } = await supabase
    .from("productos_deportivos")
    .select(`
      Id,
      equipo,
      año,
      oficial_alternativa,
      deporte,
      tipo_ropa,
      nacionalidad,
      descripcion,
      portada
    `);

  if (error) {
    console.error("Error Supabase:", error);
    return;
  }

  // Mezclar y tomar 6
  const productos = data
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  const carousel = document.getElementById("productsCarousel");
  carousel.innerHTML = "";

  productos.forEach(p => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="product-card">
        <div class="product-image">
          <img src="${p.portada}" alt="${p.equipo} ${p.año}">
        </div>

        <div class="product-info">
          <span class="product-badge">${p.oficial_alternativa}</span>

          <h3 class="product-title">${p.equipo} ${p.año}</h3>

          <p class="product-description">
            ${p.descripcion ?? ""}
          </p>

          <div class="product-meta">
            <span><i class="fas fa-flag"></i> ${p.nacionalidad}</span>
            <span><i class="fas fa-calendar"></i> ${p.año}</span>
            <span><i class="fas fa-tshirt"></i> ${p.tipo_ropa}</span>
          </div>

          <div class="product-status">
            <span class="status-badge">
              <i class="fas fa-check-circle"></i> En stock
            </span>
          </div>

          <a href="producto.html?id=${p.Id}" class="btn-primary"
            style="padding: 0.8rem; font-size: 1rem; margin-top: 1rem; text-align: center;">
            <i class="fas fa-eye"></i> Ver Detalles
          </a>
        </div>
      </div>
    `;

    carousel.appendChild(slide);
  });

  // Inicializar / refrescar Swiper
  new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

cargarProductosDestacados();
