import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

/**
 * ✅ Supabase
 * Nota: hoy usás tabla 'usuarios' con password en texto plano (según tu esquema actual).
 * Más adelante lo mejor es migrar a Supabase Auth, pero ahora dejamos esto estable y simple.
 */
export const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** WhatsApp (formato correcto para mostrar) */
export const WA_DISPLAY = '+54 9 2645 454982'
/** WhatsApp (formato para wa.me, sin espacios) */
export const WA_NUMBER = '5492645454982'
export const WA_BASE = `https://wa.me/${WA_NUMBER}`

/** Util: normaliza texto para búsquedas */
export function norm(str = '') {
  return String(str).toLowerCase().trim()
}

/** Util: arma un título humano para el producto */
export function productTitle(p) {
  return (
    p?.oficial_alternativa ||
    p?.equipo ||
    p?.tipo_ropa ||
    'Producto'
  )
}

/** Util: arma el link de WhatsApp con mensaje automático */
export function buildWaLink(product) {
  const title = productTitle(product)
  const msg = `Hola, vengo a consultar por ${title}.`
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`
}

/** Util: imagen principal con fallback */
export function getMainImage(product) {
  return product?.portada || product?.img1 || product?.img2 || product?.img3 || product?.img4 || product?.img5 || ''
}
