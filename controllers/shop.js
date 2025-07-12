import { createOrderUser } from "../models/database/createOrderUser.js";

export class shop {
    static async createOrder (req,res) {
        const token = req.cookies.token
        const {total,details,info} = req.body
        console.log(req.body.info);
        
        //COMPRA USUARIO SIN REGISTRAR
        if (!token) {
            console.log('Compra de usuario no registrado',total,details);
            return res.status(201).json({message: 'Compra de usuario no registrado'})
        }
        const order_id = await createOrderUser(token,total,details,info,res)
        res.status(201).json({message: 'Nueva orden creada', order_id})
        console.log('Compra realizada con exito. ORDEN N° ',order_id);
    } 
}