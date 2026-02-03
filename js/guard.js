// js/guard.js
// Guard liviano para páginas que NO usan auth.js directamente.

export function getCurrentUser() {
  const raw = localStorage.getItem('currentUser')
  return raw ? JSON.parse(raw) : null
}

export function requireLogin() {
  const user = getCurrentUser()
  if (!user || !user.loggedIn) {
    redirectToLogin()
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

function redirectToLogin() {
  // Si estamos en /admin, volver al login de raíz
  if (window.location.pathname.includes('/admin/')) {
    window.location.href = '../login.html'
  } else {
    window.location.href = '/login.html'
  }
}

export function logout() {
  localStorage.removeItem('currentUser')
  redirectToLogin()
}
