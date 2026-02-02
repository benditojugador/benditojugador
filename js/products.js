import { supabase } from './auth.js'

const container = document.getElementById('productosContainer')

async function loadCatalogo() {
  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  container.innerHTML = ''

  data.forEach(prod => {
    const card = document.createElement('div')
    card.className = 'product-card'

    card.innerHTML = `
      <img src="${prod.portada || 'https://via.placeholder.com/300'}">
      <h3>${prod.nombre}</h3>
      <p>${prod.descripcion || ''}</p>
      <a href="producto.html?id=${prod.id}">Ver detalle</a>
    `

    container.appendChild(card)
  })
}

loadCatalogo()
