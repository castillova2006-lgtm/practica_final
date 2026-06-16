--CREACIÓN DE TABLAS (DDL)

CREATE TABLE Editorial (
    id_editorial INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50),
    telefono VARCHAR(20)
);

CREATE TABLE Categoria (
    id_categoria INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    seccion VARCHAR(10)
);

CREATE TABLE Autor (
    id_autor INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nacionalidad VARCHAR(50),
    fecha_nacimiento DATE
);

CREATE TABLE Libro (
    id_libro INT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    a_publicacion INT,
    id_editorial INT,
    id_categoria INT,
    FOREIGN KEY (id_editorial) REFERENCES Editorial(id_editorial) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria) ON DELETE CASCADE
);

CREATE TABLE Libro_autor (
    id_libro INT,
    id_autor INT,
    PRIMARY KEY (id_libro, id_autor),
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro) ON DELETE CASCADE,
    FOREIGN KEY (id_autor) REFERENCES Autor(id_autor) ON DELETE CASCADE
);

CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    tipo_usuario VARCHAR(20), -- Este dato se refiere a que si el usuario es profesor o estudiante.
    fecha_registro DATE
);

CREATE TABLE Prestamo (
    id_prestamo INT PRIMARY KEY,
    id_usuario INT,
    fecha_salida DATE,
    fecha_devolucion DATE,
    estado VARCHAR(20), -- Ya sea 'Activo', 'Finalizado' o 'Vendido'
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Detalle_prestamo (
    id_detalle INT PRIMARY KEY,
    id_prestamo INT,
    id_libro INT,
    dias_retraso INT DEFAULT 0,
    estado_entrega VARCHAR(30), -- 'Buen Estado', 'Dañado', 'No Devuelto'
    FOREIGN KEY (id_prestamo) REFERENCES Prestamo(id_prestamo) ON DELETE CASCADE,
    FOREIGN KEY (id_libro) REFERENCES Libro(id_libro) ON DELETE CASCADE
);



-- POBLADO DE DATOS 

-- Editoriales
INSERT INTO Editorial VALUES 
(1, 'Addison-Wesley', 'EE.UU.', '+1-555-0101'),
(2, 'McGraw-Hill', 'México', '+52-55-1122'),
(3, 'O Reilly Media', 'EE.UU.', '+1-555-0202'),
(4, 'MIT Press', 'EE.UU.', '+1-555-0303'),
(5, 'Springer', 'Alemania', '+49-89-9988'),
(6, 'Alfaomega', 'Colombia', '+57-1-3344'),
(7, 'Pearson', 'España', '+34-91-5566'),
(8, 'Cambridge University Press', 'Reino Unido', '+44-1223-000'),
(9, 'Oxford University Press', 'Reino Unido', '+44-1865-111'),
(10, 'Anaya Multimedia', 'España', '+34-91-7788');

-- Categorías
INSERT INTO Categoria VALUES 
(1, 'Ciencias de la Computación', 'Libros generales de algoritmia y teoría', 'A-1'),
(2, 'Bases de Datos', 'Sistemas de almacenamiento, SQL y NoSQL', 'A-2'),
(3, 'Matemáticas Discretas', 'Lógica, grafos y conjuntos', 'B-1'),
(4, 'Cálculo', 'Cálculo diferencial, integral y multivariable', 'B-2'),
(5, 'Ingeniería de Software', 'Metodologías, diseño y patrones', 'A-3'),
(6, 'Redes de Computadoras', 'Protocolos, arquitectura y seguridad', 'A-4'),
(7, 'Inteligencia Artificial', 'Machine Learning, Redes Neuronales', 'A-5'),
(8, 'Sistemas Operativos', 'Arquitectura de SO, Linux, Kernels', 'A-6'),
(9, 'Álgebra Lineal', 'Matrices, vectores y espacios vectoriales', 'B-3'),
(10, 'Física', 'Mecánica clásica y electromagnetismo', 'B-4');

-- Autores
INSERT INTO Autor VALUES 
(1, 'Thomas Cormen', 'EE.UU.', '1956-06-25'),
(2, 'Abraham Silberschatz', 'Israel', '1947-05-01'),
(3, 'C.J. Date', 'Reino Unido', '1941-11-20'),
(4, 'Andrew Tanenbaum', 'EE.UU.', '1944-03-16'),
(5, 'Kenneth Rosen', 'EE.UU.', '1947-02-12'),
(6, 'James Stewart', 'Canadá', '1941-03-29'),
(7, 'Ian Sommerville', 'Reino Unido', '1948-02-23'),
(8, 'Gilbert Strang', 'EE.UU.', '1934-11-27'),
(9, 'Robert Martin', 'EE.UU.', '1952-12-05'),
(10, 'Martin Fowler', 'Reino Unido', '1963-12-18'),
(11, 'Ramez Elmasri', 'Egipto', '1950-10-20'),
(12, 'Shamkant Navathe', 'India', '1945-04-12'),
(13, 'Seymour Lipschutz', 'EE.UU.', '1932-08-15'),
(14, 'Richard Feynman', 'EE.UU.', '1918-05-11'),
(15, 'Stuart Russell', 'Reino Unido', '1962-04-14');

-- Libros 
INSERT INTO Libro VALUES 
(1, 'Introduction to Algorithms', '978-0262033848', 2009, 4, 1),
(2, 'Database System Concepts', '978-0073523323', 2010, 2, 2),
(3, 'An Introduction to Database Systems', '978-0321197849', 2003, 1, 2),
(4, 'Modern Operating Systems', '978-0133591620', 2014, 7, 8),
(5, 'Discrete Mathematics and its Applications', '978-0073383095', 2011, 2, 3),
(6, 'Calculus: Early Transcendentals', '978-0538497909', 2012, 2, 4),
(7, 'Software Engineering', '978-0137035151', 2010, 7, 5),
(8, 'Linear Algebra and its Applications', '978-0030105678', 2005, 1, 9),
(9, 'Clean Code', '978-0132350884', 2008, 7, 5),
(10, 'Refactoring', '978-0201485677', 1999, 1, 5),
(11, 'Fundamentals of Database Systems', '978-0133970777', 2015, 7, 2),
(12, 'Computer Networks', '978-0132126953', 2010, 7, 6),
(13, 'Artificial Intelligence: A Modern Approach', '978-0136042594', 2009, 7, 7),
(14, 'Operating System Concepts', '978-1118063330', 2012, 5, 8),
(15, 'Schaum Outline of Linear Algebra', '978-0071543521', 2008, 2, 9),
(16, 'The Feynman Lectures on Physics', '978-0465023820', 2011, 4, 10),
(17, 'Compilers: Principles, Techniques, and Tools', '978-0321483461', 2006, 7, 1),
(18, 'Data Structures and Algorithms in C++', '978-1118409350', 2011, 5, 1),
(19, 'SQL Performance Explained', '978-3950307801', 2012, 5, 2),
(20, 'Calculus Volume 1', '978-1938168024', 2016, 9, 4);

-- Libro_autor
INSERT INTO Libro_autor VALUES 
(1, 1),   -- Cormen a Introduction to Algorithms
(2, 2),   -- Silberschatz a Database System Concepts
(3, 3),   -- Date a An Introduction to DB Systems
(4, 4),   -- Tanenbaum a Modern OS
(5, 5),   -- Rosen a Discrete Mathematics
(6, 6),   -- Stewart a Calculus
(7, 7),   -- Sommerville a Software Engineering
(8, 8),   -- Strang a Linear Algebra
(9, 9),   -- Martin a Clean Code
(10, 10), -- Fowler a Refactoring
(11, 11), -- Elmasri a Fundamentals of DB
(11, 12), -- Navathe a Fundamentals of DB (Coautor)
(12, 4),   -- Tanenbaum a Computer Networks
(13, 15), -- Russell a Artificial Intelligence
(14, 2),   -- Silberschatz a OS Concepts
(15, 13), -- Lipschutz a Schaum Linear Algebra
(16, 14), -- Feynman a Physics
(17, 1),   -- Cormen a Compilers
(18, 2),   -- Silberschatz a Data Structures
(19, 3),   -- Date a SQL Performance
(20, 6);   -- Stewart a Calculus Vol 1

-- Usuarios
INSERT INTO Usuario VALUES 
(1, 'Vanya Castillo', 'vanya.cas@ipn.mx', '55-1234-5678', 'Estudiante', '2025-01-15'),
(2, 'Abel Pineda', 'abel.pin@ipn.mx', '55-8765-4321', 'Estudiante', '2025-01-20'),
(3, 'Carlos Mendoza', 'cmendoza@ipn.mx', '55-2233-4455', 'Profesor', '2024-08-10'),
(4, 'Diana Reyes', 'dreyes@gmail.com', '55-6677-8899', 'Externo', '2025-02-02'),
(5, 'Elena Gomez', 'egomez@ipn.mx', '55-9900-1122', 'Estudiante', '2025-03-11'),
(6, 'Fernando Ruiz', 'fruiz@ipn.mx', '55-4455-6677', 'Profesor', '2023-09-01'),
(7, 'Gabriela Luna', 'gluna@outlook.com', '55-3322-1100', 'Externo', '2025-04-18'),
(8, 'Hugo Sanchez', 'hsanchez@ipn.mx', '55-5566-7788', 'Estudiante', '2025-05-01'),
(9, 'Isabel Torres', 'itorres@ipn.mx', '55-8899-0011', 'Estudiante', '2025-05-10'),
(10, 'Jorge Lopez', 'jlopez@ipn.mx', '55-1111-2222', 'Profesor', '2024-02-15'),
(11, 'Laura Martinez', 'lmartinez@ipn.mx', '55-2222-3333', 'Estudiante', '2025-05-12'),
(12, 'Miguel Angel', 'mangel@ipn.mx', '55-3333-4444', 'Estudiante', '2025-05-14'),
(13, 'Nancy Peña', 'npena@ipn.mx', '55-4444-5555', 'Estudiante', '2025-05-15'),
(14, 'Oscar Ortiz', 'oortiz@ipn.mx', '55-5555-6666', 'Profesor', '2024-05-20'),
(15, 'Patricia Silva', 'psilva@ipn.mx', '55-6666-7777', 'Estudiante', '2025-05-18');

-- Préstamos
INSERT INTO Prestamo VALUES 
(1, 1, '2026-05-01', '2026-05-15', 'Finalizado'),
(2, 2, '2026-05-03', '2026-05-17', 'Finalizado'),
(3, 3, '2026-05-10', '2026-05-24', 'Finalizado'),
(4, 1, '2026-06-01', '2026-06-15', 'Activo'),
(5, 5, '2026-05-12', '2026-05-26', 'Finalizado'),
(6, 2, '2026-06-02', '2026-06-16', 'Activo'),
(7, 4, '2026-05-15', '2026-05-29', 'Finalizado'),
(8, 8, '2026-05-20', '2026-06-03', 'Finalizado'),
(9, 9, '2026-06-05', '2026-06-19', 'Activo'),
(10, 11, '2026-05-01', '2026-05-15', 'Finalizado'),
(11, 12, '2026-05-02', '2026-05-16', 'Finalizado'),
(12, 13, '2026-05-03', '2026-05-17', 'Finalizado'),
(13, 1, '2026-05-20', '2026-06-03', 'Finalizado'),
(14, 2, '2026-05-21', '2026-06-04', 'Finalizado'),
(15, 3, '2026-06-10', '2026-06-24', 'Activo');

-- Detalle de Préstamos
INSERT INTO Detalle_prestamo VALUES 
(1, 1, 2, 0, 'Buen Estado'),  -- Préstamo 1 incluyó el libro 2
(2, 1, 3, 0, 'Buen Estado'),  -- Préstamo 1 también incluyó el libro 3
(3, 2, 5, 2, 'Buen Estado'),  -- Devuelto con 2 días de retraso
(4, 3, 6, 0, 'Buen Estado'),
(5, 4, 11, 0, 'Buen Estado'), -- Préstamo activo de Vanya
(6, 5, 1, 4, 'Dañado'),       -- Devuelto tarde y dañado
(7, 6, 2, 0, 'Buen Estado'),
(8, 7, 4, 0, 'Buen Estado'),
(9, 8, 12, 1, 'Buen Estado'),
(10, 9, 13, 0, 'Buen Estado'),
(11, 10, 2, 0, 'Buen Estado'), 
(12, 10, 3, 0, 'Buen Estado'),
(13, 10, 11, 0, 'Buen Estado'),
(14, 10, 19, 0, 'Buen Estado'),
(15, 11, 2, 0, 'Buen Estado'),
(16, 11, 3, 0, 'Buen Estado'),
(17, 11, 11, 0, 'Buen Estado'),
(18, 11, 19, 0, 'Buen Estado'),
(19, 12, 5, 0, 'Buen Estado'),
(20, 13, 6, 0, 'Buen Estado');