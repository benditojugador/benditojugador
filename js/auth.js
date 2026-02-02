import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ---------------- Session helpers ----------------
export function setCurrentUser(userRow) {
  localStorage.setItem('currentUser', JSON.stringify({
    id: userRow.id,
    email: userRow.email,
    rol: userRow.rol,
    nombre: userRow.nombre ?? '',
    loggedIn: true
  }))
}

export function getCurrentUser() {
  const s = localStorage.getItem('currentUser')
  return s ? JSON.parse(s) : null
}

export function logout() {
  localStorage.removeItem('currentUser')
  // si estamos en /admin, volver al login
  if (window.location.pathname.includes('/admin/')) {
    window.location.href = '../login.html'
  } else {
    window.location.href = 'login.html'
  }
}

// ---------------- Auth (simple) ----------------
// Nota: esto usa la tabla public.usuarios (no Supabase Auth), como venía el proyecto.
export async function login(email, password, role) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .eq('rol', role)
    .single()

  if (error || !data) {
    throw new Error('Credenciales incorrectas')
  }
  setCurrentUser(data)
  return data
}

// Protege páginas (opcional: restringir roles)
export function requireAuth(allowedRoles = null) {
  const user = getCurrentUser()
  if (!user || !user.loggedIn) {
    // si estamos en /admin, volver al login
    if (window.location.pathname.includes('/admin/')) {
      window.location.href = '../login.html'
    } else {
      window.location.href = 'login.html'
    }
    return null
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.rol)) {
      alert('No tenés permisos para entrar acá.')
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = '../index.html'
      } else {
        window.location.href = 'index.html'
      }
      return null
    }
  }

  return user
}
