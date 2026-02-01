-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT CHECK (rol IN ('ADMINISTRADOR', 'OPERADOR', 'MAYORISTA')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos deportivos
CREATE TABLE productos_deportivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    oficial_alternativa TEXT NOT NULL,
    año INTEGER,
    equipo TEXT NOT NULL,
    tipo_ropa TEXT NOT NULL,
    tipo_equipo TEXT NOT NULL,
    nacionalidad TEXT NOT NULL,
    deporte TEXT NOT NULL,
    etiquetas TEXT NOT NULL,
    descripcion TEXT,
    cargado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    portada TEXT,
    img1 TEXT,
    img2 TEXT,
    img3 TEXT,
    img4 TEXT,
    img5 TEXT
);

-- Insertar usuarios de prueba
INSERT INTO usuarios (email, password, rol) VALUES
('admin@deportes.com', 'admin123', 'ADMINISTRADOR'),
('operador@deportes.com', 'operador123', 'OPERADOR'),
('mayorista@deportes.com', 'mayorista123', 'MAYORISTA');

-- Insertar productos de prueba
INSERT INTO productos_deportivos (
    oficial_alternativa, año, equipo, tipo_ropa, tipo_equipo,
    nacionalidad, deporte, etiquetas, descripcion, cargado_por,
    portada, img1, img2
) VALUES
(
    'Oficial',
    2022,
    'Argentina',
    'Camiseta',
    'Nacional',
    'Argentino',
    'Futbol',
    'Argentina,Camiseta,Futbol,Nacional,2022',
    'Camiseta oficial de Argentina campeón del mundo Qatar 2022',
    (SELECT id FROM usuarios WHERE email = 'admin@deportes.com'),
    'https://i.ibb.co/wFJJpxMb/Whats-App-Image-2022-12-02-at-15-09-22-1.jpg',
    'https://i.ibb.co/WNJJ2kZn/b-Dise-o-en-escala-de-grises-3.jpg',
    'https://example.com/img2.jpg'
);