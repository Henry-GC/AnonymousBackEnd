import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../utils/passport.js';
import { SECRET_KEY, SECRET_REFRESH_KEY } from '../utils/config.js';

const router = express.Router();

// Iniciar login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Callback después del login
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user;

    // Crea el token JWT
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    const refreshToken = jwt.sign(
      { user_id: user.id },
      SECRET_REFRESH_KEY,
      { expiresIn: '7d' }
    );

    // Envia cookies como ya haces en login manual
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirigir al frontend con los tokens como query params
    res.redirect(`https://anonymouspc.net/oauth-callback?token=${token}`);
  }
);

export default router;
