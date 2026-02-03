import { supabase } from './auth.js'
import { logMovimiento } from './logger.js'

// WhatsApp del negocio (formato wa.me: sin +, sin espacios)
const WHATSAPP_NUMBER = '5492645042317'

// Cargar detalles del producto
async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search)
  const productId = urlParams.get('id')

  if (!productId) {
    window.location.href = 'index.html'
    return
  }

  try {
    const { data: producto, error } = await supabase
      .from('productos_deportivos')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error
    // Métrica: vista de producto
    logMovimiento({ accion: 'producto_visto', producto_id: producto.id, detalle: { page: 'producto.html' } })
    updateProductUI(producto)
  } catch (error) {
    console.error('Error cargando detalles del producto:', error)
    window.location.href = 'index.html'
  }
}

// Actualizar la interfaz con los datos del producto
function updateProductUI(producto) {
  // Título
  document.title = `${producto.equipo} - ${producto.tipo_ropa} | Bendito Jugador`
  safeText('productTitle', `${producto.equipo} - ${producto.tipo_ropa}`)

  // Info
  safeText('productOficial', producto.oficial_alternativa || '')
  safeText('productName', `${producto.equipo} - ${producto.tipo_ropa}`)
  safeText('productCategory', producto.tipo_ropa || '')
  safeText('productNationality', producto.nacionalidad || '')
  safeText('productYear', producto.año || 'N/A')
  safeText('productDescription', producto.descripcion || 'Sin descripción disponible')
  safeText('productTeam', producto.equipo || '')
  safeText('productClothingType', producto.tipo_ropa || '')
  safeText('productTeamType', producto.tipo_equipo || '')
  safeText('productSport', producto.deporte || '')

  // Imágenes
  const images = [
    producto.portada,
    producto.img1,
    producto.img2,
    producto.img3,
    producto.img4,
    producto.img5
  ].filter(Boolean)

  const mainImage = document.getElementById('mainProductImage')
  const thumbnailsContainer = document.getElementById('thumbnails')

  if (mainImage && thumbnailsContainer) {
    if (images.length > 0) {
      mainImage.src = images[0]
      mainImage.alt = `${producto.equipo} - ${producto.tipo_ropa}`

      thumbnailsContainer.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
          <img src="${img}" alt="Vista ${index + 1}">
        </div>
      `).join('')

      thumbnailsContainer.querySelectorAll('.thumbnail').forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const index = Number(thumb.getAttribute('data-index'))
          if (!Number.isNaN(index) && images[index]) {
            mainImage.src = images[index]
          }

          thumbnailsContainer.querySelectorAll('.thumbnail').forEach((t) => t.classList.remove('active'))
          thumb.classList.add('active')
        })
      })
    } else {
      mainImage.src = 'https://via.placeholder.com/600x400?text=Sin+Imagen'
      thumbnailsContainer.innerHTML = '<p>No hay imágenes disponibles</p>'
    }
  }

  // Tags
  const tagsContainer = document.getElementById('productTags')
  if (tagsContainer) {
    if (producto.etiquetas) {
      const tags = String(producto.etiquetas).split(',').map((t) => t.trim()).filter(Boolean)
      tagsContainer.innerHTML = tags.length
        ? tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
        : '<span class="tag">Sin etiquetas</span>'
    } else {
      tagsContainer.innerHTML = '<span class="tag">Sin etiquetas</span>'
    }
  }

  // WhatsApp
  const pageUrl = window.location.href
  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero consultar por este producto:\n` +
    `${producto.equipo} - ${producto.tipo_ropa}\n` +
    `Año: ${producto.año || 'N/A'}\n` +
    `Nacionalidad: ${producto.nacionalidad || ''}\n` +
    `Oficial/Alternativa: ${producto.oficial_alternativa || ''}\n\n` +
    `Link del producto: ${pageUrl}`
  )

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

  const whatsappBtn = document.getElementById('whatsappBtn')
  const footerWhatsapp = document.getElementById('footerWhatsapp')

  if (whatsappBtn) {
    whatsappBtn.href = whatsappUrl
    whatsappBtn.addEventListener('click', () => {
      // Métrica: click WhatsApp (no esperamos)
      logMovimiento({ accion: 'click_whatsapp', producto_id: producto.id, detalle: { from: 'boton_detalle' } })
    }, { once: true })
  }
  if (footerWhatsapp) {
    footerWhatsapp.href = whatsappUrl
    footerWhatsapp.addEventListener('click', () => {
      logMovimiento({ accion: 'click_whatsapp', producto_id: producto.id, detalle: { from: 'footer' } })
    }, { once: true })
  }
}

function safeText(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails()
})
