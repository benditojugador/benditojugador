import { supabase, buildWaLink, getMainImage, productTitle } from './auth.js'

const FALLBACK_IMG = 'images/icon.png' // si una imagen falla, no se cae nada

document.addEventListener('DOMContentLoaded', () => {
  init().catch((e) => {
    console.error('❌ Error iniciando index:', e)
    renderEmpty('No se pudieron cargar los destacados. Probá recargar la página.')
  })
})

async function init() {
  const products = await fetchFeaturedProducts(10)
  renderCarousel(products)
  initSwiper()
}

async function fetchFeaturedProducts(limit = 10) {
  // 1) Intento: top por eventos (tipo_evento = 'view')
  const byEvents = await tryGetTopByEvents(limit)
  if (byEvents?.length) return byEvents

  // 2) Fallback: últimos visibles
  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('id, oficial_alternativa, año, equipo, tipo_ropa, portada, img1, img2, img3, img4, img5')
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

async function tryGetTopByEvents(limit) {
  try {
    // Traemos una muestra reciente de eventos (si la tabla existe)
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('producto_id')
      .eq('tipo_evento', 'view')
      .order('created_at', { ascending: false })
      .limit(2000)

    if (error) return null
    if (!eventos?.length) return null

    // Contamos por producto_id
    const counts = new Map()
    for (const e of eventos) {
      const id = e?.producto_id
      if (!id) continue
      counts.set(id, (counts.get(id) || 0) + 1)
    }

    const topIds = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)

    if (!topIds.length) return null

    // Traemos productos por ids
    const { data: productos, error: pErr } = await supabase
      .from('productos_deportivos')
      .select('id, oficial_alternativa, año, equipo, tipo_ropa, portada, img1, img2, img3, img4, img5')
      .eq('visible', true)
      .in('id', topIds)

    if (pErr) return null
    if (!productos?.length) return null

    // Ordenar como topIds
    const map = new Map(productos.map(p => [p.id, p]))
    return topIds.map(id => map.get(id)).filter(Boolean)
  } catch (_) {
    return null
  }
}

function renderCarousel(products) {
  const wrap = document.getElementById('productsCarousel')
  if (!wrap) return

  if (!products?.length) {
    renderEmpty('Todavía no hay productos destacados para mostrar.')
    return
  }

  wrap.innerHTML = products.map(p => slideHTML(p)).join('')
}

function slideHTML(p) {
  const title = escapeHtml(productTitle(p))
  const equipo = escapeHtml(p?.equipo || '—')
  const tipo = escapeHtml(p?.tipo_ropa || '—')
  const anio = escapeHtml(String(p?.año ?? '—'))
  const img = getMainImage(p) || FALLBACK_IMG

  const detailHref = `producto.html?id=${encodeURIComponent(p.id)}`
  const waHref = buildWaLink(p)

  return `
    <div class="swiper-slide">
      <div class="product-card">
        <div class="product-image">
          <img src="${escapeAttr(img)}" alt="${title}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'" />
        </div>
        <div class="product-info">
          <span class="product-badge">Destacado</span>
          <h3 class="product-title">${title}</h3>
          <p class="product-details">
            <span><strong>Equipo:</strong> ${equipo}</span><br/>
            <span><strong>Tipo:</strong> ${tipo}</span><br/>
            <span><strong>Año:</strong> ${anio}</span>
          </p>
          <div class="product-actions">
            <a href="${detailHref}" class="btn-secondary">
              <i class="fas fa-eye"></i> Ver detalle
            </a>
            <a href="${waHref}" target="_blank" rel="noopener" class="btn-primary">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  `
}

function initSwiper() {
  if (!window.Swiper) return
  new window.Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    breakpoints: {
      700: { slidesPerView: 2 },
      1100: { slidesPerView: 3 }
    }
  })
}

function renderEmpty(msg) {
  const wrap = document.getElementById('productsCarousel')
  if (!wrap) return
  wrap.innerHTML = `<div style="padding:1.25rem;color:#2c3e50;">${escapeHtml(msg)}</div>`
}

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;")
}

function escapeAttr(str='') {
  return String(str).replaceAll('"','%22')
}
