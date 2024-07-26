import express from 'express';
import cors from 'cors';
import { connection } from './utils/database.js';
import { PORT } from './utils/config.js';
import data from './utils/items.json' assert { type: 'json' };
import gamerBuilds from './utils/gamerBuilds.json' assert { type: 'json' };

const app = express ()

// Permitir solicitudes CORS
const allowedOrigins = ["https://anonymouspc.netlify.app", "http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins
}));

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

app.get('/api/gamerBuilds', async (req, res) => {
  try {
    // const [result] = await connection.query("SELECT * FROM productos");
    res.status(200).json(gamerBuilds);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    // const [result] = await connection.query("SELECT * FROM productos");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Ruta para manejar peticiones POST del formulario
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body;
  console.log(user,pass);

  if (!user || !pass) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
  }

  try {
    const [result] = await connection.query("SELECT * FROM usuarios WHERE username = ? AND password = ?", [user, pass]);
    console.log(result)

    if (result.length > 0) {
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
