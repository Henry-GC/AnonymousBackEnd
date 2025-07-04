import { pool } from '../../utils/database.js';

export async function findOrCreateGoogleUser(profile) {
  const email = profile.emails[0].value;
  const name = profile.displayName;
  const google_id = profile.id;

  const existing = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  try {
    await pool.query('BEGIN')
    // Si no existe, lo insertamos
    const insert = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    const userId = insert.rows[0].id;
      
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
    return insert.rows[0];

  } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error al crear nuevo usuario:', error);
      res.status(500).json({ error: "Fallo en la base de datos" });
  } finally {
      await pool.query('COMMIT'); // Confirmar la transacción
  }
}
