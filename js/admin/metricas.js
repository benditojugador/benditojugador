import { supabase, requireAuth } from '../auth.js'

const user = requireAuth(['ADMINISTRADOR'])
if (!user) throw new Error('No auth')

const kpisEl = document.getElementById('kpis')
const tbody = document.getElementById('movimientosTable')

function fmtDate(ts) {
  try { return new Date(ts).toLocaleString('es-AR') } catch { return '' }
}

function fmtJson(v) {
  if (!v) return ''
  try { return JSON.stringify(v).slice(0, 180) } catch { return String(v).slice(0, 180) }
}

async function loadMetricas() {
  if (!kpisEl || !tbody) return

  // KPI: total productos
  const { count: totalProductos } = await supabase
    .from('productos_deportivos')
    .select('*', { count: 'exact', head: true })

  // Movimientos últimos 30 días (tope 500)
  const since = new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const { data: movs, error } = await supabase
    .from('movimientos')
    .select('id, accion, usuario_id, producto_id, detalle, creado_en, usuarios:usuarios(email), productos:productos_deportivos(equipo, tipo_ropa)')
    .gte('creado_en', since)
    .order('creado_en', { ascending: false })
    .limit(200)

  if (error) {
    console.error(error)
    kpisEl.innerHTML = '<div class="admin-kpi"><div class="label">Error</div><div class="value">Revisá RLS</div></div>'
    tbody.innerHTML = '<tr><td colspan="5">No se pudieron cargar métricas.</td></tr>'
    return
  }

  const list = movs || []
  const countBy = (a) => list.filter(x => x.accion === a).length

  const vistasProducto = countBy('producto_visto')
  const clicksWsp = countBy('click_whatsapp')
  const clicksDetalle = countBy('click_detalle')
  const creados = countBy('producto_creado')
  const editados = countBy('producto_editado')
  const borrados = countBy('producto_borrado')

  const kpis = [
    { label: 'Productos totales', value: totalProductos ?? 0 },
    { label: 'Vistas de producto (30d)', value: vistasProducto },
    { label: 'Clicks WhatsApp (30d)', value: clicksWsp },
    { label: 'Clicks a detalle (30d)', value: clicksDetalle },
    { label: 'Productos creados (30d)', value: creados },
    { label: 'Ediciones (30d)', value: editados },
    { label: 'Borrados (30d)', value: borrados }
  ]

  kpisEl.innerHTML = kpis.map(k => `
    <div class="admin-kpi">
      <div class="label">${k.label}</div>
      <div class="value">${k.value}</div>
    </div>
  `).join('')

  tbody.innerHTML = list.length ? list.map(m => {
    const u = m.usuarios?.email || '—'
    const prod = m.productos ? `${m.productos.equipo} - ${m.productos.tipo_ropa}` : (m.producto_id ? 'ID '+m.producto_id.slice(0,8) : '—')
    return `
      <tr>
        <td>${fmtDate(m.creado_en)}</td>
        <td>${m.accion}</td>
        <td>${u}</td>
        <td>${prod}</td>
        <td>${fmtJson(m.detalle)}</td>
      </tr>
    `
  }).join('') : '<tr><td colspan="5">Sin movimientos en los últimos 30 días.</td></tr>'
}

document.addEventListener('DOMContentLoaded', () => {
  loadMetricas()
})
