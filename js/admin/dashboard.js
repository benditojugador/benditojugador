import { getCurrentUser, logout } from '../guard.js'

const user = getCurrentUser()

if (!user || !user.loggedIn) {
  window.location.href = '/login.html'
}

// Elementos
const sidebar = document.getElementById('sidebarMenu')
const title = document.getElementById('dashboardTitle')
const logoutBtn = document.getElementById('logoutBtn')

// Secciones
const sections = {
  categorias: document.getElementById('sectionCategorias'),
  nuevoProducto: document.getElementById('sectionNuevoProducto'),
  productos: document.getElementById('sectionProductos'),
  mayoristas: document.getElementById('sectionMayoristas')
}

logoutBtn.addEventListener('click', logout)

// Helpers
function hideAllSections() {
  Object.values(sections).forEach(s => s.classList.add('hidden'))
}

function showSection(name) {
  hideAllSections()
  sections[name].classList.remove('hidden')
}

// Sidebar según rol
function buildSidebar() {
  sidebar.innerHTML = ''

  // OPERADOR y ADMIN
  addMenuItem('Categorías', () => showSection('categorias'))
  addMenuItem('Nuevo producto', () => showSection('nuevoProducto'))
  addMenuItem('Productos', () => showSection('productos'))

  // SOLO ADMIN
  if (user.rol === 'ADMINISTRADOR') {
    addMenuItem('Mayoristas', () => showSection('mayoristas'))
  }
}

function addMenuItem(label, action) {
  const li = document.createElement('li')
  li.textContent = label
  li.addEventListener('click', action)
  sidebar.appendChild(li)
}

// Init
title.textContent =
  user.rol === 'ADMINISTRADOR'
    ? 'Dashboard Administrador'
    : 'Dashboard Operador'

buildSidebar()
showSection('productos')
