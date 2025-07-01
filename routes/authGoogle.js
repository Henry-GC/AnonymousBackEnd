import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../utils/passport.js';

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
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.JWT_REFRESH,
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

    // Redirige al frontend
    res.redirect('https://anonymouspc.net/'); // o a donde quieras
  }
);

export default router;
