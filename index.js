const express = require("express");
const app = express();

const {
  obtenerJoyas,
  HATEOAS,
  obtenerjoyasPorFiltros,
} = require("./consultas");

const reporte = async (req, res, next) => {
  const parametros = req.query;
  const url = req.url;
  console.log(
    `
    hoy ${new Date()}
    query recibida en la ruta ${url}
    con los parámetros:
  `,
    parametros
  );
  return next();
};

app.get("/joyas", reporte, async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas_contenido = await obtenerJoyas(queryStrings);
    const hateos = HATEOAS(joyas_contenido);
    res.json(hateos);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/joyas/filtros", reporte, async (req, res) => {
  try {
    const queryStrings = req.query;
    const busqueda_filtros = await obtenerjoyasPorFiltros(queryStrings);
    res.json(busqueda_filtros);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(3000, console.log("encedido el servidor"));
