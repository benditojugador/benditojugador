// Cargar detalles del producto
async function loadProductDetails() {
    // Obtener ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Obtener datos del producto
        const { data: producto, error } = await supabase
            .from('productos_deportivos')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        // Actualizar la página con los datos del producto
        updateProductUI(producto);
        
    } catch (error) {
        console.error('Error cargando detalles del producto:', error);
        window.location.href = 'index.html';
    }
}

// Actualizar la interfaz con los datos del producto
function updateProductUI(producto) {
    // Actualizar título
    document.title = `${producto.equipo} - ${producto.tipo_ropa} | DeportesStore`;
    document.getElementById('productTitle').textContent = `${producto.equipo} - ${producto.tipo_ropa}`;
    
    // Actualizar información básica
    document.getElementById('productOficial').textContent = producto.oficial_alternativa;
    document.getElementById('productName').textContent = `${producto.equipo} - ${producto.tipo_ropa}`;
    document.getElementById('productCategory').textContent = producto.tipo_ropa;
    document.getElementById('productNationality').textContent = producto.nacionalidad;
    document.getElementById('productYear').textContent = producto.año || 'N/A';
    document.getElementById('productDescription').textContent = producto.descripcion || 'Sin descripción disponible';
    document.getElementById('productTeam').textContent = producto.equipo;
    document.getElementById('productClothingType').textContent = producto.tipo_ropa;
    document.getElementById('productTeamType').textContent = producto.tipo_equipo;
    document.getElementById('productSport').textContent = producto.deporte;
    
    // Actualizar imágenes
    const images = [
        producto.portada,
        producto.img1,
        producto.img2,
        producto.img3,
        producto.img4,
        producto.img5
    ].filter(img => img); // Filtrar imágenes nulas
    
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailsContainer = document.getElementById('thumbnails');
    
    if (images.length > 0) {
        mainImage.src = images[0];
        mainImage.alt = `${producto.equipo} - ${producto.tipo_ropa}`;
        
        // Crear miniaturas
        thumbnailsContainer.innerHTML = images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="Vista ${index + 1}">
            </div>
        `).join('');
        
        // Agregar eventos a las miniaturas
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = thumb.getAttribute('data-index');
                mainImage.src = images[index];
                
                // Actualizar miniaturas activas
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    } else {
        mainImage.src = 'https://via.placeholder.com/600x400?text=Sin+Imagen';
        thumbnailsContainer.innerHTML = '<p>No hay imágenes disponibles</p>';
    }
    
    // Actualizar etiquetas
    const tagsContainer = document.getElementById('productTags');
    if (producto.etiquetas) {
        const tags = producto.etiquetas.split(',').map(tag => tag.trim());
        tagsContainer.innerHTML = tags.map(tag => `
            <span class="tag">${tag}</span>
        `).join('');
    } else {
        tagsContainer.innerHTML = '<span class="tag">Sin etiquetas</span>';
    }
    
    // Configurar botón de WhatsApp
    const whatsappNumber = '5491122334455'; // Reemplaza con tu número
    const whatsappMessage = encodeURIComponent(
        `Hola! Estoy interesado en el producto:\n` +
        `${producto.equipo} - ${producto.tipo_ropa}\n` +
        `Año: ${producto.año || 'N/A'}\n` +
        `Nacionalidad: ${producto.nacionalidad}\n` +
        `Precio: Consultar\n\n` +
        `Me gustaría realizar un pedido.`
    );
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const footerWhatsapp = document.getElementById('footerWhatsapp');
    
    if (whatsappBtn) whatsappBtn.href = whatsappUrl;
    if (footerWhatsapp) footerWhatsapp.href = whatsappUrl;
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
    
    // Cargar detalles del producto
    await loadProductDetails();
});