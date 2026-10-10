-- Tabla de Materia Prima
CREATE TABLE raw_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  minStockAlert NUMERIC NOT NULL DEFAULT 0,
  unitCost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Productos Terminados
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  estimatedCost NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponible',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Ventas
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  totalCost NUMERIC NOT NULL DEFAULT 0,
  paymentMethod TEXT NOT NULL,
  customerType TEXT NOT NULL
);

-- Tabla de Detalles de Venta (Items)
CREATE TABLE sale_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- Tabla de Gastos
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL
);

-- Insertar Datos de Prueba (Mock Data) para empezar rápido

INSERT INTO raw_materials (id, name, unit, stock, minStockAlert, unitCost) VALUES
('b23447de-d93d-4dc5-b44f-c0d15e9cd9f1', 'Harina de Trigo', 'kg', 15, 5, 1.2),
('649fcfc5-d7fb-41c4-a63f-67ed9b033a5b', 'Azúcar Morena', 'kg', 8, 10, 1.5),
('6b2b7373-c6ec-4cbf-84c1-4770267cb155', 'Chispas de Chocolate', 'kg', 3, 5, 5.0);

INSERT INTO products (id, name, category, price, estimatedCost, stock, status) VALUES
('5050f28a-7235-430c-abfc-f725a396dc1e', 'Galleta Choco Chips', 'Galletas', 2.5, 0.8, 45, 'Disponible'),
('ca38d9b1-6b21-4f10-9140-5e365cb842e4', 'Galleta Red Velvet', 'Galletas', 3.0, 1.1, 20, 'Disponible'),
('8ba4fdf2-70b1-419b-ab0a-ae838ad9b1f7', 'Brownie Clásico', 'Brownies', 3.5, 1.2, 15, 'Disponible');

-- Habilitar RLS (Opcional por ahora, permite lectura/escritura pública temporalmente para desarrollo)
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para permitir todo (Sustituir luego con auth)
CREATE POLICY "Permitir todo a todos temporalmente" ON raw_materials FOR ALL USING (true);
CREATE POLICY "Permitir todo a todos temporalmente" ON products FOR ALL USING (true);
CREATE POLICY "Permitir todo a todos temporalmente" ON sales FOR ALL USING (true);
CREATE POLICY "Permitir todo a todos temporalmente" ON sale_items FOR ALL USING (true);
CREATE POLICY "Permitir todo a todos temporalmente" ON expenses FOR ALL USING (true);

-- Tabla de Categorías (Nueva)
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Empleados/Usuarios (Nueva)
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar Categorías y Empleados de prueba
INSERT INTO categories (id, name) VALUES 
('1d50c765-9876-4321-abcd-1234567890ab', 'Galletas'),
('2d50c765-9876-4321-abcd-1234567890ac', 'Brownies'),
('3d50c765-9876-4321-abcd-1234567890ad', 'Packs');

INSERT INTO employees (id, name, role) VALUES 
('9f80b654-1234-5678-abcd-0987654321fe', 'Vendedor 1', 'EMPLOYEE');

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a todos temporalmente" ON categories FOR ALL USING (true);
CREATE POLICY "Permitir todo a todos temporalmente" ON employees FOR ALL USING (true);
