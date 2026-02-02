import { supabase, requireAuth, logout } from '../auth.js'

const tbody = document.getElementById('tbody')
const msg = document.getElementById('msg')
const q = document.getElementById('q')
const estado = document.getElementById('estado')
const btnRefrescar = document.getElementById('btnRefrescar')
const btnLogout = document.getElementById('btnLogout')

// Modal
const modalBackdrop = document.getElementById('modalBackdrop')
const btnCerrarModal = document.getElementById('btnCerrarModal')
const modalTitle = document.getElementById('modalTitle')
const modalBody = document.getElementById('modalBody')
const btnCopyEmail = document.getElementById('btnCopyEmail')
const btnCopyWsp = document.getElementById('btnCopyWsp')
const btnAbrirWsp = document.getElementById('btnAbrirWsp')

let cache = []
let modalRow = null

const BUSINESS_WA = '5492645042317' // Bendito Jugador

function safe(v) { return (v ?? '').toString().trim() }

function pillEstado(v) {
  const s = safe(v) || 'pendiente'
  if (s === 'aprobado') return '<span class="pill ok">aprobado</span>'
  if (s === 'rechazado') return '<span class="pill bad">rechazado</span>'
  return '<span class="pill">pendiente</span>'
}

function fmtDate(ts) {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    return d.toLocaleString('es-AR')
  } catch { return '' }
}

function copyText(text) {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false)
}


async function loadMayoristas() {
  msg.textContent = ''
  tbody.innerHTML = '<tr><td colspan="7" class="muted">Cargando...</td></tr>'

  // Trae campos, si alguno no existe en tu tabla, hay que correr la migración SQL (te la dejamos en /supabase/migrations.sql)
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, rol, nombre, email, telefono, ciudad, estado, created_at')
    .eq('rol', 'MAYORISTA')
    .order('created_at', { ascending: false })

  if (error) {
    tbody.innerHTML = '<tr><td colspan="7" class="error">Error cargando mayoristas. Revisá RLS o columnas faltantes.</td></tr>'
    msg.textContent = String(error.message || error)
    msg.className = 'msg error'
    return
  }

  cache = data || []
  render()
}

function render() {
  const term = safe(q.value).toLowerCase()
  const est = estado.value

  const rows = cache.filter(r => {
    const nombre = safe(r.nombre).toLowerCase()
    const email = safe(r.email).toLowerCase()
    const okTerm = !term || nombre.includes(term) || email.includes(term)
    const okEst = (est === 'all') || safe(r.estado || 'pendiente') === est
    return okTerm && okEst
  })

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">No hay mayoristas para mostrar.</td></tr>'
    return
  }

  tbody.innerHTML = rows.map(r => {
    const wsp = safe(r.telefono)
    return \`
      <tr>
        <td>\${safe(r.nombre) || '—'}</td>
        <td>\${safe(r.email) || '—'}</td>
        <td>\${wsp || '—'}</td>
        <td>\${safe(r.ciudad) || '—'}</td>
        <td>\${pillEstado(r.estado)}</td>
        <td>\${fmtDate(r.created_at)}</td>
        <td>
          <div class="actions">
            <button type="button" data-act="ver" data-id="\${r.id}">Ver</button>
            <button type="button" data-act="copyEmail" data-email="\${safe(r.email)}">Copiar email</button>
            <button type="button" data-act="copyWsp" data-wsp="\${wsp}">Copiar WhatsApp</button>
          </div>
        </td>
      </tr>\`
  }).join('')
}

function openModal(row) {
  modalRow = row
  modalTitle.textContent = safe(row.nombre) ? `Mayorista: ${safe(row.nombre)}` : 'Detalle de mayorista'
  const fields = [
    ['Nombre', safe(row.nombre)],
    ['Email', safe(row.email)],
    ['WhatsApp', safe(row.telefono)],
    ['Ciudad', safe(row.ciudad)],
    ['Estado', safe(row.estado) || 'pendiente'],
    ['Alta', fmtDate(row.created_at)]
  ]

  modalBody.innerHTML = fields.map(([k,v]) => \`
    <div class="card">
      <div class="muted" style="font-size:12px;margin-bottom:6px">\${k}</div>
      <div style="font-weight:600">\${v || '—'}</div>
    </div>\`).join('')

  const phoneDigits = safe(row.telefono).replace(/\D/g,'')
  const waTo = phoneDigits ? ('549' + phoneDigits) : BUSINESS_WA
  btnAbrirWsp.href = `https://wa.me/${waTo}`

  modalBackdrop.style.display = 'flex'
}

function closeModal() {
  modalBackdrop.style.display = 'none'
  modalRow = null
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth(['ADMINISTRADOR'])
  if (!user) return

  btnLogout?.addEventListener('click', logout)

  btnRefrescar?.addEventListener('click', loadMayoristas)
  q?.addEventListener('input', render)
  estado?.addEventListener('change', render)

  tbody?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button')
    if (!btn) return
    const act = btn.dataset.act

    if (act === 'ver') {
      const id = btn.dataset.id
      const row = cache.find(x => x.id === id)
      if (row) openModal(row)
      return
    }

    if (act === 'copyEmail') {
      const ok = await copyText(btn.dataset.email || '')
      msg.textContent = ok ? 'Email copiado ✅' : 'No se pudo copiar el email'
      return
    }

    if (act === 'copyWsp') {
      const ok = await copyText(btn.dataset.wsp || '')
      msg.textContent = ok ? 'WhatsApp copiado ✅' : 'No se pudo copiar el WhatsApp'
      return
    }
  })

  btnCerrarModal?.addEventListener('click', closeModal)
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal()
  })

  btnCopyEmail?.addEventListener('click', async () => {
    if (!modalRow) return
    const ok = await copyText(safe(modalRow.email))
    msg.textContent = ok ? 'Email copiado ✅' : 'No se pudo copiar el email'
    closeModal()
  })

  btnCopyWsp?.addEventListener('click', async () => {
    if (!modalRow) return
    const ok = await copyText(safe(modalRow.telefono))
    msg.textContent = ok ? 'WhatsApp copiado ✅' : 'No se pudo copiar el WhatsApp'
    closeModal()
  })

  await loadMayoristas()
})
