# Sistema de Biblioteca - Práctica Final de Bases de Datos

## Descripción del Proyecto

Aplicación de consola interactiva (CLI) desarrollada en **Node.js** que se conecta a una base de datos **PostgreSQL** completamente dockerizada. El sistema permite ejecutar y visualizar **20 consultas SQL** junto con sus expresiones equivalentes en **Álgebra Relacional**, **Cálculo Relacional de Tuplas (CRT)** y **Cálculo Relacional de Dominios (CRD)**.

El proyecto modela un **sistema de gestión de biblioteca** con las siguientes entidades:
- Editorial, Categoría, Autor, Libro, Libro_Autor, Usuario, Préstamo, Detalle_Préstamo

---

## Despliegue con Docker 

### Prerrequisitos
- [Docker](https://www.docker.com/products/docker-desktop/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

### Instrucciones de ejecución

```bash
# 1. Clonar el repositorio
git clone (https://github.com/castillova2006-lgtm/practica_final.git)
cd practica_final

# 2. Construir y levantar los contenedores
docker compose up --build

# 3. La aplicación se conectará automáticamente a PostgreSQL
#    y mostrará el menú interactivo en la terminal.
```

### Para interactuar con el menú CLI dentro de Docker:

```bash
docker compose run --rm app
```

### Para detener los servicios:

```bash
docker compose down
```

---

## Menú Interactivo (CLI)

Al ejecutar la aplicación, se presenta un menú con las 20 consultas disponibles. Para cada una se muestra:

1. **Título y descripción** de la consulta
2. **Expresión en Álgebra Relacional**
3. **Expresión en Cálculo Relacional de Tuplas (CRT)**
4. **Expresión en Cálculo Relacional de Dominios (CRD)**
5. **Sentencia SQL equivalente**
6. **Resultados obtenidos** directamente desde PostgreSQL

---

## Esquema de la Base de Datos

```
Editorial(id_editorial, nombre, pais, telefono)
Categoria(id_categoria, nombre, descripcion, seccion)
Autor(id_autor, nombre, nacionalidad, fecha_nacimiento)
Libro(id_libro, titulo, isbn, a_publicacion, id_editorial, id_categoria)
Libro_autor(id_libro, id_autor)
Usuario(id_usuario, nombre, correo, telefono, tipo_usuario, fecha_registro)
Prestamo(id_prestamo, id_usuario, fecha_salida, fecha_devolucion, estado)
Detalle_prestamo(id_detalle, id_prestamo, id_libro, dias_retraso, estado_entrega)
```

---

## Las 20 Consultas con Expresiones en Álgebra y Cálculo Relacional

---

### Consulta 1: Selección Simple (σ)

**Descripción:** Seleccionar los libros publicados en el año 2010.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `σ_{a_publicacion = 2010}(Libro)` |
| **CRT** | `{t \| Libro(t) ∧ t.a_publicacion = 2010}` |
| **CRD** | `{(id_l, tit, is, a_p, id_e, id_c) \| Libro(id_l, tit, is, a_p, id_e, id_c) ∧ a_p = 2010}` |

**SQL:**
```sql
SELECT id_libro, titulo, isbn, a_publicacion FROM Libro WHERE a_publicacion = 2010;
```

---

### Consulta 2: Proyección Combinada con Selección (π + σ)

**Descripción:** Obtener el título y el ISBN de los libros de la editorial con ID 7.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{titulo, isbn}(σ_{id_editorial = 7}(Libro))` |
| **CRT** | `{t.titulo, t.isbn \| Libro(t) ∧ t.id_editorial = 7}` |
| **CRD** | `{(tit, is) \| ∃id_l ∃a_p ∃id_e ∃id_c (Libro(id_l, tit, is, a_p, id_e, id_c) ∧ id_e = 7)}` |

**SQL:**
```sql
SELECT titulo, isbn FROM Libro WHERE id_editorial = 7;
```

---

### Consulta 3: Unión de Resultados (∪)

**Descripción:** Obtener los nombres de todos los usuarios que son 'Estudiante' o 'Profesor'.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{nombre}(σ_{tipo='Estudiante'}(Usuario)) ∪ π_{nombre}(σ_{tipo='Profesor'}(Usuario))` |
| **CRT** | `{u.nombre \| Usuario(u) ∧ (u.tipo_usuario = 'Estudiante' ∨ u.tipo_usuario = 'Profesor')}` |
| **CRD** | `{(nom) \| ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u, nom, cor, tel, t_u, f_r) ∧ (t_u = 'Estudiante' ∨ t_u = 'Profesor'))}` |

**SQL:**
```sql
SELECT nombre, tipo_usuario FROM Usuario WHERE tipo_usuario = 'Estudiante'
UNION
SELECT nombre, tipo_usuario FROM Usuario WHERE tipo_usuario = 'Profesor';
```

---

### Consulta 4: Intersección de Resultados (∩)

**Descripción:** Encontrar los IDs de libros prestados en 'Buen Estado' que también tienen días de retraso.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{id_libro}(σ_{estado_entrega='Buen Estado'}(Detalle_prestamo)) ∩ π_{id_libro}(σ_{dias_retraso > 0}(Detalle_prestamo))` |
| **CRT** | `{d.id_libro \| Detalle_prestamo(d) ∧ d.estado_entrega='Buen Estado' ∧ ∃d2(Detalle_prestamo(d2) ∧ d2.id_libro=d.id_libro ∧ d2.dias_retraso>0)}` |
| **CRD** | `{(id_l) \| ∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d,id_p,id_l,re,est) ∧ est='Buen Estado') ∧ ∃id_d2 ∃id_p2 ∃re2 ∃est2 (Detalle_prestamo(id_d2,id_p2,id_l,re2,est2) ∧ re2>0)}` |

**SQL:**
```sql
SELECT id_libro FROM Detalle_prestamo WHERE estado_entrega = 'Buen Estado'
INTERSECT
SELECT id_libro FROM Detalle_prestamo WHERE dias_retraso > 0;
```

---

### Consulta 5: Diferencia de Conjuntos (−)

**Descripción:** Obtener los libros registrados que nunca han sido prestados.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{id_libro}(Libro) − π_{id_libro}(Detalle_prestamo)` |
| **CRT** | `{l.id_libro \| Libro(l) ∧ ¬(∃d(Detalle_prestamo(d) ∧ d.id_libro = l.id_libro))}` |
| **CRD** | `{(id_l) \| ∃tit ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c)) ∧ ¬(∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d,id_p,id_l,re,est)))}` |

