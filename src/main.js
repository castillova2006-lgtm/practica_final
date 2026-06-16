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
    titulo: "Consulta 2: Proyección Combinada con Selección (π(σ))",
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
    descripcion: "Encontrar los IDs de los libros prestados en 'Buen Estado' que además registran los retrasos.",
    algebra: "π_{id_libro}(σ_{estado_entrega='Buen Estado'}(Detalle_prestamo)) ∩ π_{id_libro}(σ_{dias_retraso > 0}(Detalle_prestamo))",
    crt: "{d.id_libro | Detalle_prestamo(d) ∧ d.estado_entrega = 'Buen Estado' ∧ ∃d2 (Detalle_prestamo(d2) ∧ d2.id_libro = d.id_libro ∧ d2.dias_retraso > 0)}",
    crd: "{(id_l) | ∃id_d ∃id_p ∃re1 ∃est (Detalle_prestamo(id_d, id_p, id_l, re1, est) ∧ est = 'Buen Estado') ∧ ∃id_d2 ∃id_p2 ∃re2 ∃est2 (Detalle_prestamo(id_d2, id_p2, id_l, re2, est2) ∧ re2 > 0)}",
    sql: "SELECT id_libro FROM Detalle_prestamo WHERE estado_entrega = 'Buen Estado' INTERSECT SELECT id_libro FROM Detalle_prestamo WHERE dias_retraso > 0;"
  },

  5: {
    titulo: "Consulta 5: Diferencia de Conjuntos (-)",
    descripcion: "Obtener los IDs de todos los libros registrados que nunca han sido solicitados en un préstamo.",
    algebra: "π_{id_libro}(Libro) - π_{id_libro}(Detalle_prestamo)",
    crt: "{l.id_libro | Libro(l) ∧ ¬(∃d (Detalle_prestamo(d) ∧ d.id_libro = l.id_libro))}",
    crd: "{(id_l) | ∃tit ∃is ∃a_p ∃id_e ∃id_c (Libro(id_l, tit, is, a_p, id_e, id_c)) ∧ ¬(∃id_d ∃id_p ∃re ∃est (Detalle_prestamo(id_d, id_p, id_l, re, est)))}",
    sql: "SELECT id_libro, titulo FROM Libro WHERE id_libro NOT IN (SELECT id_libro FROM Detalle_prestamo);"
  }
};

function mostrarMenu() {
  console.clear();
  console.log("    MENÚ INTERACTIVO    ");
  console.log("------------------------");
  console.log("1. Ejecutar Consulta: Selección");
  console.log("2. Ejecutar Consulta: Proyección");
  console.log("3. Ejecutar Consulta: Unión");
  console.log("4. Ejecutar Consulta: Intersección");
  console.log("5. Ejecutar Consulta: Diferencia)");
  console.log("0. Salir del programa");
  console.log("=======================================================");
  
  rl.question("Seleccione una opción (0-5)... ", async (opcion) => {
    if (opcion === '0') {
      console.log("\nSaliendo del programa...Éxito :D\n");
      await client.end();
      rl.close();
      process.exit(0);
    }

    const consulta = consultas[opcion];
    if (consulta) {
      await ejecutarYMostrar(consulta);
    } else {
      console.log("\n Opción no válida. Presione ENTER para continuar...");
      rl.once('line', mostrarMenu);
    }
  });
}

async function ejecutarYMostrar(c) {
  console.clear();
  console.log(`${c.titulo}`);
  console.log(`-----------`);
  console.log(` Descripción:\n   ${c.descripcion}\n`);
  console.log(`Álgebra Relacional:\n   ${c.algebra}\n`);
  console.log(`Cálculo Relacional de Tuplas:\n   ${c.crt}\n`);
  console.log(`Cálculo Relacional de Dominios:\n   ${c.crd}\n`);
  console.log(`Equivalente en SQL Ejecutado:\n   ${c.sql}\n`);
  console.log(`-------------------------------------------------------`);
  console.log(`RESULTADOS OBTENIDOS DESDE POSTGRESQL (DOCKER):`);
  console.log(`-------------------------------------------------------`);

  try {
    const res = await client.query(c.sql);
    if (res.rows.length === 0) {
      console.log("   [No se encontraron registros que cumplan esta condición]");
    } else {
      console.table(res.rows);
    }
  } catch (err) {
    console.error("Error al ejecutar la consulta en la BD:", err.message);
  }

  console.log(`\nPresione ENTER para regresar al menú principal...`);
  rl.once('line', mostrarMenu);
}

async function iniciar() {
  const maxReintentos = 10; //Pusimos estos intentos por si el windows llega a estar lento
  let intento = 1;

  while (intento <= maxReintentos) {
    try {
      console.log(`... Intentando conectar a la base de datos (Intento ${intento}/${maxReintentos})...`);
      await client.connect();
      mostrarMenu();
      return; 
    } catch (err) {
      console.log(`⚠️ La base de datos aún no acepta conexiones. Esperando...`);
      intento++;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.error("\nError: Red inaccesible.");
  process.exit(1);
}

iniciar();