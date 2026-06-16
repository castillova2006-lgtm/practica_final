# 📚 Sistema de Biblioteca - Práctica Final de Bases de Datos

## Descripción del Proyecto

Aplicación de consola interactiva (CLI) desarrollada en **Node.js** que se conecta a una base de datos **PostgreSQL** completamente dockerizada. El sistema permite ejecutar y visualizar consultas SQL junto con sus expresiones equivalentes en **Álgebra Relacional**, **Cálculo Relacional de Tuplas (CRT)** y **Cálculo Relacional de Dominios (CRD)**.

El proyecto modela un **sistema de gestión de biblioteca** con las siguientes entidades:
- Editorial, Categoría, Autor, Libro, Libro_Autor, Usuario, Préstamo, Detalle_Préstamo

---

## 🐳 Despliegue con Docker (Requisito Opción B)

### Prerrequisitos
- [Docker](https://www.docker.com/products/docker-desktop/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

### Instrucciones de ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/castillova2006-lgtm/practica_final.git

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

## 🖥️ Menú Interactivo (CLI)

Al ejecutar la aplicación, se presenta un menú que permite seleccionar cualquiera de las consultas. Para cada una se muestra:

1. **Título y descripción** de la consulta
2. **Expresión en Álgebra Relacional**
3. **Expresión en Cálculo Relacional de Tuplas (CRT)**
4. **Expresión en Cálculo Relacional de Dominios (CRD)**
5. **Sentencia SQL equivalente**
6. **Resultados obtenidos** directamente desde PostgreSQL

---

## 📐 Esquema de la Base de Datos

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

## 📝 Consultas con Expresiones en Álgebra y Cálculo Relacional

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

### Consulta 2: Proyección Combinada con Selección (π(σ))

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
| **Álgebra Relacional** | `π_{nombre}(σ_{tipo_usuario='Estudiante'}(Usuario)) ∪ π_{nombre}(σ_{tipo_usuario='Profesor'}(Usuario))` |
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

**Descripción:** Encontrar los IDs de los libros prestados en 'Buen Estado' que además registran retrasos.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{id_libro}(σ_{estado_entrega='Buen Estado'}(Detalle_prestamo)) ∩ π_{id_libro}(σ_{dias_retraso > 0}(Detalle_prestamo))` |
| **CRT** | `{d.id_libro \| Detalle_prestamo(d) ∧ d.estado_entrega = 'Buen Estado' ∧ ∃d2(Detalle_prestamo(d2) ∧ d2.id_libro = d.id_libro ∧ d2.dias_retraso > 0)}` |
| **CRD** | `{(id_l) \| ∃id_d ∃id_p ∃re1 ∃est (Detalle_prestamo(id_d, id_p, id_l, re1, est) ∧ est = 'Buen Estado') ∧ ∃id_d2 ∃id_p2 ∃re2 ∃est2 (Detalle_prestamo(id_d2, id_p2, id_l, re2, est2) ∧ re2 > 0)}` |

**SQL:**
```sql
SELECT id_libro FROM Detalle_prestamo WHERE estado_entrega = 'Buen Estado'
INTERSECT
SELECT id_libro FROM Detalle_prestamo WHERE dias_retraso > 0;
```

---

### Consulta 5: Diferencia de Conjuntos (−)

**Descripción:** Obtener los IDs de todos los libros registrados que nunca han sido solicitados en un préstamo.

| Expresión | Fórmula |
|-----------|---------|
| **Álgebra Relacional** | `π_{id_libro}(Libro) − π_{id_libro}(Detalle_prestamo)` |
| **CRT** | `{l.id_libro \| Libro(l) ∧ ¬(∃d(Detalle_prestamo(d) ∧ d.id_libro = l.id_libro))}` |
| **CRD** | `{(id_l) \| ∃tit ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l, tit, is, a_p, id_e, id_c)) ∧ ¬(∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d, id_p, id_l, re, est)))}` |

**SQL:**
```sql
SELECT id_libro, titulo FROM Libro WHERE id_libro NOT IN (SELECT id_libro FROM Detalle_prestamo);
```

---

## 🏗️ Estructura del Proyecto

```
practica_final/
├── database/
│   └── init.sql              # DDL + Datos de población
├── src/
│   └── main.js               # Aplicación CLI con menú interactivo
├── docker-compose.yml        # Orquestación de servicios
├── Dockerfile                # Imagen de la aplicación Node.js
├── package.json              # Dependencias del proyecto
└── README.md                 # Este archivo
```

---

## ⚙️ Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| Node.js 18 | Runtime de la aplicación |
| PostgreSQL 15 | Motor de base de datos relacional |
| Docker & Docker Compose | Containerización y despliegue |
| pg (node-postgres) | Driver de conexión a PostgreSQL |

---

## 👥 Autores

- Vanya Castillo Castilo
- Abel Pineda Godinez

**Materia:** Bases de Datos  
**Institución:** ESCOM - IPN
