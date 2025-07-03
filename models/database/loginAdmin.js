import { pool } from "../../utils/database.js"
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken'
import { SECRET_KEY, SECRET_REFRESH_KEY } from "../../utils/config.js";

export async function loginAdmin (email, pass, res) {
    try {
        const {rows} = await pool.query('SELECT * FROM admins WHERE email = $1',[email])
        if (rows.length > 0){
            console.log(pass);
            console.log(rows[0].pass)
            
            const isValid = await bcryptjs.compare(pass, rows[0].pass)
            if (isValid) {
            const token = jwt.sign({admin_id:rows[0].id ,email: rows[0].email, type: rows[0].type}, SECRET_KEY, {expiresIn:'24h'})
            const refreshToken = jwt.sign({admin_id:rows[0].id ,email: rows[0].email, type: rows[0].type}, SECRET_REFRESH_KEY, { expiresIn: '7d' })
            res.cookie('token',token,{
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 2400 * 60 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 2400 * 60 * 60 * 1000
            })
            res.status(200).json({mensaje: "Inicio de sesión exitoso" ,token});
            } else {
            res.status(401).json({error: "Contraseña incorrecta" });
            }
        } else {
            res.status(401).json({error: "Usuario no existe"})
        }
    } catch (error) {
        console.error("Error al realizar la consulta:", error);
        res.status(500).json({error: "Error interno del servidor" });
    }





    try {
        const {rows} = await pool.query('SELECT * FROM users WHERE username = $1', [user]);
        if (rows.length>0){
            const isValid = await bcryptjs.compare(pass,rows[0].pass)
            if (isValid) {
            const token = jwt.sign({user_id:rows[0].id ,username: rows[0].username, rol: rows[0].rol}, SECRET_KEY, {expiresIn:'1h'})
            const refreshToken = jwt.sign({user_id:rows[0].id ,username: rows[0].username, rol: rows[0].rol}, SECRET_REFRESH_KEY)
            res.cookie('token',token,{
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 2400 * 60 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 2400 * 60 * 60 * 1000
            })
            res.status(200).json({mensaje: "Inicio de sesión exitoso" ,token});
            } else {
            res.status(401).json({error: "Contraseña incorrecta" });
            }
        } else {
            res.status(401).json({error: "Usuario no existe"})
        }
    } catch (error) {

    }
}