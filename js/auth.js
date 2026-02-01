// auth.js - VERSIÓN SUPER SIMPLE SIN SUPABASE JS
const SUPABASE_URL = 'https://lentkpuclkmvktnujmva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E8GNXTBWSFCh-jxRPXM-uA_Ah1ouwCB';

// Login DIRECTO con Fetch API (más simple)
async function handleLogin(email, password, role) {
    try {
        console.log('Login attempt:', { email, role });
        
        // Consulta DIRECTA a la tabla usuarios
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/usuarios?email=eq.${email}&password=eq.${password}&rol=eq.${role}`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('HTTP Error:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const users = await response.json();
        console.log('Users found:', users);
        
        if (!users || users.length === 0) {
            throw new Error('Credenciales incorrectas');
        }
        
        const user = users[0];
        
        // Guardar en localStorage (texto plano, sin seguridad)
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            rol: user.rol,
            nombre: user.nombre,
            loggedIn: true
        }));
        
        // Redirigir según rol
        if (['ADMINISTRADOR', 'OPERADOR', 'MAYORISTA'].includes(role)) {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Login error details:', error);
        return { 
            success: false, 
            message: error.message.includes('Credenciales') 
                ? 'Credenciales incorrectas' 
                : 'Error: ' + error.message 
        };
    }
}

// Logout simple
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Obtener usuario actual
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Mostrar/ocultar elementos según login
function updateUIForUser() {
    const user = getCurrentUser();
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.querySelector('.btn-login');
    
    if (user && user.loggedIn) {
        if (adminLink) {
            adminLink.style.display = 'flex';
            adminLink.href = 'admin/dashboard.html';
            adminLink.innerHTML = `<i class="fas fa-cog"></i> ${user.rol}`;
        }
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'none';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded');
    
    // Actualizar UI
    updateUIForUser();
    
    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const loginBtn = this.querySelector('.btn-login-submit');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            loginBtn.disabled = true;
            
            const result = await handleLogin(email, password, role);
            
            const messageDiv = document.getElementById('loginMessage');
            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.message;
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // Manejar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Proteger páginas admin
    if (window.location.pathname.includes('admin')) {
        const user = getCurrentUser();
        if (!user || !user.loggedIn) {
            window.location.href = 'login.html';
        }
    }
});