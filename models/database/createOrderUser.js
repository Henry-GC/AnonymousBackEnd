import { pool } from '../../utils/database.js'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from '../../utils/config.js'

export async function createOrderUser(token,total,details,info,res) {
    try {
        const {user_id} = jwt.verify(token,SECRET_KEY)
        const queryCreateOrder = `INSERT INTO orders(user_id,state,total_price) VALUES ($1,$2,$3) RETURNING id;`
        const valuesCreateOrder = [user_id,'PENDIENTE',total]
        
        //INICIO DE TRANSACCION SQL
        await pool.query('BEGIN')
        const {rows} = await pool.query(queryCreateOrder,valuesCreateOrder)
        const order_id = rows[0].id
        const queryCreateInfo = `INSERT INTO order_info(order_id,nombres,email,celular,ci,direccion,referencia,comprobante) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`
        const {nombres,email,celular,ci,direccion,referencia,comprobante} = info
        await pool.query(queryCreateInfo,[order_id,nombres,email,celular,ci,direccion,referencia,comprobante])
        const queryCreateDetails = `INSERT INTO order_detail(order_id,product_id,count,price_unit,total) VALUES ($1,$2,$3,$4,$5) RETURNING id`
        for (const detail of details) {
            const {prod_id,count,price,total} = detail
            await pool.query(queryCreateDetails,[order_id,prod_id,count,price,total])
        }
        return order_id
    } catch (error) {
        await pool.query('ROLLBACK')
        console.error(error);
        res.status(500).json({error: 'Ha habido fallos en la base de datos'})
    } finally {
        await pool.query('COMMIT')
    }
}