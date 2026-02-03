import { supabase } from './auth.js'

/**
 * Catálogo (Home)
 * - Solo carga y renderiza productos visibles.
 * - NO registra métricas (eso se activa más adelante).
 * - Nunca debe romper el render si Supabase falla.
 * - Evita pedir imágenes “hotlink” que suelen dar 404 (Adidas/Nike).
 */

const wrapper = document.getElementById('productsCarousel')

function esc(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isBlockedHotlink(url) {
  if (!url) return false
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    return (
      host.includes('assets.adidas.com') ||
      host.includes('static.nike.com')
    )
  } catch {
    // si no es URL válida, la dejamos pasar (puede ser relativa)
    return false
  }
}

function pickImage(p) {
  const candidates = [p?.portada, p?.img1, p?.img2, p?.img3, p?.img4, p?.img5].filter(Boolean)

  for (const c of candidates) {
    if (!isBlockedHotlink(c)) return c
  }
  return 'https://via.placeholder.com/800x520?text=Sin+Imagen'
}

function cardSlide(p) {
  const title = `${p.equipo ?? ''} - ${p.tipo_ropa ?? ''}`.trim() || 'Producto'
  const img = pickImage(p)
  const desc = p.descripcion ?? ''
  const badge = p.deporte ?? ''

  return `
    <div class="swiper-slide">
      <div class="product-card" data-id="${esc(p.id)}">
        <div class="product-image">
          <img
            src="${esc(img)}"
            alt="${esc(title)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://via.placeholder.com/800x520?text=Sin+Imagen';"
          >
          ${badge ? `<span class="product-badge">${esc(badge)}</span>` : ''}
        </div>
        <div class="product-content">
          <h3>${esc(title)}</h3>
          <p>${esc(desc)}</p>
          <a class="btn-product" href="producto.html?id=${esc(p.id)}">
            Ver detalle <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `
}

function initSwiper() {
  if (typeof window === 'undefined') return
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

function renderMessage(title, message) {
  if (!wrapper) return
  wrapper.innerHTML = `
    <div class="swiper-slide">
      <div class="product-card">
        <div class="product-content">
          <h3>${esc(title)}</h3>
          <p>${esc(message)}</p>
        </div>
      </div>
    </div>
  `
}

async function loadCatalogo() {
  if (!wrapper) return

  renderMessage('Cargando productos…', 'Un segundo, que estamos trayendo lo bueno.')

  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('id, equipo, tipo_ropa, deporte, descripcion, portada, img1, img2, img3, img4, img5, visible, created_at')
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .limit(24)

  if (error) {
    renderMessage(
      'No pudimos cargar el catálogo',
      'Revisá Supabase (RLS / columna visible) y recargá.'
    )
    return
  }

  const items = Array.isArray(data) ? data : []

  if (items.length === 0) {
    renderMessage(
      'Sin productos por ahora',
      'Cuando cargues productos visibles desde el dashboard, aparecen acá.'
    )
    initSwiper()
    return
  }

  wrapper.innerHTML = items.map(cardSlide).join('')
  initSwiper()
}

document.addEventListener('DOMContentLoaded', loadCatalogo)
