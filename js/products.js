import { supabase, buildWaLink, getMainImage, norm, productTitle, WA_DISPLAY } from './auth.js'

const $ = (q) => document.querySelector(q)

const grid = $('#grid')
const empty = $('#empty')

const q = $('#q')
const fEquipo = $('#f-equipo')
const fTipo = $('#f-tipo')
const fAnio = $('#f-anio')

const btnAplicar = $('#btn-aplicar')
const btnLimpiar = $('#btn-limpiar')

const statTotal = $('#stat-total')
const statWa = $('#stat-wa')

const FALLBACK_IMG = 'images/placeholder.png' // si no existe, igual no rompe (queda vacío)

let allProducts = []

init().catch((e) => {
  console.error('❌ Error inicializando catálogo:', e)
  renderEmpty(true)
})

async function init() {
  if (statWa) statWa.textContent = WA_DISPLAY

  await loadProducts()
  buildFilterOptions(allProducts)

  // Eventos
  btnAplicar?.addEventListener('click', applyFilters)
  btnLimpiar?.addEventListener('click', resetFilters)

  // Enter para filtrar
  q?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') applyFilters()
  })

  // Render inicial
  applyFilters()
}

async function loadProducts() {
  renderLoading()

  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('id, oficial_alternativa, año, equipo, tipo_ropa, nacionalidad, deporte, etiquetas, descripcion, portada, img1, img2, img3, img4, img5, visible')
    .eq('visible', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  allProducts = Array.isArray(data) ? data : []
}

function buildFilterOptions(products) {
  // Equipo
  fillSelect(fEquipo, uniq(products.map(p => p?.equipo)).sort(alphaSort))

  // Tipo (tipo_ropa)
  fillSelect(fTipo, uniq(products.map(p => p?.tipo_ropa)).sort(alphaSort))

  // Año (año puede venir number o string)
  const years = uniq(products.map(p => p?.año).filter(v => v !== null && v !== undefined && v !== ''))
    .map(v => String(v))
    .sort((a,b) => Number(b) - Number(a))
  fillSelect(fAnio, years)
}

function fillSelect(selectEl, values) {
  if (!selectEl) return
  // deja el primer option (Todos)
  const first = selectEl.querySelector('option[value=""]')
  selectEl.innerHTML = ''
  if (first) selectEl.appendChild(first)
  values.forEach(v => {
    const opt = document.createElement('option')
    opt.value = v
    opt.textContent = v
    selectEl.appendChild(opt)
  })
}

function uniq(arr) {
  const s = new Set()
  for (const v of arr) {
    const x = (v ?? '').toString().trim()
    if (x) s.add(x)
  }
  return Array.from(s)
}

function alphaSort(a,b){
  return a.localeCompare(b, 'es', { sensitivity:'base' })
}

function applyFilters() {
  const query = norm(q?.value || '')
  const equipo = (fEquipo?.value || '').trim()
  const tipo = (fTipo?.value || '').trim()
  const anio = (fAnio?.value || '').trim()

  let filtered = [...allProducts]

  if (equipo) filtered = filtered.filter(p => (p?.equipo || '') === equipo)
  if (tipo) filtered = filtered.filter(p => (p?.tipo_ropa || '') === tipo)
  if (anio) filtered = filtered.filter(p => String(p?.año ?? '') === anio)

  if (query) {
    filtered = filtered.filter(p => {
      const hay = [
        p?.oficial_alternativa,
        p?.equipo,
        p?.tipo_ropa,
        p?.nacionalidad,
        p?.deporte,
        p?.etiquetas,
        p?.descripcion,
        p?.año
      ].map(x => norm(x)).join(' ')
      return hay.includes(query)
    })
  }

  renderProducts(filtered)
}

function resetFilters() {
  if (q) q.value = ''
  if (fEquipo) fEquipo.value = ''
  if (fTipo) fTipo.value = ''
  if (fAnio) fAnio.value = ''
  applyFilters()
}

function renderLoading() {
  if (!grid) return
  grid.innerHTML = ''
  renderEmpty(false)
  // skeleton simple
  const skeletons = Array.from({ length: 8 }).map(() => {
    const d = document.createElement('div')
    d.className = 'p-card'
    d.innerHTML = `
      <div class="p-img"></div>
      <div class="p-body">
        <div style="height:14px;background:#eef0f2;border-radius:10px;"></div>
        <div style="height:14px;background:#eef0f2;border-radius:10px;width:70%;"></div>
        <div style="height:38px;background:#eef0f2;border-radius:12px;margin-top:8px;"></div>
      </div>
    `
    return d
  })
  skeletons.forEach(s => grid.appendChild(s))
}

function renderEmpty(show) {
  if (!empty) return
  empty.style.display = show ? 'block' : 'none'
}

function renderProducts(products) {
  if (!grid) return

  grid.innerHTML = ''
  if (statTotal) statTotal.textContent = String(products.length)

  if (!products.length) {
    renderEmpty(true)
    return
  }
  renderEmpty(false)

  for (const p of products) {
    const card = document.createElement('article')
    card.className = 'p-card'

    const title = escapeHtml(productTitle(p))
    const equipo = escapeHtml(p?.equipo || '—')
    const tipo = escapeHtml(p?.tipo_ropa || '—')
    const anio = escapeHtml(String(p?.año ?? '—'))
    const img = getMainImage(p)

    const detailHref = `producto.html?id=${encodeURIComponent(p.id)}`
    const waHref = buildWaLink(p)

    card.innerHTML = `
      <div class="p-img">
        <img src="${escapeAttr(img || FALLBACK_IMG)}" alt="${title}" loading="lazy" />
      </div>
      <div class="p-body">
        <h3 class="p-title">${title}</h3>
        <div class="p-meta">
          <span class="tag"><strong>Equipo:</strong> ${equipo}</span>
          <span class="tag"><strong>Tipo:</strong> ${tipo}</span>
          <span class="tag"><strong>Año:</strong> ${anio}</span>
        </div>
        <div class="p-cta">
          <a class="a-detail" href="${detailHref}">
            <i class="fa-solid fa-eye"></i> Ver detalle
          </a>
          <a class="a-wa" href="${waHref}" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    `

    // Fallback si la imagen se rompe
    const imgEl = card.querySelector('img')
    imgEl?.addEventListener('error', () => {
      imgEl.src = FALLBACK_IMG
    })

    grid.appendChild(card)
  }
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
  // para src/href
  return String(str).replaceAll('"','%22')
}
