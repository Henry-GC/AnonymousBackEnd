import bcryptjs from "bcryptjs";
import { pool } from "../../utils/database.js"

export async function createAdmin (email,pass,type,res) {
    try {
        const data = await pool.query('SELECT * FROM admins WHERE email = $1',[email])
        if (data.rows.length > 0) {
            console.log('USUARIO YA REGISTRADO');
        }

        const salt = await bcryptjs.genSalt(10);
        const passHash = await bcryptjs.hash(pass, salt);

        await pool.query('BEGIN')
        const {rows} = await pool.query('INSERT INTO admins(email,pass,type) VALUES ($1, $2, $3) RETURNING id',[email,passHash,type])
        const admin_id = rows[0].id
        console.log(`ADMIN ID ${admin_id}`)
        return {admin_id};

    } catch (error) {
        await pool.query('ROLLBACK')
        console.log('error durante la operacion');
        console.log(error);
    } finally {
        await pool.query('COMMIT')
    }
    
}