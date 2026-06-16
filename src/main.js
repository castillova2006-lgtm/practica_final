import pg from 'pg';
import readline from 'readline';

const client = new pg.Client({
  host: 'localhost', 
  port: 5432,
  user: 'escom_user',
  password: 'escom_password',
  database: 'biblioteca',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const consultas = {
  1: {
    titulo: "Consulta 1: Selección Simple (σ)",
    descripcion: "Seleccionar los libros publicados en el año 2010.",
    algebra: "σ_{a_publicacion = 2010}(Libro)",
    crt: "{t | Libro(t) ∧ t.a_publicacion = 2010}",
    crd: "{(id_l, tit, is, a_p, id_e, id_c) | Libro(id_l, tit, is, a_p, id_e, id_c) ∧ a_p = 2010}",
    sql: "SELECT id_libro, titulo, isbn, a_publicacion FROM Libro WHERE a_publicacion = 2010;"
  },

  2: {
    titulo: "Consulta 2: Proyección Combinada con Selección (π + σ)",
    descripcion: "Obtener el título y el ISBN de los libros de la editorial con ID 7.",
    algebra: "π_{titulo, isbn}(σ_{id_editorial = 7}(Libro))",
    crt: "{t.titulo, t.isbn | Libro(t) ∧ t.id_editorial = 7}",
    crd: "{(tit, is) | ∃id_l ∃a_p ∃id_e ∃id_c (Libro(id_l, tit, is, a_p, id_e, id_c) ∧ id_e = 7)}",
    sql: "SELECT titulo, isbn FROM Libro WHERE id_editorial = 7;"
  },

  3: {
    titulo: "Consulta 3: Unión de Resultados (∪)",
    descripcion: "Obtener los nombres de todos los usuarios que son 'Estudiante' o 'Profesor'.",
    algebra: "π_{nombre}(σ_{tipo_usuario='Estudiante'}(Usuario)) ∪ π_{nombre}(σ_{tipo_usuario='Profesor'}(Usuario))",
    crt: "{u.nombre | Usuario(u) ∧ (u.tipo_usuario = 'Estudiante' ∨ u.tipo_usuario = 'Profesor')}",
    crd: "{(nom) | ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u, nom, cor, tel, t_u, f_r) ∧ (t_u = 'Estudiante' ∨ t_u = 'Profesor'))}",
    sql: "SELECT nombre, tipo_usuario FROM Usuario WHERE tipo_usuario = 'Estudiante' UNION SELECT nombre, tipo_usuario FROM Usuario WHERE tipo_usuario = 'Profesor';"
  },

  4: {
    titulo: "Consulta 4: Intersección de Resultados (∩)",
    descripcion: "Encontrar los IDs de libros prestados en 'Buen Estado' que también tienen días de retraso.",
    algebra: "π_{id_libro}(σ_{estado_entrega='Buen Estado'}(Detalle_prestamo)) ∩ π_{id_libro}(σ_{dias_retraso > 0}(Detalle_prestamo))",
    crt: "{d.id_libro | Detalle_prestamo(d) ∧ d.estado_entrega='Buen Estado' ∧ ∃d2(Detalle_prestamo(d2) ∧ d2.id_libro=d.id_libro ∧ d2.dias_retraso>0)}",
    crd: "{(id_l) | ∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d,id_p,id_l,re,est) ∧ est='Buen Estado') ∧ ∃id_d2 ∃id_p2 ∃re2 ∃est2 (Detalle_prestamo(id_d2,id_p2,id_l,re2,est2) ∧ re2>0)}",
    sql: "SELECT id_libro FROM Detalle_prestamo WHERE estado_entrega = 'Buen Estado' INTERSECT SELECT id_libro FROM Detalle_prestamo WHERE dias_retraso > 0;"
  },

  5: {
    titulo: "Consulta 5: Diferencia de Conjuntos (−)",
    descripcion: "Obtener los libros registrados que nunca han sido prestados.",
    algebra: "π_{id_libro}(Libro) − π_{id_libro}(Detalle_prestamo)",
    crt: "{l.id_libro | Libro(l) ∧ ¬(∃d(Detalle_prestamo(d) ∧ d.id_libro = l.id_libro))}",
    crd: "{(id_l) | ∃tit ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c)) ∧ ¬(∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d,id_p,id_l,re,est)))}",
    sql: "SELECT id_libro, titulo FROM Libro WHERE id_libro NOT IN (SELECT id_libro FROM Detalle_prestamo);"
  },

  6: {
    titulo: "Consulta 6: Producto Cartesiano (×)",
    descripcion: "Mostrar todas las combinaciones posibles entre editoriales y categorías (limitado a 15 resultados).",
    algebra: "Editorial × Categoria",
    crt: "{e, c | Editorial(e) ∧ Categoria(c)}",
    crd: "{(id_e, nom_e, id_c, nom_c) | Editorial(id_e, nom_e, _, _) ∧ Categoria(id_c, nom_c, _, _)}",
    sql: "SELECT e.nombre AS editorial, c.nombre AS categoria FROM Editorial e CROSS JOIN Categoria c LIMIT 15;"
  },

  7: {
    titulo: "Consulta 7: Join Natural (⋈)",
    descripcion: "Obtener el título de cada libro junto con el nombre de su editorial.",
    algebra: "π_{titulo, nombre}(Libro ⋈ Editorial)",
    crt: "{l.titulo, e.nombre | Libro(l) ∧ Editorial(e) ∧ l.id_editorial = e.id_editorial}",
    crd: "{(tit, nom_e) | ∃id_l ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c) ∧ ∃pais ∃tel (Editorial(id_e,nom_e,pais,tel)))}",
    sql: "SELECT l.titulo, e.nombre AS editorial FROM Libro l INNER JOIN Editorial e ON l.id_editorial = e.id_editorial;"
  },

  8: {
    titulo: "Consulta 8: Theta Join (⋈θ)",
    descripcion: "Obtener libros publicados después del año de registro de cada usuario (limitado a 10).",
    algebra: "σ_{a_publicacion > EXTRACT(YEAR FROM fecha_registro)}(Libro × Usuario)",
    crt: "{l.titulo, u.nombre | Libro(l) ∧ Usuario(u) ∧ l.a_publicacion > YEAR(u.fecha_registro)}",
    crd: "{(tit, nom) | ∃id_l ∃a_p ∃id_e ∃id_c (Libro(id_l,tit,_,a_p,id_e,id_c)) ∧ ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u,nom,cor,tel,t_u,f_r) ∧ a_p > YEAR(f_r))}",
    sql: "SELECT l.titulo, u.nombre, l.a_publicacion, u.fecha_registro FROM Libro l, Usuario u WHERE l.a_publicacion > EXTRACT(YEAR FROM u.fecha_registro) LIMIT 10;"
  },

  9: {
    titulo: "Consulta 9: Renombramiento (ρ) + Self Join",
    descripcion: "Encontrar pares de libros que pertenecen a la misma categoría.",
    algebra: "π_{L1.titulo, L2.titulo}(σ_{L1.id_libro < L2.id_libro}(ρ_{L1}(Libro) ⋈_{L1.id_categoria = L2.id_categoria} ρ_{L2}(Libro)))",
    crt: "{l1.titulo, l2.titulo | Libro(l1) ∧ Libro(l2) ∧ l1.id_categoria = l2.id_categoria ∧ l1.id_libro < l2.id_libro}",
    crd: "{(tit1, tit2) | ∃id1 ∃id2 ∃id_c (Libro(id1,tit1,_,_,_,id_c) ∧ Libro(id2,tit2,_,_,_,id_c) ∧ id1 < id2)}",
    sql: "SELECT l1.titulo AS libro_1, l2.titulo AS libro_2, c.nombre AS categoria FROM Libro l1 INNER JOIN Libro l2 ON l1.id_categoria = l2.id_categoria AND l1.id_libro < l2.id_libro INNER JOIN Categoria c ON l1.id_categoria = c.id_categoria LIMIT 15;"
  },

  10: {
    titulo: "Consulta 10: Agregación - COUNT (γ)",
    descripcion: "Contar cuántos libros tiene cada editorial.",
    algebra: "γ_{id_editorial, COUNT(id_libro)}(Libro)",
    crt: "{e.nombre, COUNT(l) | Editorial(e) ∧ Libro(l) ∧ l.id_editorial = e.id_editorial}",
    crd: "{(nom_e, cnt) | ∃id_e (Editorial(id_e, nom_e, _, _) ∧ cnt = COUNT{id_l | Libro(id_l,_,_,_,id_e,_)})}",
    sql: "SELECT e.nombre AS editorial, COUNT(l.id_libro) AS total_libros FROM Editorial e LEFT JOIN Libro l ON e.id_editorial = l.id_editorial GROUP BY e.nombre ORDER BY total_libros DESC;"
  },

  11: {
    titulo: "Consulta 11: Agregación - AVG con GROUP BY",
    descripcion: "Calcular el promedio de días de retraso por cada estado de entrega.",
    algebra: "γ_{estado_entrega, AVG(dias_retraso)}(Detalle_prestamo)",
    crt: "{d.estado_entrega, AVG(d.dias_retraso) | Detalle_prestamo(d), agrupado por d.estado_entrega}",
    crd: "{(est, prom) | prom = AVG{re | ∃id_d ∃id_p ∃id_l (Detalle_prestamo(id_d,id_p,id_l,re,est))}}",
    sql: "SELECT estado_entrega, ROUND(AVG(dias_retraso), 2) AS promedio_retraso, COUNT(*) AS total_prestamos FROM Detalle_prestamo GROUP BY estado_entrega;"
  },

  12: {
    titulo: "Consulta 12: Subconsulta Correlacionada (∃)",
    descripcion: "Obtener los usuarios que tienen al menos un préstamo activo.",
    algebra: "σ_{∃p ∈ Prestamo (p.id_usuario = u.id_usuario ∧ p.estado='Activo')}(Usuario)",
    crt: "{u.nombre | Usuario(u) ∧ ∃p(Prestamo(p) ∧ p.id_usuario = u.id_usuario ∧ p.estado = 'Activo')}",
    crd: "{(nom) | ∃id_u ∃cor ∃tel ∃t_u ∃f_r (Usuario(id_u,nom,cor,tel,t_u,f_r) ∧ ∃id_p ∃f_s ∃f_d (Prestamo(id_p,id_u,f_s,f_d,'Activo')))}",
    sql: "SELECT u.nombre, u.tipo_usuario FROM Usuario u WHERE EXISTS (SELECT 1 FROM Prestamo p WHERE p.id_usuario = u.id_usuario AND p.estado = 'Activo');"
  },

  13: {
    titulo: "Consulta 13: Join Múltiple (⋈ ⋈ ⋈)",
    descripcion: "Obtener el nombre del usuario, título del libro y estado del préstamo para todos los préstamos.",
    algebra: "π_{u.nombre, l.titulo, p.estado}(Usuario ⋈ Prestamo ⋈ Detalle_prestamo ⋈ Libro)",
    crt: "{u.nombre, l.titulo, p.estado | Usuario(u) ∧ Prestamo(p) ∧ Detalle_prestamo(d) ∧ Libro(l) ∧ p.id_usuario=u.id_usuario ∧ d.id_prestamo=p.id_prestamo ∧ d.id_libro=l.id_libro}",
    crd: "{(nom, tit, est) | ∃id_u ∃id_p ∃id_l ∃id_d (Usuario(id_u,nom,_,_,_,_) ∧ Prestamo(id_p,id_u,_,_,est) ∧ Detalle_prestamo(id_d,id_p,id_l,_,_) ∧ Libro(id_l,tit,_,_,_,_))}",
    sql: "SELECT u.nombre AS usuario, l.titulo AS libro, p.estado AS estado_prestamo FROM Usuario u INNER JOIN Prestamo p ON u.id_usuario = p.id_usuario INNER JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo INNER JOIN Libro l ON d.id_libro = l.id_libro ORDER BY u.nombre;"
  },

  14: {
    titulo: "Consulta 14: Left Join (⟕)",
    descripcion: "Mostrar todos los autores y sus libros (incluyendo autores sin libros asignados).",
    algebra: "Autor ⟕ (Libro_autor ⋈ Libro)",
    crt: "{a.nombre, l.titulo | Autor(a) ∧ (∃la(Libro_autor(la) ∧ la.id_autor=a.id_autor ∧ ∃l(Libro(l) ∧ l.id_libro=la.id_libro)) ∨ ¬∃la(Libro_autor(la) ∧ la.id_autor=a.id_autor))}",
    crd: "{(nom_a, tit) | ∃id_a (Autor(id_a,nom_a,_,_) ∧ (∃id_l(Libro_autor(id_l,id_a) ∧ Libro(id_l,tit,_,_,_,_)) ∨ tit=NULL))}",
    sql: "SELECT a.nombre AS autor, COALESCE(l.titulo, 'Sin libros asignados') AS libro FROM Autor a LEFT JOIN Libro_autor la ON a.id_autor = la.id_autor LEFT JOIN Libro l ON la.id_libro = l.id_libro ORDER BY a.nombre;"
  },

  15: {
    titulo: "Consulta 15: Agregación con HAVING (γ + σ)",
    descripcion: "Obtener las categorías que tienen más de 2 libros.",
    algebra: "σ_{COUNT(id_libro) > 2}(γ_{id_categoria, COUNT(id_libro)}(Libro)) ⋈ Categoria",
    crt: "{c.nombre, cnt | Categoria(c) ∧ cnt = COUNT{l | Libro(l) ∧ l.id_categoria = c.id_categoria} ∧ cnt > 2}",
    crd: "{(nom_c, cnt) | ∃id_c (Categoria(id_c,nom_c,_,_) ∧ cnt = COUNT{id_l | Libro(id_l,_,_,_,_,id_c)} ∧ cnt > 2)}",
    sql: "SELECT c.nombre AS categoria, COUNT(l.id_libro) AS total_libros FROM Categoria c INNER JOIN Libro l ON c.id_categoria = l.id_categoria GROUP BY c.nombre HAVING COUNT(l.id_libro) > 2 ORDER BY total_libros DESC;"
  },

  16: {
    titulo: "Consulta 16: Subconsulta con MAX",
    descripcion: "Obtener el libro más reciente (con mayor año de publicación).",
    algebra: "σ_{a_publicacion = MAX(π_{a_publicacion}(Libro))}(Libro)",
    crt: "{l | Libro(l) ∧ ¬∃l2(Libro(l2) ∧ l2.a_publicacion > l.a_publicacion)}",
    crd: "{(id_l, tit, is, a_p, id_e, id_c) | Libro(id_l,tit,is,a_p,id_e,id_c) ∧ ¬∃a_p2(∃id_l2 ∃tit2 ∃is2 ∃id_e2 ∃id_c2 (Libro(id_l2,tit2,is2,a_p2,id_e2,id_c2) ∧ a_p2 > a_p))}",
    sql: "SELECT id_libro, titulo, a_publicacion FROM Libro WHERE a_publicacion = (SELECT MAX(a_publicacion) FROM Libro);"
  },

  17: {
    titulo: "Consulta 17: División Relacional (÷)",
    descripcion: "Encontrar usuarios que han tomado prestados TODOS los libros de la categoría 'Bases de Datos' (id_categoria=2).",
    algebra: "π_{id_usuario, id_libro}(Prestamo ⋈ Detalle_prestamo) ÷ π_{id_libro}(σ_{id_categoria=2}(Libro))",
    crt: "{u.nombre | Usuario(u) ∧ ∀l(Libro(l) ∧ l.id_categoria=2 → ∃p∃d(Prestamo(p) ∧ p.id_usuario=u.id_usuario ∧ Detalle_prestamo(d) ∧ d.id_prestamo=p.id_prestamo ∧ d.id_libro=l.id_libro))}",
    crd: "{(nom) | ∃id_u(Usuario(id_u,nom,_,_,_,_) ∧ ∀id_l(Libro(id_l,_,_,_,_,2) → ∃id_p ∃id_d(Prestamo(id_p,id_u,_,_,_) ∧ Detalle_prestamo(id_d,id_p,id_l,_,_))))}",
    sql: "SELECT u.nombre FROM Usuario u WHERE NOT EXISTS ( SELECT l.id_libro FROM Libro l WHERE l.id_categoria = 2 AND NOT EXISTS ( SELECT 1 FROM Prestamo p INNER JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo WHERE p.id_usuario = u.id_usuario AND d.id_libro = l.id_libro ) );"
  },

  18: {
    titulo: "Consulta 18: Ordenamiento y Límite (τ)",
    descripcion: "Obtener los 5 usuarios registrados más recientemente.",
    algebra: "τ_{fecha_registro DESC}(π_{nombre, fecha_registro}(Usuario)) [LIMIT 5]",
    crt: "{u.nombre, u.fecha_registro | Usuario(u) ∧ |{u2 | Usuario(u2) ∧ u2.fecha_registro > u.fecha_registro}| < 5}",
    crd: "{(nom, f_r) | ∃id_u ∃cor ∃tel ∃t_u (Usuario(id_u,nom,cor,tel,t_u,f_r)) ordenado por f_r DESC, limitado a 5}",
    sql: "SELECT nombre, tipo_usuario, fecha_registro FROM Usuario ORDER BY fecha_registro DESC LIMIT 5;"
  },

  19: {
    titulo: "Consulta 19: Consulta con NOT EXISTS (¬∃)",
    descripcion: "Obtener editoriales que NO tienen libros publicados después del 2012.",
    algebra: "Editorial − π_{id_editorial}(σ_{a_publicacion > 2012}(Libro)) ⋈ Editorial",
    crt: "{e.nombre | Editorial(e) ∧ ¬∃l(Libro(l) ∧ l.id_editorial = e.id_editorial ∧ l.a_publicacion > 2012)}",
    crd: "{(nom_e) | ∃id_e ∃pais ∃tel (Editorial(id_e,nom_e,pais,tel) ∧ ¬∃id_l ∃tit ∃is ∃a_p ∃id_c (Libro(id_l,tit,is,a_p,id_e,id_c) ∧ a_p > 2012))}",
    sql: "SELECT e.nombre AS editorial, e.pais FROM Editorial e WHERE NOT EXISTS (SELECT 1 FROM Libro l WHERE l.id_editorial = e.id_editorial AND l.a_publicacion > 2012);"
  },

  20: {
    titulo: "Consulta 20: Consulta Compleja - Resumen General",
    descripcion: "Obtener un resumen por usuario: nombre, total de préstamos, total de libros prestados y máximo de días de retraso.",
    algebra: "γ_{id_usuario, COUNT(id_prestamo), SUM(libros), MAX(dias_retraso)}(Usuario ⋈ Prestamo ⋈ Detalle_prestamo)",
    crt: "{u.nombre, cnt_p, cnt_l, max_r | Usuario(u) ∧ cnt_p = COUNT{p | Prestamo(p) ∧ p.id_usuario=u.id_usuario} ∧ cnt_l = COUNT{d | ∃p(Prestamo(p) ∧ p.id_usuario=u.id_usuario ∧ Detalle_prestamo(d) ∧ d.id_prestamo=p.id_prestamo)} ∧ max_r = MAX{d.dias_retraso | ∃p(...)}}",
    crd: "{(nom, cnt_p, cnt_l, max_r) | ∃id_u(Usuario(id_u,nom,_,_,_,_) ∧ cnt_p=COUNT{id_p|Prestamo(id_p,id_u,_,_,_)} ∧ cnt_l=COUNT{id_d|∃id_p(Prestamo(id_p,id_u,_,_,_) ∧ Detalle_prestamo(id_d,id_p,_,_,_))} ∧ max_r=MAX{re|∃id_d∃id_p(Prestamo(id_p,id_u,_,_,_)∧Detalle_prestamo(id_d,id_p,_,re,_))})}",
    sql: "SELECT u.nombre, COUNT(DISTINCT p.id_prestamo) AS total_prestamos, COUNT(d.id_detalle) AS total_libros_prestados, COALESCE(MAX(d.dias_retraso), 0) AS max_dias_retraso FROM Usuario u LEFT JOIN Prestamo p ON u.id_usuario = p.id_usuario LEFT JOIN Detalle_prestamo d ON p.id_prestamo = d.id_prestamo GROUP BY u.id_usuario, u.nombre ORDER BY total_prestamos DESC;"
  }
};

function mostrarMenu() {
  console.clear();
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║       MENÚ INTERACTIVO - PRÁCTICA FINAL DE BASES DE DATOS   ║");
  console.log("╠═══════════════════════════════════════════════════════════════╣");
  console.log("║  1.  Selección Simple (σ)                                    ║");
  console.log("║  2.  Proyección + Selección (π + σ)                          ║");
  console.log("║  3.  Unión (∪)                                               ║");
  console.log("║  4.  Intersección (∩)                                        ║");
  console.log("║  5.  Diferencia de Conjuntos (−)                             ║");
  console.log("║  6.  Producto Cartesiano (×)                                 ║");
  console.log("║  7.  Join Natural (⋈)                                        ║");
  console.log("║  8.  Theta Join (⋈θ)                                         ║");
  console.log("║  9.  Renombramiento / Self Join (ρ)                          ║");
  console.log("║ 10.  Agregación COUNT (γ)                                    ║");
  console.log("║ 11.  Agregación AVG + GROUP BY                               ║");
  console.log("║ 12.  Subconsulta Correlacionada (∃)                          ║");
  console.log("║ 13.  Join Múltiple (⋈ ⋈ ⋈)                                  ║");
  console.log("║ 14.  Left Join (⟕)                                           ║");
  console.log("║ 15.  Agregación con HAVING (γ + σ)                           ║");
  console.log("║ 16.  Subconsulta con MAX                                     ║");
  console.log("║ 17.  División Relacional (÷)                                 ║");
  console.log("║ 18.  Ordenamiento y Límite (τ)                               ║");
  console.log("║ 19.  NOT EXISTS (¬∃)                                         ║");
  console.log("║ 20.  Consulta Compleja - Resumen General                     ║");
  console.log("║                                                              ║");
  console.log("║  0.  Salir del programa                                      ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");
  
  rl.question("\n  Seleccione una opción (0-20): ", async (opcion) => {
    if (opcion === '0') {
      console.log("\n  ✅ Saliendo del programa... ¡Hasta pronto!\n");
      await client.end();
      rl.close();
      process.exit(0);
    }

    const consulta = consultas[parseInt(opcion)];
    if (consulta) {
      await ejecutarYMostrar(consulta);
    } else {
      console.log("\n    Opción no válida. Presione ENTER para continuar...");
      rl.once('line', mostrarMenu);
    }
  });
}

async function ejecutarYMostrar(c) {
  console.clear();
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  ${c.titulo}`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`\n    Descripción:\n     ${c.descripcion}\n`);
  console.log(`     Álgebra Relacional:\n     ${c.algebra}\n`);
  console.log(`   Cálculo Relacional de Tuplas (CRT):\n     ${c.crt}\n`);
  console.log(`   Cálculo Relacional de Dominios (CRD):\n     ${c.crd}\n`);
  console.log(`   SQL Ejecutado:\n     ${c.sql}\n`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log("   RESULTADOS OBTENIDOS DESDE POSTGRESQL:");
  console.log("───────────────────────────────────────────────────────────────");

  try {
    const res = await client.query(c.sql);
    if (res.rows.length === 0) {
      console.log("  [No se encontraron registros que cumplan esta condición]");
    } else {
      console.table(res.rows);
    }
  } catch (err) {
    console.error("   Error al ejecutar la consulta:", err.message);
  }

  console.log("\n  Presione ENTER para regresar al menú principal...");
  rl.once('line', mostrarMenu);
}

async function iniciar() {
  const maxReintentos = 10;
  let intento = 1;

  while (intento <= maxReintentos) {
    try {
      console.log(`   Intentando conectar a PostgreSQL (Intento ${intento}/${maxReintentos})...`);
      await client.connect();
      console.log("   Conexión exitosa a la base de datos.");
      mostrarMenu();
      return; 
    } catch (err) {
      console.log("    La base de datos aún no acepta conexiones. Esperando 3s...");
      intento++;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.error("\n   Error: No se pudo conectar a la base de datos después de múltiples intentos.");
  process.exit(1);
}

iniciar();