**SQL:**
```sql
SELECT id_libro, titulo FROM Libro WHERE id_libro NOT IN (SELECT id_libro FROM Detalle_prestamo);
```

---

### Consulta 6: Producto Cartesiano (×)

**Descripción:** Mostrar todas las combinaciones posibles entre editoriales y categorías (limitado a 15 resultados).

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `Editorial × Categoria` |
| **CRT** | `{e, c \| Editorial(e) ∧ Categoria(c)}` |
| **CRD** | `{(id_e, nom_e, id_c, nom_c) \| Editorial(id_e, nom_e, _, _) ∧ Categoria(id_c, nom_c, _, _)}` |

**SQL:**
```sql
SELECT e.nombre AS editorial, c.nombre AS categoria
FROM Editorial e CROSS JOIN Categoria c LIMIT 15;
```

---

### Consulta 7: Join Natural (⋈)

**Descripción:** Obtener el título de cada libro junto con el nombre de su editorial.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{titulo, nombre}(Libro ⋈ Editorial)` |
| **CRT** | `{l.titulo, e.nombre \| Libro(l) ∧ Editorial(e) ∧ l.id_editorial = e.id_editorial}` |
| **CRD** | `{(tit, nom_e) \| ∃id_l ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c) ∧ ∃pais ∃tel (Editorial(id_e,nom_e,pais,tel)))}` |

**SQL:**
```sql
SELECT l.titulo, e.nombre AS editorial
FROM Libro l INNER JOIN Editorial e ON l.id_editorial = e.id_editorial;
```

---

### Consulta 8: Theta Join (⋈θ)

**Descripción:** Obtener libros publicados después del año de registro de cada usuario (limitado a 10).

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `σ_{a_publicacion > EXTRACT(YEAR FROM fecha_registro)}(Libro × Usuario)` |
| **CRT** | `{l.titulo, u.nombre \| Libro(l) ∧ Usuario(u) ∧ l.a_publicacion > YEAR(u.fecha_registro)}` |
| **CRD** | `{(tit, nom) \| ∃id_l ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,_,a_p,id_e,id_c)) ∧ ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u,nom,cor,tel,t_u,f_r) ∧ a_p > YEAR(f_r))}` |

**SQL:**
```sql
SELECT l.titulo, u.nombre, l.a_publicacion, u.fecha_registro
FROM Libro l, Usuario u
WHERE l.a_publicacion > EXTRACT(YEAR FROM u.fecha_registro) LIMIT 10;
```

---

### Consulta 9: Renombramiento / Self Join (ρ)

**Descripción:** Encontrar pares de libros que pertenecen a la misma categoría.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{L1.titulo, L2.titulo}(σ_{L1.id_libro < L2.id_libro}(ρ_{L1}(Libro) ⋈_{L1.id_categoria = L2.id_categoria} ρ_{L2}(Libro)))` |
| **CRT** | `{l1.titulo, l2.titulo \| Libro(l1) ∧ Libro(l2) ∧ l1.id_categoria = l2.id_categoria ∧ l1.id_libro < l2.id_libro}` |
| **CRD** | `{(tit1, tit2) \| ∃id1 ∃id2 ∃id_c (Libro(id1,tit1,_,_,_,id_c) ∧ Libro(id2,tit2,_,_,_,id_c) ∧ id1 < id2)}` |

