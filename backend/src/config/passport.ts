// src/config/passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.utilisateur.findUnique({
        where: { id: jwt_payload.sub || jwt_payload.userId },
        select: {
          id: true,
          email: true,
          prenom: true,
          nom: true,
          role: true,
          estActif: true,
        },
      });

      if (!user) {
        return done(null, false);
      }

      if (!user.estActif) {
        return done(null, false, { message: 'Compte désactivé' });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;