import { supabase } from './auth.js'
import { logMovimiento } from './logger.js'

const wrapper = document.getElementById('productsCarousel')

function esc(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function cardSlide(p) {
  const title = `${p.equipo} - ${p.tipo_ropa}`
  const img = p.portada || p.img1 || 'https://via.placeholder.com/600x400?text=Sin+Imagen'
  const desc = p.descripcion || ''
  const badge = p.deporte || ''
  return `
    <div class="swiper-slide">
      <div class="product-card" data-id="${p.id}">
        <div class="product-image">
          <img src="${esc(img)}" alt="${esc(title)}">
          ${badge ? `<span class="product-badge">${esc(badge)}</span>` : ''}
        </div>
        <div class="product-content">
          <h3>${esc(title)}</h3>
          <p>${esc(desc)}</p>
          <a class="btn-product" href="producto.html?id=${p.id}">
            Ver detalle <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `
}

function initSwiper() {
  if (typeof Swiper === 'undefined') return
  // eslint-disable-next-line no-undef
  new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1280: { slidesPerView: 4 }
    }
  })
}

async function loadCatalogo() {
  if (!wrapper) return

  wrapper.innerHTML = `
    <div class="swiper-slide">
      <div class="product-card">
        <div class="product-content">
          <h3>Cargando productos…</h3>
          <p>Un segundo, que estamos trayendo lo bueno.</p>
        </div>
      </div>
    </div>
  `

  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('id, equipo, tipo_ropa, deporte, descripcion, portada, img1, visible, created_at')
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .limit(24)

  if (error) {
    console.error(error)
    wrapper.innerHTML = `
      <div class="swiper-slide">
        <div class="product-card">
          <div class="product-content">
            <h3>No pudimos cargar el catálogo</h3>
            <p>Revisá tu Supabase (RLS / columna visible) y recargá.</p>
          </div>
        </div>
      </div>
    `
    return
  }

  const items = data || []
  wrapper.innerHTML = items.length
    ? items.map(cardSlide).join('')
    : `
      <div class="swiper-slide">
        <div class="product-card">
          <div class="product-content">
            <h3>Sin productos por ahora</h3>
            <p>Cuando cargues productos visibles desde el dashboard, aparecen acá.</p>
          </div>
        </div>
      </div>
    `

  // Métrica: catálogo visto
  logMovimiento({ accion: 'catalogo_visto', detalle: { page: 'index.html' } })

  // Métrica: click a detalle
  wrapper.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="producto.html?id="]')
    if (!a) return
    const card = e.target.closest('.product-card')
    const id = card?.getAttribute('data-id')
    if (id) logMovimiento({ accion: 'click_detalle', producto_id: id, detalle: { from: 'carousel' } })
  }, { capture: true })

  // Iniciar Swiper con el HTML real
  initSwiper()
}

document.addEventListener('DOMContentLoaded', loadCatalogo)
