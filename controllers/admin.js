import { createAdmin } from "../models/database/createAdmin.js"
import { loginAdmin } from "../models/database/loginAdmin.js";
import { pool } from "../utils/database.js";

export class admin {

    static async create (req,res) {
        const { email, pass, type } = req.body
        
        if (!email || !pass) {
            return res.status(401).json({error: "Falta usuario o contraseña"})
        }
        
        try {
            const {admin_id} = await createAdmin(email,pass,type,res)
            res.status(200).json({Mensaje: `ADMIN ${admin_id} REGISTRADO CON EXITO`})
        } catch (error) {
            console.error('Error al crear nuevo admin:', error);
            res.status(401).json({error: 'problemas en la logica de registro'})
        }
    }

    static async login (req,res) {
        const { email, pass } = req.body
        if (!email || !pass) {
            return res.status(401).json({error: "Falta usuario o contraseña"})
        }
        await loginAdmin(email, pass, res)
    }

    static async logout (req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        });
        console.log('cerraste sesion');
        res.status(200).json({ mensaje: "Ha cerrado sesión exitosamente" });
    }

    static async getUsers (req, res) {
        try {
            const query = "SELECT * FROM users";
            const {rows} = await pool.query(query);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    static async getUserById (req, res) {
        const { id } = req.params;
        try {
            const query = `
                SELECT u.*, up.first_name, up.last_name, up.nickname, up.birth_date, up.phone
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = $1
            `;
            const {rows} = await pool.query(query, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            
            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ error: "Error al obtener usuario" });
        }
    }

    static async getOrders (req, res) {
        try {
            const query = `
                SELECT 
                    o.id,
                    o.user_id,
                    o.state,
                    o.total_price,
                    o.time_order,
                    u.username,
                    u.email,
                    oi.nombres,
                    oi.celular,
                    oi.ci,
                    oi.direccion
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN order_info oi ON o.id = oi.order_id
                ORDER BY o.time_order DESC
            `;
            const {rows} = await pool.query(query);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            res.status(500).json({ error: "Error al obtener órdenes" });
        }
    }

    static async getOrderById (req, res) {
        const { id } = req.params;
        try {
            // Obtener información de la orden
            const orderQuery = `
                SELECT 
                    o.id,
                    o.user_id,
                    o.state,
                    o.total_price,
                    o.time_order,
                    u.username,
                    u.email,
                    oi.nombres,
                    oi.celular,
                    oi.ci,
                    oi.direccion,
                    oi.referencia,
                    oi.banco,
                    oi.comprobante
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN order_info oi ON o.id = oi.order_id
                WHERE o.id = $1
            `;
            const {rows: orderRows} = await pool.query(orderQuery, [id]);

            if (orderRows.length === 0) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }

            // Obtener detalles de la orden
            const detailQuery = `
                SELECT 
                    od.id,
                    od.product_id,
                    od.count,
                    od.price_unit,
                    od.total,
                    p.name as product_name,
                    p.description as product_description
                FROM order_detail od
                LEFT JOIN products p ON od.product_id = p.id
                WHERE od.order_id = $1
            `;
            const {rows: detailRows} = await pool.query(detailQuery, [id]);

            const order = {
                ...orderRows[0],
                details: detailRows
            };

            res.status(200).json(order);
        } catch (error) {
            console.error('Error al obtener orden:', error);
            res.status(500).json({ error: "Error al obtener orden" });
        }
    }

    static async updateOrderStatus (req, res) {
        const { id } = req.params;
        const { state } = req.body;

        if (!state) {
            return res.status(400).json({ error: "Estado requerido" });
        }

        try {
            const query = "UPDATE orders SET state = $1 WHERE id = $2";
            const {rowCount} = await pool.query(query, [state, id]);

            if (rowCount === 0) {
                return res.status(404).json({ error: "Orden no encontrada" });
            }

            res.status(200).json({ message: "Estado de orden actualizado exitosamente" });
        } catch (error) {
            console.error('Error al actualizar orden:', error);
            res.status(500).json({ error: "Error al actualizar orden" });
        }
    }

    static async deleteOrder (req, res) {
        const { id } = req.params;
        
        try {
            await pool.query('BEGIN');

            // Eliminar detalles de la orden
            await pool.query("DELETE FROM order_detail WHERE order_id = $1", [id]);
            
            // Eliminar información de la orden
            await pool.query("DELETE FROM order_info WHERE order_id = $1", [id]);
            
            // Eliminar la orden
            const {rowCount} = await pool.query("DELETE FROM orders WHERE id = $1", [id]);

            if (rowCount === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ error: "Orden no encontrada" });
            }

            await pool.query('COMMIT');
            res.status(200).json({ message: "Orden eliminada exitosamente" });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al eliminar orden:', error);
            res.status(500).json({ error: "Error al eliminar orden" });
        }
    }
}