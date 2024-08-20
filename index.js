import express from 'express';
import cors from 'cors';
import bcrypt from "bcryptjs"
import { pool } from './utils/database.js';
import { PORT , SECRET_KEY } from './utils/config.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import gamerBuilds from './utils/gamerBuilds.json' assert { type: 'json' };
import wishlist from './utils/wishList.json' assert { type: 'json' };

const app = express ()
const allowedOrigins = ["https://anonymouspc.netlify.app", "http://localhost:3000"];

app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser())

// MIDLEWARE DE AUTENTIFICACIÓN
const verifyToken = (req,res,next) =>{
  const token = req.cookies.token;
  if (!token){
    return res.status(401).json({error: "Token no existente"})
  }
  try {
    const user = jwt.verify(token,SECRET_KEY)
    req.user = user
    next();
  } catch (error) {
    return res.status(401).json({error: "El token no es valido "})
  }
}

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
    const {rows} = await pool.query("SELECT * FROM products");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

/*----------------------------------- USUARIOS ---------------------------------------*/

// REGISTRO DE USUARIO
app.post("/api/register", async(req, res) => {
  const { user, pass, email } = req.body;
  if (!user || !pass || !email) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Verificación si ya existe usuario o email
    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [user, email]
    );

    if (existingUsers.length > 0) {
      return res.status(401).json({ error: "Usuario o Email ya existentes" });
    }

    // Encriptado de la contraseña e ingreso en la base de datos
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(pass, salt);

    // Iniciar una transacción para asegurar todas las inserciones
    await pool.query('BEGIN');

    // Crear el usuario
    const { rows: userRows } = await pool.query(
      'INSERT INTO users(username, pass, email, rol) VALUES ($1, $2, $3, $4) RETURNING id',
      [user, passHash, email, 'CUSTOMER']
    );
    
    const userId = userRows[0].id;

    // Crear una nueva fila en user_profiles con campos nulos o vacíos
    await pool.query(
      'INSERT INTO user_profiles(user_id, first_name, last_name, nickname, birth_date, phone) VALUES ($1, NULL, NULL, NULL, NULL, NULL)',
      [userId]
    );

    // Crear una nueva dirección por defecto con campos nulos
    await pool.query(
      'INSERT INTO addresses(user_id, street, city, province, reference, is_default) VALUES ($1, NULL, NULL, NULL, NULL, TRUE)',
      [userId]
    );

    // Confirmar la transacción
    await pool.query('COMMIT');

    res.status(200).json({ mensaje: "Usuario, perfil y dirección creados con éxito" });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error al registrar usuario, perfil y dirección:", error);
    res.status(500).json({ error: "Fallo en la base de datos" });
  }
});