**SQL:**
```sql
SELECT l1.titulo AS libro_1, l2.titulo AS libro_2, c.nombre AS categoria
FROM Libro l1
INNER JOIN Libro l2 ON l1.id_categoria = l2.id_categoria AND l1.id_libro < l2.id_libro
INNER JOIN Categoria c ON l1.id_categoria = c.id_categoria LIMIT 15;
```

---

### Consulta 10: Agregación - COUNT (γ)

**Descripción:** Contar cuántos libros tiene cada editorial.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `γ_{id_editorial, COUNT(id_libro)}(Libro)` |
| **CRT** | `{e.nombre, COUNT(l) \| Editorial(e) ∧ Libro(l) ∧ l.id_editorial = e.id_editorial}` |
| **CRD** | `{(nom_e, cnt) \| ∃id_e (Editorial(id_e, nom_e, _, _) ∧ cnt = COUNT{id_l \| Libro(id_l,_,_,_,id_e,_)})}` |

**SQL:**
```sql
SELECT e.nombre AS editorial, COUNT(l.id_libro) AS total_libros
FROM Editorial e LEFT JOIN Libro l ON e.id_editorial = l.id_editorial
GROUP BY e.nombre ORDER BY total_libros DESC;
```

---

### Consulta 11: Agregación - AVG con GROUP BY

**Descripción:** Calcular el promedio de días de retraso por cada estado de entrega.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `γ_{estado_entrega, AVG(dias_retraso)}(Detalle_prestamo)` |
| **CRT** | `{d.estado_entrega, AVG(d.dias_retraso) \| Detalle_prestamo(d), agrupado por d.estado_entrega}` |
| **CRD** | `{(est, prom) \| prom = AVG{re \| ∃id_d ∃id_p ∃id_l (Detalle_prestamo(id_d,id_p,id_l,re,est))}}` |

**SQL:**
```sql
SELECT estado_entrega, ROUND(AVG(dias_retraso), 2) AS promedio_retraso, COUNT(*) AS total_prestamos
FROM Detalle_prestamo GROUP BY estado_entrega;
```

