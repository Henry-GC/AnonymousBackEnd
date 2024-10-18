import { pool } from "../../utils/database.js";

export async function deleteToFavorite(user_id,prod_id,res) {
    try {
        await pool.query(
            'DELETE FROM wishlist WHERE "user_id" = $1 AND "product_id" = $2',
            [user_id, prod_id]
        );
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
        res.status(500).json({ error: "Error al eliminar de favoritos" });
    }
}

