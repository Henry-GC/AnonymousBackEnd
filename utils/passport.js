import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();

// Tu función para buscar o crear el usuario en la DB
import { findOrCreateGoogleUser } from '../models/database/findOrCreateGoogleUser.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateGoogleUser(profile);
    done(null, user); // Se envía a la siguiente fase
  } catch (error) {
    done(error, null);
  }
}));

export default passport;
