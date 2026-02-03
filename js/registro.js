import { supabase, setCurrentUser } from './auth.js'
import { logMovimiento } from './logger.js'

const form = document.getElementById('registerForm')
const msg = document.getElementById('registerMessage')

function setMsg(text, ok = false) {
  if (!msg) return
  msg.textContent = text
  msg.className = 'message ' + (ok ? 'success' : 'error')
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  setMsg('Creando cuenta…')

  const nombre = document.getElementById('nombre')?.value?.trim()
  const telefono = document.getElementById('telefono')?.value?.trim()
  const ciudad = document.getElementById('ciudad')?.value?.trim()
  const email = document.getElementById('email')?.value?.trim().toLowerCase()
  const password = document.getElementById('password')?.value

  if (!nombre || !telefono || !email || !password) {
    setMsg('Completá nombre, WhatsApp, email y contraseña.')
    return
  }

  const payload = {
    email,
    password,
    rol: 'MAYORISTA',
    nombre,
    telefono,
    ciudad: ciudad || null,
    estado: 'pendiente',
    email_verificado: false
  }

  try {
    // Chequear duplicado
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing?.id) {
      setMsg('Ese email ya está registrado. Probá iniciar sesión.')
      return
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([payload])
      .select('*')
      .single()

    if (error) throw error

    setCurrentUser(data)
    logMovimiento({ accion: 'mayorista_registrado', detalle: { email } })

    setMsg('Listo ✅ Te registraste correctamente.', true)
    setTimeout(() => { window.location.href = 'index.html' }, 600)
  } catch (err) {
    console.error(err)
    setMsg('No se pudo crear la cuenta. Revisá Supabase (RLS) o si el email ya existe.')
  }
})
