const express = require('express');
const cors = require('cors');
const database = require("./database")
const app = express();
const PORT = 5000;


// Permitir solicitudes desde http://localhost:3000
app.use(cors({
  origin: 'https://anonymouspc.netlify.app'
}));
// Middleware para manejar datos JSON
app.use(express.json());


// Ruta para manejar peticiones GET del formulario
app.get('/base', async (req, res) => {
  const connection = await database.getConection()
  const result = await connection.query("SELECT * FROM productos")
  res.status(200).json(result);
});

// // Ruta para manejar peticiones POST del formulario
// app.post('/formulario', (req, res) => {
//   // Aquí puedes manejar los datos enviados en la solicitud POST
//   const formData = req.body; // Suponiendo que los datos se envían en el cuerpo de la solicitud en formato JSON
//   // Por ejemplo, puedes guardar los datos en la base de datos u realizar alguna otra acción
//   console.log('Datos recibidos:', formData);
//   // Responder con un mensaje de éxito u otro tipo de respuesta según sea necesario
//   res.status(200).json({ message: 'Datos recibidos correctamente' });
// });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
