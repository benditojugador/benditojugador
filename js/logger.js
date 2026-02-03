import { supabase } from './auth.js'

/**
 * Guarda un movimiento en public.movimientos.
 * No rompe la UX si falla (métricas best-effort).
 */
export async function logMovimiento({ accion, producto_id = null, detalle = null } = {}) {
  try {
    const raw = localStorage.getItem('currentUser')
    const user = raw ? JSON.parse(raw) : null

    await supabase
      .from('movimientos')
      .insert([{
        usuario_id: user?.id ?? null,
        accion: String(accion || '').slice(0, 80),
        producto_id,
        detalle: detalle ?? null
      }])
  } catch (_) {
    // Silencioso a propósito
  }
}