---

### Consulta 12: Subconsulta Correlacionada (∃)

**Descripción:** Obtener los usuarios que tienen al menos un préstamo activo.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `σ_{∃p ∈ Prestamo (p.id_usuario = u.id_usuario ∧ p.estado='Activo')}(Usuario)` |
| **CRT** | `{u.nombre \| Usuario(u) ∧ ∃p(Prestamo(p) ∧ p.id_usuario = u.id_usuario ∧ p.estado = 'Activo')}` |
| **CRD** | `{(nom) \| ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u,nom,cor,tel,t_u,f_r) ∧ ∃id_p ∃f_s ∃f_d (Prestamo(id_p,id_u,f_s,f_d,'Activo')))}` |

**SQL:**
```sql
SELECT u.nombre, u.tipo_usuario FROM Usuario u
WHERE EXISTS (SELECT 1 FROM Prestamo p WHERE p.id_usuario = u.id_usuario AND p.estado = 'Activo');
```

---

### Consulta 13: Join Múltiple (⋈ ⋈ ⋈)

**Descripción:** Obtener el nombre del usuario, título del libro y estado del préstamo para todos los préstamos.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{u.nombre, l.titulo, p.estado}(Usuario ⋈ Prestamo ⋈ Detalle_prestamo ⋈ Libro)` |
| **CRT** | `{u.nombre, l.titulo, p.estado \| Usuario(u) ∧ Prestamo(p) ∧ Detalle_prestamo(d) ∧ Libro(l) ∧ p.id_usuario=u.id_usuario ∧ d.id_prestamo=p.id_prestamo ∧ d.id_libro=l.id_libro}` |
| **CRD** | `{(nom, tit, est) \| ∃id_u ∃id_p ∃id_l ∃id_d (Usuario(id_u,nom,_,_,_,_) ∧ Prestamo(id_p,id_u,_,_,est) ∧ Detalle_prestamo(id_d,id_p,id_l,_,_) ∧ Libro(id_l,tit,_,_,_,_))}` |

**SQL:**
```sql
SELECT u.nombre AS usuario, l.titulo AS libro, p.estado AS estado_prestamo
FROM Usuario u
INNER JOIN Prestamo p ON u.id_usuario = p.id_usuario
INNER JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo
INNER JOIN Libro l ON d.id_libro = l.id_libro ORDER BY u.nombre;
```

---

### Consulta 14: Left Join (⟕)

**Descripción:** Mostrar todos los autores y sus libros (incluyendo autores sin libros asignados).

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `Autor ⟕ (Libro_autor ⋈ Libro)` |
| **CRT** | `{a.nombre, l.titulo \| Autor(a) ∧ (∃la(Libro_autor(la) ∧ la.id_autor=a.id_autor ∧ ∃l(Libro(l) ∧ l.id_libro=la.id_libro)) ∨ ¬∃la(Libro_autor(la) ∧ la.id_autor=a.id_autor))}` |
| **CRD** | `{(nom_a, tit) \| ∃id_a (Autor(id_a,nom_a,_,_) ∧ (∃id_l(Libro_autor(id_l,id_a) ∧ Libro(id_l,tit,_,_,_,_)) ∨ tit=NULL))}` |

**SQL:**
```sql
SELECT a.nombre AS autor, COALESCE(l.titulo, 'Sin libros asignados') AS libro
FROM Autor a
LEFT JOIN Libro_autor la ON a.id_autor = la.id_autor
LEFT JOIN Libro l ON la.id_libro = l.id_libro ORDER BY a.nombre;
```

---

### Consulta 15: Agregación con HAVING (γ + σ)

**Descripción:** Obtener las categorías que tienen más de 2 libros.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `σ_{COUNT(id_libro) > 2}(γ_{id_categoria, COUNT(id_libro)}(Libro)) ⋈ Categoria` |
| **CRT** | `{c.nombre, cnt \| Categoria(c) ∧ cnt = COUNT{l \| Libro(l) ∧ l.id_categoria = c.id_categoria} ∧ cnt > 2}` |
| **CRD** | `{(nom_c, cnt) \| ∃id_c (Categoria(id_c,nom_c,_,_) ∧ cnt = COUNT{id_l \| Libro(id_l,_,_,_,_,id_c)} ∧ cnt > 2)}` |

**SQL:**
```sql
SELECT c.nombre AS categoria, COUNT(l.id_libro) AS total_libros
FROM Categoria c INNER JOIN Libro l ON c.id_categoria = l.id_categoria
GROUP BY c.nombre HAVING COUNT(l.id_libro) > 2 ORDER BY total_libros DESC;
```

---

### Consulta 16: Subconsulta con MAX

**Descripción:** Obtener el libro más reciente (con mayor año de publicación).

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `σ_{a_publicacion = MAX(π_{a_publicacion}(Libro))}(Libro)` |
| **CRT** | `{l \| Libro(l) ∧ ¬∃l2(Libro(l2) ∧ l2.a_publicacion > l.a_publicacion)}` |
| **CRD** | `{(id_l, tit, is, a_p, id_e, id_c) \| Libro(id_l,tit,is,a_p,id_e,id_c) ∧ ¬∃a_p2(∃id_l2 ∃tit2 ∃is2 ∃id_e2 ∃id_c2 (Libro(id_l2,tit2,is2,a_p2,id_e2,id_c2) ∧ a_p2 > a_p))}` |

**SQL:**
```sql
SELECT id_libro, titulo, a_publicacion FROM Libro
WHERE a_publicacion = (SELECT MAX(a_publicacion) FROM Libro);
```

---

### Consulta 17: División Relacional (÷)

**Descripción:** Encontrar usuarios que han tomado prestados TODOS los libros de la categoría 'Bases de Datos' (id_categoria=2).

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{id_usuario, id_libro}(Prestamo ⋈ Detalle_prestamo) ÷ π_{id_libro}(σ_{id_categoria=2}(Libro))` |
| **CRT** | `{u.nombre \| Usuario(u) ∧ ∀l(Libro(l) ∧ l.id_categoria=2 → ∃p∃d(Prestamo(p) ∧ p.id_usuario=u.id_usuario ∧ Detalle_prestamo(d) ∧ d.id_prestamo=p.id_prestamo ∧ d.id_libro=l.id_libro))}` |
| **CRD** | `{(nom) \| ∃id_u(Usuario(id_u,nom,_,_,_,_) ∧ ∀id_l(Libro(id_l,_,_,_,_,2) → ∃id_p ∃id_d(Prestamo(id_p,id_u,_,_,_) ∧ Detalle_prestamo(id_d,id_p,id_l,_,_))))}` |

