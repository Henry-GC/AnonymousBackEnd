import { pool } from "../../utils/database.js";

export async function addToAdress(user_id,street,city,province,reference,is_default) {
    try {
        if (is_default) {
            await pool.query(
            'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
            [user_id]
            );
        }

        const { rows } = await pool.query(
            'INSERT INTO addresses (user_id, street, city, province, reference, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [user_id, street, city, province, reference, is_default]
        );
        return rows
    } catch (error) {
        console.error("Error al agregar dirección:", error);
        res.status(500).json({ error: "Fallo en la base de datos" });
    }
}