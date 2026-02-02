import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ====== helpers de sesión ======
export function setCurrentUser(userRow) {
  localStorage.setItem('currentUser', JSON.stringify({
    id: userRow.id,
    email: userRow.email,
    rol: userRow.rol,
    loggedIn: true
  }))
}

export function getCurrentUser() {
  const s = localStorage.getItem('currentUser')
  return s ? JSON.parse(s) : null
}

export function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}

// ====== login (simple) ======
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
