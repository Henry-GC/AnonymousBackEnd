import { pool } from "../../utils/database.js"
import bcryptjs from "bcryptjs";

export const createUser = async (user, pass, email ,res) => {
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
        const salt = await bcryptjs.genSalt(10);
        const passHash = await bcryptjs.hash(pass, salt);
    
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
    
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al crear nuevo usuario:', error);
        res.status(500).json({ error: "Fallo en la base de datos" });
    } finally {
        await pool.query('COMMIT'); // Confirmar la transacción
    }
}