const express = require('express');
const cors = require('cors');
const database = require("./database");
const app = express();
const PORT = process.env.PORT || 5000;

// Permitir solicitudes CORS
const allowedOrigin = ["https://anonymouspc.netlify.app", "http://localhost:3000"];
app.use(cors());

// Middleware para manejar datos JSON
app.use(express.json());

// Ruta para manejar peticiones GET del formulario
app.get("/", async (req, res) => {
  res.status(200).send("PRUEBA SATISFACTORIA");
});

app.get('/api/productos', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/procesadores', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'CPU'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/mobo', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'MBO'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/gpu', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'GPU'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/ram', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'RAM'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/almacenamiento', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'STG'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/fuentes', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'PSU'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/case', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'CASE'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

app.get('/api/acc', async (req, res) => {
  const connection = await database.getConection();
  const result = await connection.query("SELECT * FROM PRODUCTOS WHERE type_prod = 'ACC'");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: producto.price_prod.toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

// Ruta para manejar peticiones POST del formulario
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
  }

  const connection = await database.getConection();
  try {
    const result = await connection.query("SELECT * FROM USUARIOS WHERE usuario = ? AND pass = ?", [user, pass]);
    const finaLog = [result]

    if (finaLog.length > 0) {
      // Usuario y contraseña correctos
      res.status(200).json({ message: "Inicio de sesión exitoso" });
    } else {
      // Usuario o contraseña incorrectos
      res.status(401).json({ message: "Usuario o contraseña incorrectosssssss" });
    }
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
