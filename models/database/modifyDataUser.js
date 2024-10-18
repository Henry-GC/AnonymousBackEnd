import { pool } from "../../utils/database.js";

export async function modifyDataUser(name,lastname,nickname,birthdate,phone,user_id,res) {
    try {
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
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}