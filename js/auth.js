// Configuración de Supabase
const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB';

let supabase;

// Inicializar Supabase - VERSIÓN CORREGIDA
async function initSupabase() {
    try {
        // Cargar Supabase desde CDN con import dinámico
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        // Crear cliente
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        
        console.log('✅ Supabase inicializado correctamente');
        
        // Verificar conexión
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        if (error) {
            console.warn('⚠️ Supabase conectado, pero error en tabla:', error.message);
        } else {
            console.log('✅ Conexión a Supabase verificada');
        }
        
        // Verificar si hay usuario logueado
        await checkAuth();
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
    }
}

// Verificar autenticación
async function checkAuth() {
    const user = getCurrentUser();
    
    if (user) {
        // Mostrar botones de admin y logout
        const adminLink = document.getElementById('adminLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginBtn = document.querySelector('.btn-login');
        
        if (adminLink) {
            adminLink.style.display = 'flex';
            if (user.rol === 'ADMINISTRADOR') {
                adminLink.href = 'admin/dashboard.html';
            } else if (user.rol === 'OPERADOR') {
                adminLink.href = 'admin/dashboard.html';
                adminLink.innerHTML = '<i class="fas fa-cog"></i> Operador';
            } else if (user.rol === 'MAYORISTA') {
                adminLink.href = 'admin/dashboard.html';
                adminLink.innerHTML = '<i class="fas fa-cog"></i> Mayorista';
            }
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
    }
}

// Manejar login - VERSIÓN SIMPLIFICADA
async function handleLogin(email, password, role) {
    try {
        console.log('Intentando login con:', { email, role });
        
        // Verificar que supabase esté inicializado
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        // Verificar credenciales directamente
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('rol', role)
            .single();

        if (error) {
            console.error('Error Supabase:', error);
            throw new Error('Error de conexión con la base de datos');
        }
        
        if (!user) {
            throw new Error('Credenciales incorrectas');
        }

        // Guardar usuario en localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            rol: user.rol,
            loggedIn: true
        }));

        // Redirigir
        if (['ADMINISTRADOR', 'OPERADOR', 'MAYORISTA'].includes(role)) {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }

        return { success: true };
    } catch (error) {
        console.error('Error en login:', error);
        return { 
            success: false, 
            message: error.message === 'Credenciales incorrectas' 
                ? 'Credenciales incorrectas' 
                : 'Error en el servidor. Intenta nuevamente.' 
        };
    }
}

// Manejar logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Obtener usuario actual
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando...');
    
    // Inicializar Supabase
    initSupabase();
    
    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const loginBtn = loginForm.querySelector('.btn-login-submit');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            loginBtn.disabled = true;
            
            const result = await handleLogin(email, password, role);
            
            const messageDiv = document.getElementById('loginMessage');
            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.message || 'Error en el inicio de sesión';
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // Manejar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Verificar permisos en páginas de admin
    if (window.location.pathname.includes('admin')) {
        const user = getCurrentUser();
        if (!user || !user.loggedIn) {
            window.location.href = '../login.html';
        }
    }
});