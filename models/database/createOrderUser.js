import { pool } from '../../utils/database.js'
import jwt from 'jsonwebtoken'

export async function createOrderUser(total,details,res) {
    try {
        const {user_id} = jwt.verify(token,SECRET_KEY)
        const queryCreateOrder = `INSERT INTO orders(user_id,state,total_price) VALUES ($1,$2,$3) RETURNING id;`
        const valuesCreateOrder = [user_id,'PENDIENTE',total]
        
        //INICIO DE TRANSACCION SQL
        await pool.query('BEGIN')
        const {rows} = await pool.query(queryCreateOrder,valuesCreateOrder)
        const order_id = rows[0].id
        const queryCreateDetails = `INSERT INTO order_detail(order_id,product_id,count,price_unit,total) VALUES ($1,$2,$3,$4,$5) RETURNING id`
        for (const detail of details) {
            const {prod_id,count,price,total} = detail
            await pool.query(queryCreateDetails,[order_id,prod_id,count,price,total])
        }
        console.log('Compra realizada con exito. ORDEN N° ',order_id);

    } catch (error) {
        await pool.query('ROLLBACK')
        console.error(error);
        res.status(500).json({error: 'Ha habido fallos en la base de datos'})
    } finally {
        await pool.query('COMMIT')
    }
}