// Panel de administración
class AdminPanel {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }
    
    async init() {
        // Verificar permisos
        if (!this.currentUser || !this.currentUser.loggedIn) {
            window.location.href = '../login.html';
            return;
        }
        
        // Actualizar interfaz según el rol
        this.updateUIForRole();
        
        // Cargar estadísticas
        await this.loadStats();
        
        // Cargar productos
        await this.loadProducts();
        
        // Inicializar eventos
        this.initEvents();
    }
    
    updateUIForRole() {
        const userRole = this.currentUser.rol;
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (welcomeMessage) {
            welcomeMessage.textContent = `Bienvenido, ${userRole}`;
        }
        
        // Mostrar/ocultar elementos según el rol
        if (userRole === 'MAYORISTA') {
            // Mayoristas solo pueden ver productos
            document.querySelectorAll('.btn-action[data-action="add"]').forEach(btn => btn.style.display = 'none');
            document.querySelectorAll('.btn-action[data-action="edit"]').forEach(btn => btn.style.display = 'none');
            document.querySelectorAll('.btn-action[data-action="delete"]').forEach(btn => btn.style.display = 'none');
        } else if (userRole === 'OPERADOR') {
            // Operadores pueden agregar y editar
            document.querySelectorAll('.btn-action[data-action="delete"]').forEach(btn => btn.style.display = 'none');
        }
    }
    
    async loadStats() {
        try {
            // Contar productos
            const { count: totalProducts, error: productsError } = await supabase
                .from('productos_deportivos')
                .select('*', { count: 'exact', head: true });
            
            if (productsError) throw productsError;
            
            // Contar por categoría
            const { data: categories, error: categoriesError } = await supabase
                .from('productos_deportivos')
                .select('deporte');
            
            if (categoriesError) throw categoriesError;
            
            const categoryCount = {};
            categories.forEach(item => {
                categoryCount[item.deporte] = (categoryCount[item.deporte] || 0) + 1;
            });
            
            // Actualizar estadísticas en la UI
            document.getElementById('totalProducts').textContent = totalProducts || 0;
            
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }
    
    async loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="10">Cargando productos...</td></tr>';
        
        try {
            const { data: productos, error } = await supabase
                .from('productos_deportivos')
                .select(`
                    *,
                    usuarios(email)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (!productos || productos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10">No hay productos registrados</td></tr>';
                return;
            }
            
            // Generar tabla
            tbody.innerHTML = productos.map(product => `
                <tr>
                    <td>
                        <img src="${product.portada || 'https://via.placeholder.com/50?text=Sin+Img'}" 
                             alt="Portada" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    </td>
                    <td>${product.oficial_alternativa}</td>
                    <td>${product.año || '-'}</td>
                    <td>${product.equipo}</td>
                    <td>${product.tipo_ropa}</td>
                    <td>${product.nacionalidad}</td>
                    <td>${product.deporte}</td>
                    <td>${product.usuarios?.email || '-'}</td>
                    <td>${new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                        ${this.currentUser.rol !== 'MAYORISTA' ? `
                            <button class="btn-table edit" onclick="admin.editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${this.currentUser.rol === 'ADMINISTRADOR' ? `
                            <button class="btn-table delete" onclick="admin.deleteProduct('${product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            tbody.innerHTML = '<tr><td colspan="10">Error al cargar los productos</td></tr>';
        }
    }
    
    initEvents() {
        // Botón para agregar producto
        const addBtn = document.querySelector('[data-action="add"]');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showProductModal());
        }
        
        // Cerrar modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModal());
        }
        
        // Guardar producto
        const saveBtn = document.getElementById('saveProductBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProduct());
        }
        
        // Cerrar modal haciendo clic fuera
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }
    
    showProductModal(productId = null) {
        this.currentProductId = productId;
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');
        
        if (productId) {
            // Modo edición
            modalTitle.textContent = 'Editar Producto';
            this.loadProductForEdit(productId);
        } else {
            // Modo nuevo
            modalTitle.textContent = 'Agregar Producto';
            form.reset();
        }
        
        modal.classList.add('active');
    }
    
    async loadProductForEdit(productId) {
        try {
            const { data: producto, error } = await supabase
                .from('productos_deportivos')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            
            // Rellenar formulario
            const form = document.getElementById('productForm');
            Object.keys(producto).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = producto[key] || '';
                }
            });
            
        } catch (error) {
            console.error('Error cargando producto para editar:', error);
            alert('Error al cargar el producto');
        }
    }
    
    hideModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        this.currentProductId = null;
    }
    
    async saveProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        
        // Validar datos
        if (!productData.equipo || !productData.tipo_ropa || !productData.nacionalidad || !productData.deporte) {
            alert('Por favor complete los campos obligatorios');
            return;
        }
        
        // Preparar datos para Supabase
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const dataToSave = {
            ...productData,
            cargado_por: currentUser.id,
            updated_at: new Date().toISOString()
        };
        
        // Convertir año a número si existe
        if (dataToSave.año) {
            dataToSave.año = parseInt(dataToSave.año);
        }
        
        try {
            let result;
            if (this.currentProductId) {
                // Actualizar producto existente
                result = await supabase
                    .from('productos_deportivos')
                    .update(dataToSave)
                    .eq('id', this.currentProductId);
            } else {
                // Crear nuevo producto
                result = await supabase
                    .from('productos_deportivos')
                    .insert([dataToSave]);
            }
            
            if (result.error) throw result.error;
            
            alert(this.currentProductId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
            this.hideModal();
            await this.loadProducts();
            await this.loadStats();
            
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error al guardar el producto: ' + error.message);
        }
    }
    
    async deleteProduct(productId) {
        if (!confirm('¿Está seguro de eliminar este producto?')) return;
        
        try {
            const { error } = await supabase
                .from('productos_deportivos')
                .delete()
                .eq('id', productId);
            
            if (error) throw error;
            
            alert('Producto eliminado correctamente');
            await this.loadProducts();
            await this.loadStats();
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar el producto');
        }
    }
    
    editProduct(productId) {
        this.showProductModal(productId);
    }
}

// Inicializar panel de administración cuando el DOM esté listo
let admin;
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
    
    admin = new AdminPanel();
});