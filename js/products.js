import { supabase } from './auth.js'

// Cargar productos en la página principal
async function loadProducts(filter = 'all') {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';
    
    try {
        const { data: productos, error } = await supabase
            .from('productos_deportivos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!productos || productos.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
            return;
        }
        
        // Filtrar productos si es necesario
        let filteredProducts = productos;
        if (filter !== 'all') {
            filteredProducts = productos.filter(product => {
                if (filter === 'futbol') return product.deporte === 'Futbol';
                if (filter === 'basquet') return product.deporte === 'Basquet';
                if (filter === 'nacional') return product.tipo_equipo === 'Nacional';
                if (filter === 'club') return product.tipo_equipo === 'Club';
                return true;
            });
        }
        
        // Generar HTML de productos
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.portada || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}" 
                         alt="${product.equipo} - ${product.tipo_ropa}">
                </div>
                <div class="product-info">
                    <h3>${product.equipo} - ${product.tipo_ropa}</h3>
                    <div class="product-meta">
                        <span><i class="fas fa-calendar"></i> ${product.año || 'N/A'}</span>
                        <span><i class="fas fa-flag"></i> ${product.nacionalidad}</span>
                    </div>
                    <div class="product-price">${product.oficial_alternativa}</div>
                    <a href="producto.html?id=${product.id}" class="btn-view">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </a>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        productsGrid.innerHTML = '<div class="error">Error al cargar los productos</div>';
    }
}

// Inicializar filtros
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            // Cargar productos con el filtro seleccionado
            const filter = button.getAttribute('data-filter');
            loadProducts(filter);
        });
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que Supabase se inicialice
    await new Promise(resolve => {
        const checkSupabase = setInterval(() => {
            if (window.supabase) {
                clearInterval(checkSupabase);
                resolve();
            }
        }, 100);
    });
    
    // Cargar productos
    await loadProducts();
    
    // Inicializar filtros
    initFilters();
});