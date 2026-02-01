// Configuración de Supabase
const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co'; // Reemplaza con tu URL
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB'; // Reemplaza con tu clave anónima

let supabase;

// Inicializar Supabase
async function initSupabase() {
    const supabaseScript = document.createElement('script');
    supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    supabaseScript.onload = async () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Verificar si hay usuario logueado
        await checkAuth();
    };
    document.head.appendChild(supabaseScript);
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

// Manejar login
async function handleLogin(email, password, role) {
    try {
        // Verificar credenciales directamente en la base de datos
        const { data: users, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('rol', role)
            .single();

        if (error || !users) {
            throw new Error('Credenciales incorrectas');
        }

        // Guardar usuario en localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            id: users.id,
            email: users.email,
            rol: users.rol,
            loggedIn: true
        }));

        // Redirigir según el rol
        if (role === 'ADMINISTRADOR' || role === 'OPERADOR' || role === 'MAYORISTA') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }

        return { success: true };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, message: error.message };
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

// Verificar permisos
function checkPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    if (requiredRole === 'ADMINISTRADOR') {
        return user.rol === 'ADMINISTRADOR';
    } else if (requiredRole === 'OPERADOR') {
        return user.rol === 'ADMINISTRADOR' || user.rol === 'OPERADOR';
    } else if (requiredRole === 'MAYORISTA') {
        return user.rol === 'ADMINISTRADOR' || user.rol === 'MAYORISTA';
    }
    return false;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
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