// src/config/passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './db.js';
import { getTenantClient } from './tenant-db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

interface JwtPayload {
  sub?: string;
  userId?: string;
  scope?: 'GLOBAL' | 'TENANT';
  schemaName?: string;
  etablissementId?: string;
}

passport.use(
  new JwtStrategy(opts, async (jwt_payload: JwtPayload, done) => {
    try {
      const userId = jwt_payload.sub || jwt_payload.userId;
      if (!userId) {
        return done(null, false, { message: 'Token invalide : userId manquant' });
      }

      // ─── Scope GLOBAL : SUPER_ADMIN / ADMIN_SYSTEME (catalogue) ───
      if (jwt_payload.scope === 'GLOBAL') {
        const user = await prisma.utilisateurGlobal.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            prenom: true,
            nom: true,
            role: true,
            estActif: true,
          },
        });

        if (!user) return done(null, false);
        if (!user.estActif) {
          return done(null, false, { message: 'Compte désactivé' });
        }

        // On attache le scope pour que les middlewares suivants sachent où chercher
        return done(null, { ...user, scope: 'GLOBAL' });
      }

      // ─── Scope TENANT : utilisateur d'un établissement ───
      if (jwt_payload.scope === 'TENANT' && jwt_payload.schemaName) {
        const tenantClient = await getTenantClient(jwt_payload.schemaName);
        if (!tenantClient) {
          return done(null, false, { message: 'Établissement introuvable' });
        }

        const user = await tenantClient.utilisateur.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            prenom: true,
            nom: true,
            role: true,
            estActif: true,
          },
        });

        if (!user) return done(null, false);
        if (!user.estActif) {
          return done(null, false, { message: 'Compte désactivé' });
        }

        return done(null, {
          ...user,
          scope: 'TENANT',
          schemaName: jwt_payload.schemaName,
          etablissementId: jwt_payload.etablissementId,
        });
      }

      // ─── Payload sans scope : fallback tenant (compat) ───
      // Si vos anciens tokens n'ont pas encore de scope, vous pouvez soit
      // refuser (plus sûr), soit tenter une résolution. Ici on refuse.
      return done(null, false, { message: 'Scope manquant dans le token' });
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;