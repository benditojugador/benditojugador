import { supabase, requireAuth } from '../auth.js'
import { logMovimiento } from '../logger.js'

const user = requireAuth(['ADMINISTRADOR', 'OPERADOR'])
if (!user) throw new Error('No auth')

const form = document.getElementById('productForm')
const tbody = document.getElementById('productosTable')

const fieldMap = {
  oficial_alternativa: 'oficial_alternativa',
  año: 'año',
  equipo: 'equipo',
  tipo_ropa: 'tipo_ropa',
  tipo_equipo: 'tipo_equipo',
  nacionalidad: 'nacionalidad',
  deporte: 'deporte',
  etiquetas: 'etiquetas',
  descripcion: 'descripcion',
  portada: 'portada',
  img1: 'img1',
  img2: 'img2',
  img3: 'img3',
  img4: 'img4',
  img5: 'img5',
  visible: 'visible'
}

function $(id) { return document.getElementById(id) }

function getFormData() {
  const data = {}
  Object.keys(fieldMap).forEach(k => {
    const el = form?.querySelector(`[name="${k}"]`)
    if (!el) return
    if (el.type === 'checkbox') data[k] = !!el.checked
    else data[k] = el.value?.trim() || null
  })
  if (data.año) data.año = parseInt(data.año, 10)
  if (Number.isNaN(data.año)) data.año = null
  if (data.visible == null) data.visible = true
  return data
}

function setFormData(p) {
  Object.keys(fieldMap).forEach(k => {
    const el = form?.querySelector(`[name="${k}"]`)
    if (!el) return
    if (el.type === 'checkbox') el.checked = !!p?.[k]
    else el.value = p?.[k] ?? ''
  })
}

let editingId = null
let cache = []

async function loadProductos() {
  if (!tbody) return
  tbody.innerHTML = '<tr><td colspan="5">Cargando…</td></tr>'

  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('id, oficial_alternativa, año, equipo, tipo_ropa, visible, cargado_por, created_at, usuarios:usuarios!productos_deportivos_cargado_por_fkey(email)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    tbody.innerHTML = '<tr><td colspan="5">Error cargando productos (revisá RLS / columnas).</td></tr>'
    return
  }

  cache = data || []
  renderProductos()
}

function renderProductos() {
  if (!tbody) return
  if (!cache.length) {
    tbody.innerHTML = '<tr><td colspan="5">No hay productos todavía.</td></tr>'
    return
  }

  tbody.innerHTML = cache.map(p => {
    const nombre = `${p.equipo} - ${p.tipo_ropa}`
    const operador = p.usuarios?.email || '—'
    return `
      <tr>
        <td>${nombre}</td>
        <td>${p.oficial_alternativa || '—'}</td>
        <td>${p.visible ? '✅ Visible' : '🚫 Oculto'}</td>
        <td>${operador}</td>
        <td>
          <div class="admin-actions">
            <button type="button" class="btn-ghost" data-act="edit" data-id="${p.id}">Editar</button>
            <button type="button" class="btn-ghost" data-act="toggle" data-id="${p.id}">${p.visible ? 'Ocultar' : 'Mostrar'}</button>
            ${user.rol === 'ADMINISTRADOR' ? `<button type="button" class="btn-danger" data-act="del" data-id="${p.id}">Borrar</button>` : ''}
          </div>
        </td>
      </tr>
    `
  }).join('')
}

async function saveProducto() {
  const payload = getFormData()

  // Validación mínima (catálogo pro, pero sin drama)
  if (!payload.equipo || !payload.tipo_ropa || !payload.tipo_equipo || !payload.nacionalidad || !payload.deporte || !payload.etiquetas) {
    alert('Faltan campos obligatorios: equipo, tipo_ropa, tipo_equipo, nacionalidad, deporte, etiquetas.')
    return
  }
  if (!payload.oficial_alternativa) payload.oficial_alternativa = 'Oficial'

  try {
    if (editingId) {
      const { error } = await supabase
        .from('productos_deportivos')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId)

      if (error) throw error

      logMovimiento({ accion: 'producto_editado', producto_id: editingId, detalle: { by: user.email } })
      editingId = null
      form?.querySelector('#btnGuardarProducto')?.removeAttribute('data-editing')
    } else {
      const { data, error } = await supabase
        .from('productos_deportivos')
        .insert([{ ...payload, cargado_por: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select('id')
        .single()

      if (error) throw error

      logMovimiento({ accion: 'producto_creado', producto_id: data?.id ?? null, detalle: { by: user.email } })
    }

    form?.reset()
    // por defecto visible
    const vis = form?.querySelector('[name="visible"]')
    if (vis) vis.checked = true

    await loadProductos()
    alert('Listo ✅')
  } catch (err) {
    console.error(err)
    alert('No se pudo guardar. Revisá Supabase (RLS / columnas).')
  }
}

async function toggleVisible(id) {
  const p = cache.find(x => x.id === id)
  if (!p) return
  const next = !p.visible

  const { error } = await supabase
    .from('productos_deportivos')
    .update({ visible: next, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('No se pudo cambiar visibilidad.')
    return
  }

  logMovimiento({ accion: next ? 'producto_visible' : 'producto_oculto', producto_id: id, detalle: { by: user.email } })
  await loadProductos()
}

async function deleteProducto(id) {
  if (user.rol !== 'ADMINISTRADOR') return
  if (!confirm('¿Borrar este producto?')) return

  const { error } = await supabase
    .from('productos_deportivos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('No se pudo borrar.')
    return
  }

  logMovimiento({ accion: 'producto_borrado', producto_id: id, detalle: { by: user.email } })
  await loadProductos()
}

async function startEdit(id) {
  const { data, error } = await supabase
    .from('productos_deportivos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    alert('No se pudo cargar el producto.')
    return
  }

  editingId = id
  setFormData(data)

  // Scroll suave al formulario
  document.getElementById('sectionNuevoProducto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

document.addEventListener('DOMContentLoaded', async () => {
  // asegurar names en inputs
  await loadProductos()

  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    saveProducto()
  })

  tbody?.addEventListener('click', (e) => {
    const btn = e.target.closest('button')
    if (!btn) return
    const act = btn.dataset.act
    const id = btn.dataset.id
    if (!id) return
    if (act === 'edit') startEdit(id)
    if (act === 'toggle') toggleVisible(id)
    if (act === 'del') deleteProducto(id)
  })
})