// INGRESO DE USUARIO
app.post('/api/login', async (req, res) => {

  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.status(400).json({error: "Usuario y contraseña son requeridos"});
  }

  try {
    // Verificacion si es un usuario existente
    const {rows} = await pool.query('SELECT * FROM users WHERE username = $1', [user]);
    if (rows.length>0){
      const isValid = await bcrypt.compare(pass,rows[0].pass)
      if (isValid) {
        const token = jwt.sign({user_id:rows[0].id ,username: rows[0].username, rol: rows[0].rol}, SECRET_KEY, {expiresIn:'1h'})
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

/*---------------------------------------------------------------PROTECTED---------------------------------------------------------------------*/
//COMPRAR
app.post('/api/user/createorder', async(req,res)=>{
  const token = req.cookies.token

  //COMPRA USUARIO SIN REGISTRAR
  if (!token) {
    const {total,details} = req.body
    console.log(total,details);
    res.status(201).json({message: 'Compra de usuario no registrado'})
  } else {

  //COMPRA PARA REGISTRADOS
  try {
    const {total,details} = req.body
    const {user_id} = jwt.verify(token,SECRET_KEY)
    const queryCreateOrder = `INSERT INTO orders(user_id,state,total_price) VALUES ($1,$2,$3) RETURNING id;`
    const valuesCreateOrder = [user_id,'PENDIENTE',total]
    
    //INICIO DE TRANSACCION SQL
    await pool.query('BEGIN')
    const {rows} = await pool.query(queryCreateOrder,valuesCreateOrder)
    const order_id = rows[0].id
    const queryCreateDetails = `INSERT INTO order_detail(order_id,product_id,count,price_unit,total) VALUES ($1,$2,$3,$4,$5) RETURNING id`
    for (const detail of details) {
      const {prod_id,count,price,total} = detail
      await pool.query(queryCreateDetails,[order_id,prod_id,count,price,total])
    }
    await pool.query('COMMIT')
    console.log('Compra realizada con exito. ORDEN N° ',order_id);
    
    res.status(201).json({message: 'Nueva orden creada',order_id})
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error(error);
    res.status(500).json({error: 'Ha habido fallos en la base de datos'})
  }}
})

//DATOS DEL USUARIO PARA DASHBOARD, PEDIDOS, WISHLIST
app.get('/api/user', async(req,res)=>{
  const user_id = 1
  try {
  const userResponse = await pool.query(
    `SELECT u.*, up.first_name, up.last_name, up.nickname, up.birth_date, up.phone
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1`,
    [user_id]
  );
  const ordersResponse = await pool.query('SELECT * FROM orders WHERE "user_id" = $1',[user_id]);
  const detailResponse = await pool.query(
    `SELECT od.*, p.name as product_name
    FROM order_detail od
    JOIN orders o ON od.order_id = o.id
    JOIN products p ON od.product_id = p.id
    WHERE o.user_id = $1`,
    [user_id]
  );
  const wishlistResponse = await pool.query(
    `SELECT p.*
    FROM products p
    JOIN wishlist w ON p.id = w.product_id
    WHERE w.user_id = $1`,
    [user_id]
  );
  const addressesResponse = await pool.query(
    `SELECT * FROM addresses WHERE user_id = $1`,
    [user_id]
  );

  if (userResponse.rowCount === 0) {
    return res.status(404).json({error: 'Usuario no encontrado'})
  }

  const user = {
    userData: userResponse.rows[0],
    orders: ordersResponse.rows,
    order_detail: detailResponse.rows,
    wishlist: wishlistResponse.rows,
    addresses: addressesResponse.rows
  }

    res.status(200).json({message: 'Datos del usuario',user: user})
  } catch (error) {
    console.error("Error al enviar datos del usuario",error)
    res.status(500).json({error: "Error al enviar datos del usuario"})
  }
});

//MODIFICAR DATOS DEL USUARIO
app.post("/api/user/profile/data", async (req, res) => {
  const { name, lastname, nickname, birthdate, phone } = req.body;
  const user_id  = 1;

  try {
    // Actualizar los campos en la tabla user_profiles para el user_id
    await pool.query(
      `UPDATE user_profiles SET 
        first_name = $1, 
        last_name = $2, 
        nickname = $3, 
        birth_date = $4, 
        phone = $5 
      WHERE user_id = $6`,
      [name || "", lastname || "", nickname || "", birthdate || null, phone || "", user_id]
    );

    res.status(200).json({ message: "Perfil actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el perfil del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// INGRESO DE DIRECCIONES
app.post('/api/user/address', async (req, res) => {
  const { street, city, province, reference, is_default } = req.body;
  const user_id = 1;

  if (!street || !city || !province) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Si se establece una dirección como predeterminada, cambiar el estado de is_default de las demás direcciones del usuario a falso
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
        [user_id]
      );
    }

    // Insertar la nueva dirección
    const { rows } = await pool.query(
      'INSERT INTO addresses (user_id, street, city, province, reference, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, street, city, province, reference, is_default]
    );

    res.status(201).json({ message: "Dirección añadida exitosamente", address_id: rows[0].id });
  } catch (error) {
    console.error("Error al agregar dirección:", error);
    res.status(500).json({ error: "Fallo en la base de datos" });
  }
});


//CANCELAR PEDIDOS
app.post('/api/user/cancel-orders', async(req,res)=>{
  const {order_id} = req.body;

  try {
    await pool.query(
      'UPDATE orders SET "state" = $1 WHERE "id" = $2',
      ['CANCELADO',order_id]
    );
    res.status(200).json({message: "PEDIDO CANCELADO",order_id})
  } catch (error) {
    console.error("Error al cancelar pedidos",error);
    res.status(500).json({ error: "Error al cancelar pedidos" })
  }
})

//AGREGAR PRODUCTO A FAVORITOS
app.post('/api/user/add-favorite', async (req, res) => {
  const user_id = 1;
  const { prod_id } = req.body;

  try {
    await pool.query(
      'INSERT INTO wishlist(user_id,product_id) VALUES ($1,$2)',
      [user_id, prod_id]
    );
    res.status(200).json({
      message: "PRODUCTO AGREGADO A FAVORITOS",
      user_id,
      prod_id
    });
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
    res.status(500).json({ error: "Error al agregar a favoritos" });
  }
});


//ELIMINAR PRODUCTO FAVORITO
app.post('/api/user/delete-favorite', async (req, res) => {
  const user_id = 1;
  const { prod_id } = req.body;

  try {
    await pool.query(
      'DELETE FROM wishlist WHERE "user_id" = $1 AND "product_id" = $2',
      [user_id, prod_id]
    );
    res.status(200).json({ message: "PRODUCTO ELIMINADO DE FAVORITOS", prod_id });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    res.status(500).json({ error: "Error al eliminar de favoritos" });
  }
});

//WISHLIST
app.get('/api/user/wishlist',(req,res)=>{
  try {
    res.status(200).json(wishlist)
  } catch (error) {
    res.status(404).json({error: "Usuario no tiene articulos en la wishlist"})
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});