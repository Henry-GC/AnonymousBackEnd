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

  // Si no existe, lo insertamos
  const insert = await pool.query(
    'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );

  return insert.rows[0];
}
