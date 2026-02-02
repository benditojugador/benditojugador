import { supabase } from './auth.js'

// Cargar productos en la página principal (si existe #productsGrid)
async function loadProducts(filter = 'all') {
  const productsGrid = document.getElementById('productsGrid')
  if (!productsGrid) return

  productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>'

  try {
    const { data: productos, error } = await supabase
      .from('productos_deportivos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!productos || productos.length === 0) {
      productsGrid.innerHTML = '<div class="no-products">No hay productos disponibles</div>'
      return
    }

    // Filtrar productos si es necesario
    let filteredProducts = productos
    if (filter !== 'all') {
      filteredProducts = productos.filter((product) => {
        if (filter === 'futbol') return product.deporte === 'Futbol'
        if (filter === 'basquet') return product.deporte === 'Basquet'
        if (filter === 'nacional') return product.tipo_equipo === 'Nacional'
        if (filter === 'club') return product.tipo_equipo === 'Club'
        return true
      })
    }

    // Generar HTML de productos
    productsGrid.innerHTML = filteredProducts.map((product) => `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image">
          <img
            src="${product.portada || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}"
            alt="${escapeHtml(`${product.equipo} - ${product.tipo_ropa}`)}"
          >
        </div>
        <div class="product-info">
          <h3>${escapeHtml(`${product.equipo} - ${product.tipo_ropa}`)}</h3>
          <div class="product-meta">
            <span><i class="fas fa-calendar"></i> ${product.año || 'N/A'}</span>
            <span><i class="fas fa-flag"></i> ${escapeHtml(product.nacionalidad || '')}</span>
          </div>
          <div class="product-price">${escapeHtml(product.oficial_alternativa || '')}</div>
          <a href="producto.html?id=${product.id}" class="btn-view">
            <i class="fas fa-eye"></i> Ver Detalles
          </a>
        </div>
      </div>
    `).join('')

  } catch (error) {
    console.error('Error cargando productos:', error)
    productsGrid.innerHTML = '<div class="error">Error al cargar los productos</div>'
  }
}

// Inicializar filtros (si existen)
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn')
  if (!filterButtons.length) return

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'))
      button.classList.add('active')

      const filter = button.getAttribute('data-filter')
      loadProducts(filter)
    })
  })
}

// Helper simple para evitar HTML roto por texto
function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts()
  initFilters()
})
