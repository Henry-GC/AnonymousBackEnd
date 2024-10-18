import { pool } from "../../utils/database.js";

export async function cancelOrderUser(order_id,res) {
    try {
        await pool.query(
            'UPDATE orders SET "state" = $1 WHERE "id" = $2',
            ['CANCELADO',order_id]
        );
    } catch (error) {
        console.error("Error al cancelar pedidos",error);
        res.status(500).json({ error: "Error al cancelar pedidos" })
    }
}