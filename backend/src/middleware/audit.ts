// backend/src/middleware/audit.ts

import { Request, Response, NextFunction } from 'express';
import { getTenantClient } from '../config/tenant-db.js';

/**
 * Middleware d'audit multi-scope.
 *
 * - Scope TENANT → écrit dans `logs_audit` du schéma du tenant
 * - Scope GLOBAL → skip (pas de table LogAudit dans le catalogue global)
 * - Pas d'utilisateur authentifié → skip
 * - Toute erreur d'audit → catch silencieux (ne bloque JAMAIS la requête)
 *
 * ⚠️ On enregistre APRÈS la réponse pour ne pas bloquer le flux.
 */
export const auditMiddleware = (
  resourceName: string,
  actionName?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Hook sur res.json et res.send pour logger après la réponse
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = function (body: any) {
      void logAudit(req, res, body, resourceName);
      return originalJson(body);
    };

    res.send = function (body: any) {
      void logAudit(req, res, body, resourceName);
      return originalSend(body);
    };

    next();
  };
};

// ============================================================
// LOGIQUE INTERNE
// ============================================================

async function logAudit(
  req: Request,
  res: Response,
  body: any,
  resourceName: string
): Promise<void> {
  try {
    const user = req.user;

    // Pas d'utilisateur authentifié → rien à logger
    if (!user || !user.userId) return;

    const scope = user.scope;

    // ⚠️ Scope GLOBAL → pas de table LogAudit dans le catalogue global
    // (à activer plus tard si tu ajoutes un modèle LogAuditGlobal)
    if (scope === 'GLOBAL') {
      return;
    }

    // Scope TENANT → on écrit dans le schéma du tenant
    if (scope !== 'TENANT' || !user.schemaName) {
      return;
    }

    const tenantClient = await getTenantClient(user.schemaName);
    if (!tenantClient) {
      console.warn(
        `⚠️ [AUDIT] tenantClient introuvable pour ${user.schemaName}`
      );
      return;
    }

    // ⚠️ Vérifier que le modèle logAudit existe (scope du tenant)
    if (!(tenantClient as any).logAudit?.create) {
      console.warn(
        `⚠️ [AUDIT] Modèle logAudit introuvable dans ${user.schemaName}`
      );
      return;
    }

    const payload = {
      utilisateurId: user.userId,
      action: `${req.method} ${req.originalUrl}`,
      entite: resourceName || 'UNKNOWN',
      entiteId: typeof req.params.id === 'string' ? req.params.id : null,
      statut: res.statusCode < 400 ? 'SUCCES' : 'ECHEC',
      messageErreur:
        res.statusCode >= 400 && body?.message ? String(body.message) : null,
      ipAdresse:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        req.ip ??
        null,
      userAgent: req.headers['user-agent'] ?? null,
    };

    await tenantClient.logAudit.create({ data: payload });
  } catch (err) {
    // ⚠️ On ne fait JAMAIS planter la requête à cause de l'audit
    console.error('❌ [AUDIT] erreur silencieuse:', err);
  }
}