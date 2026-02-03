import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

/**
 * Supabase (Catálogo Bendito Jugador)
 */
export const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * WhatsApp
 * Mostrar: +54 9 2645 454982
 * wa.me: 5492645454982
 */
export const WA_DISPLAY = '2645042317'
export const WA_NUMBER = '5492645042317'
export const WA_BASE = `https://wa.me/${WA_NUMBER}`

export function norm(v = '') {
  return String(v ?? '').toLowerCase().trim()
}

export function productTitle(p) {
  return (
    p?.oficial_alternativa ||
    (p?.equipo && p?.año ? `${p.equipo} ${p.año}` : '') ||
    p?.equipo ||
    p?.tipo_ropa ||
    'Producto'
  )
}

export function getMainImage(p) {
  return p?.portada || p?.img1 || p?.img2 || p?.img3 || p?.img4 || p?.img5 || ''
}

export function buildWaLink(product) {
  const title = productTitle(product)
  const msg = `Hola, vengo a consultar por ${title}.`
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`
}
