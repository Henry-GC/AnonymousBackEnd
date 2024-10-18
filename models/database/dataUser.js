import { pool } from "../../utils/database.js";

export async function dataUser (user_id,res) {
    try {
        await pool.query('BEGIN');
        const userResponse = await pool.query(
            `SELECT u.*, up.first_name, up.last_name, up.nickname, up.birth_date, up.phone
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = $1`,
            [user_id]
        );
        const ordersResponse = await pool.query('SELECT * FROM orders WHERE "user_id" = $1',[user_id]);
        const detailResponse = await pool.query(
            `SELECT od.*, p.name as product_name
            FROM order_detail od
            JOIN orders o ON od.order_id = o.id
            JOIN products p ON od.product_id = p.id
            WHERE o.user_id = $1`,
            [user_id]
        );
        const wishlistResponse = await pool.query(
            `SELECT p.*
            FROM products p
            JOIN wishlist w ON p.id = w.product_id
            WHERE w.user_id = $1`,
            [user_id]
        );
        const addressesResponse = await pool.query(
            `SELECT * FROM addresses WHERE user_id = $1`,
            [user_id]
        );
    
        if (userResponse.rowCount === 0) {
            return res.status(404).json({error: 'Usuario no encontrado'})
        }
    
        const user = {
            userData: userResponse.rows[0],
            orders: ordersResponse.rows,
            order_detail: detailResponse.rows,
            wishlist: wishlistResponse.rows,
            addresses: addressesResponse.rows
        }

        return user
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al enviar datos del usuario",error)
        res.status(500).json({error: "Error al enviar datos del usuario"})
    } finally {
        await pool.query('COMMIT');
    }
}