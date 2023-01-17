const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "fagust",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true,
});

const obtenerJoyas = async (x) => {
  const { limits = 10, order_by = "id_ASC", page = 1 } = x;
  const [campo, direccion] = order_by.split("_");
  const offset = (page - 1) * limits;
  const QUERY = format(
    "select * from inventario order by %s %s limit %s offset %s",
    campo,
    direccion,
    limits,
    offset
  );
  pool.query(QUERY);
  const { rows: inventario_joyas } = await pool.query(QUERY);
  return inventario_joyas;
};

const HATEOAS = (joyas_inventario) => {
  const results = joyas_inventario.map((joya) => {
    return {
      name: joya.nombre,
      href: `/joyas/joya/${j.id}`,
    };
  });

  const total_Joyas = joyas_inventario.length;
  const total_Stock = joyas_inventario.reduce(
    (total, joya) => total + joya.stock,
    0
  );
  const HATEOAS = {
    total_Joyas,
    total_Stock,
    results,
  };
  return HATEOAS;
};

const obtenerjoyasPorFiltros = async (a) => {
  const { precio_min, precio_max, categoria, metal } = a;
  let filtros = [];
  const values = [];
  const agregar_valor_Filtro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;

    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_min) agregar_valor_Filtro("precio", ">=", precio_min);
  if (precio_max) agregar_valor_Filtro("precio", "<=", precio_max);
  if (categoria) agregar_valor_Filtro("categoria", "=", categoria);
  if (metal) agregar_valor_Filtro("metal", "=", metal);

  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }

  const { rows: joyas } = await pool.query(consulta, values);
  return joyas;
};

module.exports = { obtenerJoyas, HATEOAS, obtenerjoyasPorFiltros };
