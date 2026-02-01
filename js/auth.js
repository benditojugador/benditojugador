// auth.js - CON SUPABASE JS V2
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuración
const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('✅ Supabase client created')

// Login con Supabase JS
async function handleLogin(email, password, role) {
    try {
        console.log('🔑 Intentando login con Supabase JS...', { email, role })
        
        // Consultar usuario con Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('rol', role)
            .single()

        console.log('📦 Respuesta Supabase:', { data, error })

        if (error) {
            console.error('❌ Error Supabase:', error)
            
            // Si es error de "no rows", es credenciales incorrectas
            if (error.code === 'PGRST116') {
                throw new Error('Credenciales incorrectas')
            }
            throw new Error('Error en la base de datos: ' + error.message)
        }

        if (!data) {
            throw new Error('Credenciales incorrectas')
        }

        // Guardar usuario
        localStorage.setItem('currentUser', JSON.stringify({
            id: data.id,
            email: data.email,
            rol: data.rol,
            nombre: data.nombre,
            loggedIn: true
        }))

        console.log('✅ Login exitoso, redirigiendo...')

        // Redirigir
        if (['ADMINISTRADOR', 'OPERADOR', 'MAYORISTA'].includes(role)) {
            window.location.href = 'admin/dashboard.html'
        } else {
            window.location.href = 'index.html'
        }

        return { success: true }

    } catch (error) {
        console.error('💥 Error completo:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('currentUser')
    window.location.href = 'index.html'
}

// Obtener usuario
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
}

// Actualizar UI
function updateUIForUser() {
    const user = getCurrentUser()
    const adminLink = document.getElementById('adminLink')
    const logoutBtn = document.getElementById('logoutBtn')
    const loginBtn = document.querySelector('.btn-login')

    if (user && user.loggedIn) {
        console.log('👤 Usuario logueado:', user.email)
        if (adminLink) {
            adminLink.style.display = 'flex'
            adminLink.href = 'admin/dashboard.html'
            adminLink.innerHTML = `<i class="fas fa-cog"></i> ${user.rol}`
        }
        if (logoutBtn) logoutBtn.style.display = 'flex'
        if (loginBtn) loginBtn.style.display = 'none'
    }
}

// Test conexión Supabase
async function testSupabaseConnection() {
    try {
        console.log('🧪 Probando conexión a Supabase...')
        const { data, error } = await supabase
            .from('usuarios')
            .select('count')
            .limit(1)

        if (error) {
            console.error('❌ Error conexión:', error)
            return false
        }

        console.log('✅ Conexión OK, data:', data)
        return true
    } catch (error) {
        console.error('💥 Error test:', error)
        return false
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM cargado, inicializando...')
    
    // Test conexión
    const connected = await testSupabaseConnection()
    console.log(connected ? '✅ Supabase conectado' : '❌ Supabase NO conectado')
    
    // Actualizar UI
    updateUIForUser()
    
    // Login form
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault()
            
            const email = document.getElementById('email').value.trim()
            const password = document.getElementById('password').value
            const role = document.getElementById('role').value
            
            const loginBtn = this.querySelector('.btn-login-submit')
            const originalText = loginBtn.innerHTML
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...'
            loginBtn.disabled = true
            
            const result = await handleLogin(email, password, role)
            
            const messageDiv = document.getElementById('loginMessage')
            if (result.success) {
                messageDiv.className = 'message success'
                messageDiv.textContent = '¡Login exitoso! Redirigiendo...'
            } else {
                messageDiv.className = 'message error'
                messageDiv.textContent = result.message
                loginBtn.innerHTML = originalText
                loginBtn.disabled = false
            }
        })
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault()
            handleLogout()
        })
    }
    
    // Proteger admin
    if (window.location.pathname.includes('admin')) {
        const user = getCurrentUser()
        if (!user || !user.loggedIn) {
            window.location.href = 'login.html'
        }
    }
})