**SQL:**
```sql
SELECT u.nombre FROM Usuario u
WHERE NOT EXISTS (
  SELECT l.id_libro FROM Libro l WHERE l.id_categoria = 2
  AND NOT EXISTS (
    SELECT 1 FROM Prestamo p
    INNER JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo
    WHERE p.id_usuario = u.id_usuario AND d.id_libro = l.id_libro
  )
);
```

---

### Consulta 18: Ordenamiento y Límite (τ)

**Descripción:** Obtener los 5 usuarios registrados más recientemente.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `τ_{fecha_registro DESC}(π_{nombre, fecha_registro}(Usuario)) [LIMIT 5]` |
| **CRT** | `{u.nombre, u.fecha_registro \| Usuario(u) ∧ \|{u2 \| Usuario(u2) ∧ u2.fecha_registro > u.fecha_registro}\| < 5}` |
| **CRD** | `{(nom, f_r) \| ∃id_u ∃cor ∃tel ∃t_u (Usuario(id_u,nom,cor,tel,t_u,f_r)) ordenado por f_r DESC, limitado a 5}` |

**SQL:**
```sql
SELECT nombre, tipo_usuario, fecha_registro FROM Usuario ORDER BY fecha_registro DESC LIMIT 5;
```

---

### Consulta 19: NOT EXISTS (¬∃)

