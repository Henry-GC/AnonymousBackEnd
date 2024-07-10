import express from 'express';
import cors from 'cors';
import { connection } from './database.js';
import { PORT } from './config.js';
const app = express ()

// Permitir solicitudes CORS
// const allowedOrigins = ["https://anonymouspc.netlify.app", "http://localhost:3000"];
app.use(cors());

// Middleware para manejar datos JSON
app.use(express.json());

// Ruta para manejar peticiones GET del formulario
app.get('/prueba', async (req, res) => {
  try {
    res.status(200).json({ mensaje: 'PRUEBA SATISFACTORIA' });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error en el servidor' });
  }
});

app.get('/api/productos', async (req, res) => {
  const result = await connection.query("SELECT * FROM PRODUCTOS");
  const productos = result.map(producto => ({
    ...producto,
    price_prod: parseFloat(producto.price_prod).toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
});

const search = async (req, res, type) => {
  const result = await connection.query(`SELECT * FROM PRODUCTOS WHERE type_prod = ?`,[type]);
  const productos = result.map(producto => ({
    ...producto,
    price_prod: parseFloat(producto.price_prod).toFixed(2)
  }));
  console.log(productos);
  res.status(200).json(productos);
};

app.get("/api/procesadores", (req, res)=>{search(req, res, "CPU")})
app.get('/api/mobo', (req, res)=>{search(req, res, "MBO")})
app.get('/api/gpu', (req, res)=>{search(req, res, "GPU")})
app.get('/api/ram', (req, res)=>{search(req, res, "RAM")})
app.get('/api/almacenamiento', (req, res)=>{search(req, res, "STG")})
app.get('/api/fuentes', (req, res)=>{search(req, res, "PSU")})
app.get('/api/case', (req, res)=>{search(req, res, "CASE")})
app.get('/api/acc', (req, res)=>{search(req, res, "ACC")})

// Ruta para manejar peticiones POST del formulario
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
  }

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
