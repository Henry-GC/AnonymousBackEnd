import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/usersRoutes.js'
import productsRoutes from './routes/productsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import authGoogle from './routes/authGoogle.js';
import { PORT } from './utils/config.js';
import { pool } from './utils/database.js';

const app = express ()
const allowedOrigins = [
  "https://anonymouspc.net",
  // "https://anonymouspc.pages.dev",
  // "https://dashboard.anonymouspc.net",
  // "http://localhost:3000"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// app.use(cors({origin: allowedOrigins, credentials: true}));
// app.options("*", cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser())


app.use('/api', userRoutes)
app.use('/api', productsRoutes)
app.use('/adm', adminRoutes)
app.use('/auth', authGoogle)

// PRUEBA
app.get("/", async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ message: "Conexión exitosa a la base de datos" });
  } catch (error) {
    res.status(400).json({ error: "FALLO EN BASE DE DATOS" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});