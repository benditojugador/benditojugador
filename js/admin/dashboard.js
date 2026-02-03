import { requireAuth, logout } from '../auth.js'

const user = requireAuth(['ADMINISTRADOR', 'OPERADOR'])
if (!user) throw new Error('No auth')

// Elementos
const sidebar = document.getElementById('sidebarMenu')
const title = document.getElementById('dashboardTitle')
const logoutBtn = document.getElementById('logoutBtn')

logoutBtn?.addEventListener('click', logout)

// Secciones internas (las páginas externas se abren por href)
const sections = {
  categorias: document.getElementById('sectionCategorias'),
  nuevoProducto: document.getElementById('sectionNuevoProducto'),
  productos: document.getElementById('sectionProductos'),
  metricas: document.getElementById('sectionMetricas')
}

function hideAllSections() {
  Object.values(sections).forEach(s => s?.classList.add('hidden'))
}

function setActive(li) {
  sidebar?.querySelectorAll('li').forEach(x => x.classList.remove('active'))
  li?.classList.add('active')
}

function showSection(name, li) {
  hideAllSections()
  sections[name]?.classList.remove('hidden')
  setActive(li)
}

// Sidebar según rol (con scroll)
function buildSidebar() {
  if (!sidebar) return
  sidebar.innerHTML = ''

  addItem('📦 Productos', (li) => showSection('productos', li))
  addItem('➕ Nuevo producto', (li) => showSection('nuevoProducto', li))
  addItem('🏷️ Categorías', (li) => showSection('categorias', li))

  if (user.rol === 'ADMINISTRADOR') {
    addLink('👥 Mayoristas', 'mayoristas.html')
    addLink('🧑‍💼 Operadores', 'usuarios.html')
    addItem('📊 Métricas', (li) => showSection('metricas', li))
  }
}

function addItem(label, onClick) {
  const li = document.createElement('li')
  li.textContent = label
  li.addEventListener('click', () => onClick(li))
  sidebar.appendChild(li)
  return li
}

function addLink(label, href) {
  const li = document.createElement('li')
  li.textContent = label
  li.addEventListener('click', () => {
    window.location.href = href
  })
  sidebar.appendChild(li)
  return li
}

// Init
title.textContent = user.rol === 'ADMINISTRADOR'
  ? 'Dashboard Administrador'
  : 'Dashboard Operador'

buildSidebar()
showSection('productos', sidebar?.querySelector('li'))
