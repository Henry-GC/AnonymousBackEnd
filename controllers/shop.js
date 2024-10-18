import { createOrderUser } from "../models/database/createOrderUser.js";

export class shop {
    static async createOrder (req,res) {
        const token = req.cookies.token
        const {total,details} = req.body
        //COMPRA USUARIO SIN REGISTRAR
        if (!token) {
            console.log(total,details);
            res.status(201).json({message: 'Compra de usuario no registrado'})
        }
        const order_id = await createOrderUser(token,total,details,res)
        res.status(201).json({message: 'Nueva orden creada', order_id})
        console.log('Compra realizada con exito. ORDEN N° ',order_id);
    } 
}