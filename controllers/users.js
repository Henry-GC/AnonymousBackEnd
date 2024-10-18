import { addToAdress } from "../models/database/addAdress.js";
import { addToFavorite } from "../models/database/addToFavorite.js";
import { createUser } from "../models/database/createUser.js";
import { dataUser } from "../models/database/dataUser.js";
import { deleteToFavorite } from "../models/database/deleteToFavorite.js";
import { loginUser } from "../models/database/loginUsers.js";
import { modifyDataUser } from "../models/database/modifyDataUser.js";

export class users {

    static async register (req, res) {
        const { user, pass, email } = req.body;
        if (!user || !pass || !email) {
            return res.status(400).json({ error: "Datos incompletos" });
        }
        await createUser(user,pass,email,res)
        res.status(200).json({ mensaje: "Usuario, perfil y dirección creados con éxito" });
    }

    static async login (req, res) {
        const { user, pass } = req.body;
        if (!user || !pass) {
            return res.status(400).json({error: "Usuario y contraseña son requeridos"});
        }
        await loginUser(user,pass,res)
    }

    static async logout (req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict',
            // secure: true
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            // secure: true
        });
        res.status(200).json({ mensaje: "Ha cerrado sesión exitosamente" });
    }

    static async userData (req,res){
        const user_id = req.user.user_id;
        const user = await dataUser(user_id,res)
        res.status(200).json({message: 'Datos del usuario',user: user})
    };

    static async mofifyData (req, res) {
        const { name, lastname, nickname, birthdate, phone } = req.body;
        const user_id  = req.user.user_id;
        await modifyDataUser(name,lastname,nickname,birthdate,phone,user_id,res)
        res.status(200).json({ message: "Perfil actualizado con éxito" });
    };

    static async cancelOrder (req, res) {
        const {order_id} = req.body;
        await cancelOrderUser(order_id,res)
        res.status(200).json({message: "PEDIDO CANCELADO",order_id})
    }

    static async addFavorite (req, res) {
        const user_id = req.user.user_id;
        const { prod_id } = req.body;
        await addToFavorite(user_id, prod_id, res)
        res.status(200).json({message: "PRODUCTO AGREGADO A FAVORITOS", user_id, prod_id});
    }

    static async deleteFavorite (req, res) {
        const user_id = req.user.user_id;
        const { prod_id } = req.body;
        await deleteToFavorite(user_id,prod_id,res)
        res.status(200).json({ message: "PRODUCTO ELIMINADO DE FAVORITOS", prod_id });
    }

    static async addAdresses (req, res) {
        const { street, city, province, reference, is_default } = req.body;
        const user_id = req.user.user_id;
        if (!street || !city || !province) {
            return res.status(400).json({ error: "Datos incompletos" });
        }
        const rows = await addToAdress(user_id,street,city,province,reference,is_default)
        res.status(201).json({ message: "Dirección añadida exitosamente", address_id: rows[0].id });
    }
}