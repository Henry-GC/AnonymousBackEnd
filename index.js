import express from 'express';
import cors from 'cors';
import bcrypt from "bcryptjs"
import { pool } from './utils/database.js';
import { PORT , SECRET_KEY } from './utils/config.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import data from './utils/items.json' assert { type: 'json' };
import gamerBuilds from './utils/gamerBuilds.json' assert { type: 'json' };

const app = express ()
const allowedOrigins = ["https://anonymouspc.netlify.app", "http://localhost:3000"];

app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser())

// PRUEBA
app.get("/api/prueba", async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ message: "Conexión exitosa a la base de datos" });
  } catch (error) {
    res.status(400).json({ error: "FALLO EN BASE DE DATOS" });
  }
});


/*----------------------------------- PRODUCTOS -----------------------------------*/
app.get('/api/gamerBuilds', async (req, res) => {
  try {
    // const [result] = await pool.query("SELECT * FROM products");
    res.status(200).json(gamerBuilds);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    // const [result] = await pool.query("SELECT * FROM products");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

/*----------------------------------- USUARIOS ---------------------------------------*/

// REGISTRO DE USUARIO
app.post("/api/register", async(req,res)=>{

  const {user,pass,email,rol} = req.body
  if(!user || !pass || !email || !rol){
      return res.status(400).json({error: "Datos incompletos"})
  }

  try {
    // Verificacion si ya existe usuario o email
   const { rows } = await pool.query(
      'SELECT * FROM users WHERE "user" = $1 OR email = $2',
      [user, email]
    );

    if (rows.length > 0) {
      return res.status(401).json({ error: "Usuario o Email ya existentes" });
    }

    // Encriptado de la contraseña e ingreso en la base de datos
  const salt = await bcrypt.genSalt(10)
  const passHash =  await bcrypt.hash(pass,salt)
  await pool.query('INSERT INTO users("user", pass, email, rol) VALUES ($1, $2, $3, $4)',[user, passHash, email, rol]);
  res.status(200).json({mensaje: "Usuario ingresado con éxito"})
  } catch {
      res.status(500).json({error: "FALLO EN LA BASE DE DATOS"})
  }
})

// INGRESO DE USUARIO
app.post('/api/login', async (req, res) => {

  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.status(400).json({error: "Usuario y contraseña son requeridos"});
  }

  try {
    // Verificacion si es un usuario existente
    const {rows} = await pool.query('SELECT * FROM users WHERE "user" = $1', [user]);
    if (rows.length>0){
      const isValid = await bcrypt.compare(pass,rows[0].pass)
      if (isValid) {
        const token = jwt.sign({user_id:rows[0].id ,user: rows[0].user, rol: rows[0].rol}, SECRET_KEY, {expiresIn:'1h'})
        res.cookie('token',token,{
          httpOnly: true,
          sameSite: 'strict'
        }).status(200).json({mensaje: "Inicio de sesión exitoso" ,token});
      } else {
        res.status(401).json({error: "Contraseña incorrecta" });
      }
    } else {
      res.status(401).json({error: "Usuario no existe"})
    }
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    res.status(500).json({error: "Error interno del servidor" });
  }
});

app.get('/api/logout', async (req, res) => {
  try {
    if (req.cookies.token) {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict'
      });
    }
    res.status(200).json({ mensaje: "Ha cerrado sesión exitosamente" });
  } catch (error) {
    if (error.code === 'COOKIE_NOT_FOUND') {
      res.status(404).json({ mensaje: "Cookie no encontrada" });
    } else {
      console.error("Error al cerrar sesión:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});