**Descripción:** Obtener editoriales que NO tienen libros publicados después del 2012.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `Editorial − π_{id_editorial}(σ_{a_publicacion > 2012}(Libro)) ⋈ Editorial` |
| **CRT** | `{e.nombre \| Editorial(e) ∧ ¬∃l(Libro(l) ∧ l.id_editorial = e.id_editorial ∧ l.a_publicacion > 2012)}` |
| **CRD** | `{(nom_e) \| ∃id_e ∃pais ∃tel (Editorial(id_e,nom_e,pais,tel) ∧ ¬∃id_l ∃tit ∃is ∃a_p ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c) ∧ a_p > 2012))}` |

**SQL:**
```sql
SELECT e.nombre AS editorial, e.pais FROM Editorial e
WHERE NOT EXISTS (SELECT 1 FROM Libro l WHERE l.id_editorial = e.id_editorial AND l.a_publicacion > 2012);
```

---

### Consulta 20: Consulta Compleja - Resumen General

**Descripción:** Obtener un resumen por usuario: nombre, total de préstamos, total de libros prestados y máximo de días de retraso.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `γ_{id_usuario, COUNT(id_prestamo), SUM(libros), MAX(dias_retraso)}(Usuario ⋈ Prestamo ⋈ Detalle_prestamo)` |
| **CRT** | `{u.nombre, cnt_p, cnt_l, max_r \| Usuario(u) ∧ cnt_p = COUNT{p \| Prestamo(p) ∧ p.id_usuario=u.id_usuario} ∧ cnt_l = COUNT{d \| ...} ∧ max_r = MAX{d.dias_retraso \| ...}}` |
| **CRD** | `{(nom, cnt_p, cnt_l, max_r) \| ∃id_u(Usuario(id_u,nom,_,_,_,_) ∧ cnt_p=COUNT{id_p\|Prestamo(id_p,id_u,_,_,_)} ∧ cnt_l=COUNT{id_d\|...} ∧ max_r=MAX{re\|...})}` |

**SQL:**
```sql
SELECT u.nombre, COUNT(DISTINCT p.id_prestamo) AS total_prestamos,
       COUNT(d.id_detalle) AS total_libros_prestados,
       COALESCE(MAX(d.dias_retraso), 0) AS max_dias_retraso
FROM Usuario u
LEFT JOIN Prestamo p ON u.id_usuario = p.id_usuario
LEFT JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo
GROUP BY u.id_usuario, u.nombre ORDER BY total_prestamos DESC;
```

---

## Estructura del Proyecto

```
practica_final/
├── database/
│   └── init.sql              # DDL + Datos de población (8 tablas, 100+ registros)
├── src/
│   └── main.js               # Aplicación CLI con menú interactivo (20 consultas)
├── docker-compose.yml        # Orquestación de servicios (PostgreSQL + App)
├── Dockerfile                # Imagen de la aplicación Node.js
├── package.json              # Dependencias del proyecto
└── README.md                 # Documentación completa
```

---

##  Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| Node.js 18 | Runtime de la aplicación |
| PostgreSQL 15 | Motor de base de datos relacional |
| Docker & Docker Compose | Containerización y despliegue |
| pg (node-postgres) | Driver de conexión a PostgreSQL |

---

##  Notas

- La aplicación incluye reintentos automáticos de conexión (hasta 10 intentos) para esperar a que PostgreSQL termine de inicializarse dentro de Docker.
- Cada consulta muestra en pantalla su expresión formal antes de ejecutar el SQL, cumpliendo con el requisito de documentar álgebra y cálculo relacional.
- El proyecto está completamente dockerizado: un solo comando (`docker compose up --build`) levanta toda la infraestructura.

---

##  Autores

- Vanya Castillo Castillo
- Abel Pineda Godinez

**Materia:** Bases de Datos  

