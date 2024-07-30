import express from 'express';
import cors from 'cors';
import bcrypt from "bcryptjs"
import { connection } from './utils/database.js';
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
app.get("/api/prueba", async(req,res)=>{
  try{
      const [response] = await connection.query('SELECT * FROM users');
      res.status(200).json(response)
  } catch{
      res.status(400).json({error: "FALLO EN BASE DE DATOS"})
  }
})


/*----------------------------------- PRODUCTOS -----------------------------------*/
app.get('/api/gamerBuilds', async (req, res) => {
  try {
    // const [result] = await connection.query("SELECT * FROM products");
    res.status(200).json(gamerBuilds);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    // const [result] = await connection.query("SELECT * FROM products");
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
  const [response] = await connection.query('SELECT * FROM users')
  const filter = response.filter((usuario)=> usuario.user === user || usuario.email === email)
  if (filter.length > 0) {
      return res.status(401).json({error: "Usuario o Email ya existentes"})
  }
    // Encriptado de la contraseña e ingreso en la base de datos
  const salt = await bcrypt.genSalt(10)
  const passHash =  await bcrypt.hash(pass,salt)
  connection.query('INSERT INTO users(user,pass,email,rol) VALUES (?,?,?,?)',[user,passHash,email,rol])
  res.status(200).json({mensaje: "Usuario ingresado con éxito"})
  } catch {
      res.status(500).json({error: "FALLO EN LA BASE DE DATOS"})
  }
})

// INGRESO DE USUARIO
app.post('/api/login', async (req, res) => {

  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.status(400).json({ message: "Usuario y contraseña son requeridos" });
  }

  try {
    // Verificacion si es un usuario existente
    const [result] = await connection.query("SELECT * FROM users WHERE user = ?", [user]);
    if (result.length>0){
      const isValid = await bcrypt.compare(pass,result[0].pass)
      if (isValid) {
        const token = jwt.sign({user_id:result[0].id ,user: result[0].user, rol: result[0].rol}, SECRET_KEY, {expiresIn:'1h'})
        res.cookie('token',token,{
          httpOnly: true,
          sameSite: 'strict'
        }).status(200).json({ message: "Inicio de sesión exitoso" ,token});
      } else {
        res.status(401).json({ message: "Contraseña incorrecta" });
      }
    } else {
      res.status(401).json({mensaje: "Usuario no existe"})
    }
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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