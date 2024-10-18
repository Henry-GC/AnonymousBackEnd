import { pool } from "../../utils/database.js";

export async function addToFavorite(user_id,prod_id,res) {
    try {
        await pool.query(
            'INSERT INTO wishlist(user_id,product_id) VALUES ($1,$2)',
            [user_id, prod_id]
        );
    } catch (error) {
        console.error('Error al agregar a favoritos:', error);
        res.status(500).json({ error: "Error al agregar a favoritos" });
    }
}