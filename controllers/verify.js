import jwt from 'jsonwebtoken'
import { SECRET_KEY, SECRET_REFRESH_KEY } from '../utils/config.js';

export class verify {
  static verifyToken (req, res, next) {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token no existente" });
    }
    try {
      const user = jwt.verify(token, SECRET_KEY);
      req.user = user;
      next();
    } catch (error) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "El token no es válido o ha expirado" });
      }
      jwt.verify(refreshToken, SECRET_REFRESH_KEY, (err, user) => {
        if (err) return res.status(401).json({ error: "El token no es válido o ha expirado" });
        
        const newToken = jwt.sign(
          { user_id: user.user_id, username: user.username, rol: user.rol },
          SECRET_KEY,
          { expiresIn: '24h' }
        );
        res.cookie('token', newToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 2400 * 60 * 60 * 1000
        });
        req.user = user;
        next();
      });
    }
  };

  static verifyTokenAdmin (req, res, next) {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: "Token no existente" });
      }
      try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user;
        next();
      } catch (error) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({ error: "El token no es válido o ha expirado" });
        }
        jwt.verify(refreshToken, SECRET_REFRESH_KEY, (err, user) => {
          if (err) return res.status(401).json({ error: "El token no es válido o ha expirado" });
          
          const newToken = jwt.sign(
            { user_id: user.user_id, email: user.email, type: user.type },
            SECRET_KEY,
            { expiresIn: '24h' }
          );
          res.cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 2400 * 60 * 60 * 1000
          });
          req.user = user;
          next();
        });
      }
    };
}