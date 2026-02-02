// js/guard.js

export function getCurrentUser() {
  const raw = localStorage.getItem('currentUser')
  return raw ? JSON.parse(raw) : null
}

export function requireLogin() {
  const user = getCurrentUser()
  if (!user || !user.loggedIn) {
    window.location.href = '/login.html'
    return null
  }
  return user
}

export function requireAdmin() {
  const user = requireLogin()
  if (!user) return null

  if (user.rol !== 'ADMINISTRADOR') {
    alert('No tenés permisos para acceder a esta sección.')
    window.location.href = '/index.html'
    return null
  }
  return user
}

export function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = '/login.html'
}
