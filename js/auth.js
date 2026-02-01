// auth.js - CON SUPABASE JS V2

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuración
const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('✅ Supabase client created')

// ⬅️ EXPORTAR DESPUÉS DE CREARLO
export { supabase }

// ================= LOGIN =================
async function handleLogin(email, password, role) {
    try {
        console.log('🔑 Intentando login con Supabase JS...', { email, role })
        
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('rol', role)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Credenciales incorrectas')
            }
            throw new Error(error.message)
        }

        localStorage.setItem('currentUser', JSON.stringify({
            id: data.id,
            email: data.email,
            rol: data.rol,
            nombre: data.nombre,
            loggedIn: true
        }))

        if (['ADMINISTRADOR', 'OPERADOR', 'MAYORISTA'].includes(role)) {
            window.location.href = 'admin/dashboard.html'
        } else {
            window.location.href = 'index.html'
        }

        return { success: true }

    } catch (error) {
        return { success: false, message: error.message }
    }
}

// ================= HELPERS =================
function handleLogout() {
    localStorage.removeItem('currentUser')
    window.location.href = 'index.html'
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser()
    if (window.location.pathname.includes('admin') && (!user || !user.loggedIn)) {
        window.location.href = 'login.html'
    }
})
