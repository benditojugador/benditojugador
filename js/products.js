/**
 * products.js
 * Catálogo público – Bendito Jugador
 *
 * Responsabilidad ÚNICA:
 * - Traer productos visibles desde Supabase
 * - Renderizarlos en el catálogo
 *
 * NO hace:
 * - login
 * - métricas
 * - roles
 * - admin
 *
 * Si algo falla, muestra mensaje y NO rompe.
 */

import { supabase } from './auth.js'

/* ===============================
   CONFIGURACIÓN
================================ */

const CONTAINER_ID = 'productsCarousel'
const PLACEHOLDER_IMG = 'assets/placeholder.png' // imagen local obligatoria

/* ===============================
   UTILIDADES
================================ */

function $(id) {
  return document.getElementById(id)
}

function safe(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function buildTitle(p) {
  // Ej: "Camiseta Boca Juniors 2024"
  const parts = []
  if (p.tipo_ropa) parts.push(p.tipo_ropa)
  if (p.equipo) parts.push(p.equipo)
  if (p.año) parts.push(p.año)
  return parts.join(' ') || 'Producto'
}

function pickImage(p) {
  const imgs = [
    p.portada,
    p.img1,
    p.img2,
    p.img3,
    p.img4,
    p.img5
  ].filter(Boolean)

  return imgs[0] || PLACEHOLDER_IMG
}

/* ===============================
   RENDER
================================ */

function renderMessage(title, text) {
  const container = $(CONTAINER_ID)
  if (!container) return

  container.innerHTML = `
    <div class="catalog-message">
      <h3>${safe(title)}</h3>
      <p>${safe(text)}</p>
    </div>
  `
}

function renderProducts(products) {
  const container = $(CONTAINER_ID)
  if (!container) return

  container.innerHTML = products.map(p => {
    const title = buildTitle(p)
    const img = pickImage(p)

    return `
      <div class="product-card">
        <div class="product-image">
          <img 
            src="${safe(img)}"
            alt="${safe(title)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'"
          >
        </div>

        <div class="product-info">
          <h3>${safe(title)}</h3>
          <a href="producto.html?id=${p.id}" class="btn-detail">
            Ver detalle →
          </a>
        </div>
      </div>
    `
  }).join('')
}

/* ===============================
   DATA
================================ */

async function loadProducts() {
  const container = $(CONTAINER_ID)
  if (!container) return

  renderMessage('Cargando productos…', 'Un momento por favor')

  const { data, error } = await supabase
    .from('productos_deportivos')
    .select(`
      id,
      equipo,
      tipo_ropa,
      año,
      descripcion,
      portada,
      img1,
      img2,
      img3,
      img4,
      img5,
      visible,
      created_at
    `)
    .eq('visible', true)
    .order('created_at', { ascending: false })

  if (error) {
    renderMessage(
      'No se pudo cargar el catálogo',
      'Revisá la conexión con Supabase o las políticas de acceso'
    )
    return
  }

  if (!data || data.length === 0) {
    renderMessage(
      'Sin productos',
      'Todavía no hay productos visibles en el catálogo'
    )
    return
  }

  renderProducts(data)
}

/* ===============================
   INIT
================================ */

document.addEventListener('DOMContentLoaded', loadProducts)
