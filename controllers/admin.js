import { createAdmin } from "../models/database/createAdmin.js"
import { loginAdmin } from "../models/database/loginAdmin.js";

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
}