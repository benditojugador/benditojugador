import { supabase, requireAuth, logout } from '../auth.js'
import { logMovimiento } from '../logger.js'

const user = requireAuth(['ADMINISTRADOR'])
if (!user) throw new Error('No auth')

const sidebar = document.getElementById('sidebarMenu')
const logoutBtn = document.getElementById('logoutBtn')
logoutBtn?.addEventListener('click', logout)

function buildSidebar() {
  if (!sidebar) return
  sidebar.innerHTML = ''
  addLink('📦 Dashboard', 'dashboard.html')
  addLink('👥 Mayoristas', 'mayoristas.html')
  addLink('🧑‍💼 Operadores', 'usuarios.html')
  addLink('📊 Métricas', 'dashboard.html#metricas')
}

function addLink(label, href) {
  const li = document.createElement('li')
  li.textContent = label
  li.classList.add('active')
  // solo marcar active si es la página actual
  if (!href.includes('usuarios.html')) li.classList.remove('active')
  li.addEventListener('click', () => { window.location.href = href })
  sidebar.appendChild(li)
}

const tbody = document.getElementById('tbody')
const msg = document.getElementById('msg')
const q = document.getElementById('q')
const btnRefrescar = document.getElementById('btnRefrescar')
const form = document.getElementById('opForm')

let cache = []

function safe(v){return (v ?? '').toString().trim()}
function fmtDate(ts){ try{return new Date(ts).toLocaleString('es-AR')}catch{return ''}}

function setMsg(t, ok=true){
  if (!msg) return
  msg.textContent = t
  msg.style.color = ok ? '#93c5fd' : '#fca5a5'
}

async function loadOperadores() {
  if (!tbody) return
  tbody.innerHTML = '<tr><td colspan="5">Cargando…</td></tr>'

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, rol, nombre, email, telefono, created_at')
    .eq('rol', 'OPERADOR')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    tbody.innerHTML = '<tr><td colspan="5">Error cargando operadores (RLS?).</td></tr>'
    return
  }

  cache = data || []
  render()
}

function render() {
  const term = safe(q?.value).toLowerCase()
  const rows = cache.filter(r => {
    if (!term) return true
    return safe(r.nombre).toLowerCase().includes(term) || safe(r.email).toLowerCase().includes(term)
  })

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5">No hay operadores para mostrar.</td></tr>'
    return
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${safe(r.nombre) || '—'}</td>
      <td>${safe(r.email) || '—'}</td>
      <td>${safe(r.telefono) || '—'}</td>
      <td>${fmtDate(r.created_at)}</td>
      <td>
        <div class="admin-actions">
          <button type="button" class="btn-ghost" data-act="reset" data-id="${r.id}">Reset pass</button>
          <button type="button" class="btn-danger" data-act="del" data-id="${r.id}">Borrar</button>
        </div>
      </td>
    </tr>
  `).join('')
}

async function createOperador(fd) {
  const email = safe(fd.get('email')).toLowerCase()
  const password = safe(fd.get('password'))
  const nombre = safe(fd.get('nombre')) || null
  const telefono = safe(fd.get('telefono')) || null

  if (!email || !password) {
    setMsg('Email y contraseña son obligatorios.', false)
    return
  }

  // evitar duplicado
  const { data: existing } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing?.id) {
    setMsg('Ese email ya existe. Usá otro.', false)
    return
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ email, password, rol: 'OPERADOR', nombre, telefono }])
    .select('id')
    .single()

  if (error) {
    console.error(error)
    setMsg('No se pudo crear el operador (RLS?).', false)
    return
  }

  logMovimiento({ accion: 'operador_creado', detalle: { email, by: user.email } })
  setMsg('Operador creado ✅')
  form?.reset()
  await loadOperadores()
}

async function resetPass(id) {
  const newPass = prompt('Nueva contraseña para el operador:')
  if (!newPass) return

  const { error } = await supabase
    .from('usuarios')
    .update({ password: newPass, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('rol', 'OPERADOR')

  if (error) {
    console.error(error)
    setMsg('No se pudo resetear contraseña.', false)
    return
  }

  logMovimiento({ accion: 'operador_password_reset', detalle: { id, by: user.email } })
  setMsg('Contraseña actualizada ✅')
}

async function delOperador(id) {
  if (!confirm('¿Borrar este operador?')) return

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)
    .eq('rol', 'OPERADOR')

  if (error) {
    console.error(error)
    setMsg('No se pudo borrar el operador.', false)
    return
  }

  logMovimiento({ accion: 'operador_borrado', detalle: { id, by: user.email } })
  setMsg('Operador borrado ✅')
  await loadOperadores()
}

document.addEventListener('DOMContentLoaded', async () => {
  buildSidebar()
  q?.addEventListener('input', render)
  btnRefrescar?.addEventListener('click', loadOperadores)

  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    createOperador(new FormData(form))
  })

  tbody?.addEventListener('click', (e) => {
    const btn = e.target.closest('button')
    if (!btn) return
    const act = btn.dataset.act
    const id = btn.dataset.id
    if (!id) return
    if (act === 'reset') resetPass(id)
    if (act === 'del') delOperador(id)
  })

  await loadOperadores()
})
