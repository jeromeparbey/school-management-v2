// backend/src/server.ts

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import passport from "passport";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

// Configurations
import { connectDB, prisma } from "./config/db";
import "./config/passport";

// Middlewares
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";
import { rbacMiddleware } from "./middleware/rbac";
import { auditMiddleware } from "./middleware/audit";

// ============================================
// ESM __dirname polyfill
// ============================================
const currentFilename =
  typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const currentDirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(currentFilename);

// ============================================
// CONFIGURATION
// ============================================
const PORT = Number(process.env.PORT) || 5001;
const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || "development";
const API_PREFIX = "/api/v1";

// ============================================
// STOCKAGE DES ROUTES MONTÉES (pour log final)
// ============================================

interface MountedRoute {
  method: string;
  path: string;
  type: "public" | "protected";
  roles: string[];
}

const mountedRoutes: MountedRoute[] = [];

// ============================================
// EXPRESS APP
// ============================================
const app = express();

// ============================================
// SOCKET.IO — TYPES + HELPERS
// ============================================

interface SocketAuthPayload {
  userId: string;
  role?: string;
  scope?: "GLOBAL" | "TENANT";
  etablissementId?: string;
  schemaName?: string;
}

/**
 * Décoder le JWT depuis le handshake socket.
 * Retourne le payload complet (scope, schemaName, etc.).
 */
function getAuthPayloadFromSocket(
  socket: import("socket.io").Socket
): SocketAuthPayload | null {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return null;

    const secret = process.env.JWT_SECRET || "default_secret";
    const payload = jwt.verify(token, secret) as SocketAuthPayload;
    return payload.userId ? payload : null;
  } catch (err) {
    console.warn("⚠️ Socket auth token invalide", err);
    return null;
  }
}

/**
 * Récupère le rôle d'un utilisateur connecté au socket.
 * Route vers le BON client Prisma selon le scope :
 *  - GLOBAL → globalPrisma.utilisateurGlobal
 *  - TENANT → getTenantClient(schemaName).utilisateur
 */
async function fetchUserRole(
  payload: SocketAuthPayload
): Promise<string | null> {
  // ── Scope GLOBAL : catalogue (SUPER_ADMIN, ADMIN_SYSTEME)
  if (payload.scope === "GLOBAL") {
    const { globalPrisma } = await import("./config/global-db");
    const user = await globalPrisma.utilisateurGlobal.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });
    return user?.role ?? null;
  }

  // ── Scope TENANT : établissement
  if (payload.scope === "TENANT" && payload.schemaName) {
    const { getTenantClient } = await import("./config/tenant-db");
    const tenantClient = await getTenantClient(payload.schemaName);
    if (!tenantClient) return null;

    const user = await tenantClient.utilisateur.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });
    return user?.role ?? null;
  }

  return null;
}

// ============================================
// HTTP SERVER + SOCKET.IO
// ============================================
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ============================================
// SOCKET.IO — HANDLERS
// ============================================
io.on("connection", (socket) => {
  console.log(`✅ Client connecté : ${socket.id}`);
  console.log(`📡 Transport: ${socket.conn.transport.name}`);

  const payload = getAuthPayloadFromSocket(socket);

  if (payload) {
    const { userId } = payload;
    socket.join(`user:${userId}`);
    console.log(`🔗 Socket ${socket.id} rejoint la room user:${userId}`);

    socket.emit("authenticated", {
      userId,
      message: "Authentification Socket réussie",
      timestamp: new Date().toISOString(),
    });

    // 🔥 Récupération du rôle via le BON client selon le scope
    fetchUserRole(payload)
      .then((role) => {
        if (role) {
          socket.join(`role:${role}`);
          console.log(`🔗 Socket ${socket.id} rejoint la room role:${role}`);
          socket.emit("role-assigned", { role });

          // Bonus : room par établissement (uniquement pour TENANT)
          if (payload.scope === "TENANT" && payload.etablissementId) {
            socket.join(`etablissement:${payload.etablissementId}`);
            console.log(
              `🔗 Socket ${socket.id} rejoint la room etablissement:${payload.etablissementId}`
            );
          }
        }
      })
      .catch((err: Error) => {
        console.error("❌ Erreur lors de la récupération du rôle:", err);
      });
  } else {
    console.log(`⚠️ Socket ${socket.id} non authentifié`);
  }

  socket.on("join-room", (room: string) => {
    if (typeof room === "string" && room.length > 0) {
      socket.join(room);
      socket.emit("room-joined", { room });
    }
  });

  socket.on("leave-room", (room: string) => {
    if (typeof room === "string" && room.length > 0) {
      socket.leave(room);
      socket.emit("room-left", { room });
    }
  });

  socket.on("ping", (callback) => {
    if (typeof callback === "function") {
      callback({ timestamp: Date.now() });
    }
  });

  socket.on("error", (error) => {
    console.error(`❌ Erreur socket ${socket.id}:`, error);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Client déconnecté : ${socket.id} (${reason})`);
  });

  socket.on("disconnecting", (reason) => {
    console.log(`🔄 Client en déconnexion : ${socket.id} (${reason})`);
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });
  });
});

export { io };

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: {
    status: 429,
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    exposedHeaders: ["X-Total-Count", "Content-Disposition"],
  })
);

app.use(compression());

app.use(
  morgan(NODE_ENV === "development" ? "dev" : "combined", {
    skip: (req) => req.path === "/health" || req.path === "/",
  })
);

app.use(
  express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// Rate limiting global sur /api (hors auth qui a ses propres limiteurs)
app.use("/api", limiter);

// ============================================
// FICHIERS STATIQUES
// ============================================
const uploadsDir = path.join(currentDirname, "../uploads");
const bulletinsDir = path.join(currentDirname, "../bulletins");
const recusDir = path.join(currentDirname, "../recus");

if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
if (!existsSync(bulletinsDir)) mkdirSync(bulletinsDir, { recursive: true });
if (!existsSync(recusDir)) mkdirSync(recusDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));
app.use("/bulletins", express.static(bulletinsDir));
app.use("/recus", express.static(recusDir));
app.use("/images", express.static(uploadsDir));

// ============================================
// ROUTES PUBLIQUES DE BASE
// ============================================

app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "🏫 School Management API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    socket: {
      connected: io.sockets.sockets.size,
    },
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
    socket: {
      connected: io.sockets.sockets.size,
    },
    database: "connected",
  });
});

// ============================================
// HELPERS
// ============================================

async function dynamicImport(filePath: string): Promise<any> {
  const moduleUrl = pathToFileURL(filePath).href;
  return await import(moduleUrl);
}

/**
 * Cherche le fichier de routes d'un module (ex: etablissement.routes.ts, routes.ts, ...)
 * Retourne null si aucun fichier valide.
 */
function findRoutesFile(dir: string, folderName: string): string | null {
  const possibleFiles = [
    `${folderName}.routes.ts`,
    `${folderName}.routes.js`,
    `index.routes.ts`,
    `index.routes.js`,
    `routes.ts`,
    `routes.js`,
  ];

  for (const file of possibleFiles) {
    const fullPath = path.join(dir, file);
    try {
      if (existsSync(fullPath) && statSync(fullPath).isFile()) {
        return fullPath;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Vérifie si un router est valide (pas vide, pas corrompu).
 * Détecte le cas "argument handler is required" à l'avance.
 */
function isValidRouter(router: any): { valid: boolean; reason?: string } {
  if (!router) {
    return { valid: false, reason: "routeur non exporté (default manquant)" };
  }
  if (typeof router !== "function") {
    return { valid: false, reason: "default export n'est pas une fonction/routeur" };
  }
  // Vérifier que le routeur a bien une stack de routes
  const stack = router.stack;
  if (!Array.isArray(stack)) {
    return { valid: false, reason: "routeur invalide (stack manquante)" };
  }
  if (stack.length === 0) {
    return { valid: false, reason: "routeur vide (aucune route définie)" };
  }
  return { valid: true };
}

/**
 * Enregistre une route pour le log final.
 */
function recordRoute(
  method: string,
  fullPath: string,
  isPublic: boolean,
  roles: string[]
): void {
  mountedRoutes.push({
    method,
    path: fullPath,
    type: isPublic ? "public" : "protected",
    roles,
  });
}

// ============================================
// CHARGEMENT DES ROUTES D'AUTHENTIFICATION
// ============================================
async function loadAuthRoutes(): Promise<void> {
  console.log("\n🔐 Chargement des routes d'authentification...");

  const authPaths = [
    path.join(currentDirname, "modules", "auth", "auth.routes.ts"),
    path.join(currentDirname, "modules", "auth", "auth.routes.js"),
    path.join(currentDirname, "modules", "auth", "index.routes.ts"),
    path.join(currentDirname, "modules", "auth", "index.routes.js"),
  ];

  let loaded = false;

  for (const authPath of authPaths) {
    try {
      if (existsSync(authPath)) {
        const authModule = await dynamicImport(authPath);
        const router = authModule.default;

        const check = isValidRouter(router);
        if (!check.valid) {
          console.warn(`   ⚠️ Auth: ${check.reason}`);
          continue;
        }

        app.use(`${API_PREFIX}/auth`, router);
        console.log(`✅ Route auth montée: ${API_PREFIX}/auth`);

        // Enregistrer les routes auth
        recordRoute("POST", `${API_PREFIX}/auth/register`, true, []);
        recordRoute("POST", `${API_PREFIX}/auth/login`, true, []);
        recordRoute("POST", `${API_PREFIX}/auth/login/super-admin`, true, []);
        recordRoute("POST", `${API_PREFIX}/auth/logout`, true, []);
        recordRoute("GET", `${API_PREFIX}/auth/me`, false, []);
        recordRoute("POST", `${API_PREFIX}/auth/change-password`, false, []);

        loaded = true;
        break;
      }
    } catch (error: any) {
      console.error(
        `❌ Erreur import auth (${path.basename(authPath)}):`,
        error.message
      );
    }
  }

  if (!loaded) {
    console.warn("⚠️ Routes d'authentification non trouvées");
  }
}

// ============================================
// CHARGEMENT D'UN MODULE DE ROUTES
// ============================================

/**
 * Charge un module de routes à partir de son chemin de dossier.
 * Applique auth + audit + rbac selon les métadonnées exportées.
 */
async function loadModuleRoutes(
  moduleDir: string,
  moduleName: string,
  routePrefix?: string
): Promise<void> {
  const indent = routePrefix ? "  " : "";
  console.log(`\n${indent}🔍 Traitement du module: ${moduleName}`);

  const filePath = findRoutesFile(moduleDir, moduleName);
  if (!filePath) {
    console.log(`${indent}   ⚠️ Aucun fichier de routes trouvé pour ${moduleName}`);
    return;
  }
  console.log(`${indent}   📄 Fichier trouvé: ${path.basename(filePath)}`);

  let routeModule: any;
  try {
    routeModule = await dynamicImport(filePath);
  } catch (error: any) {
    console.error(
      `${indent}   ❌ Erreur import ${moduleName}: ${error.message}`
    );
    return;
  }

  const router = routeModule.default;

  // ✅ Vérification AVANT le mount (évite "argument handler is required")
  const check = isValidRouter(router);
  if (!check.valid) {
    console.error(`${indent}   ❌ ${moduleName}: ${check.reason}`);
    return;
  }

  const isPublic: boolean = routeModule.publicRoute === true;
  const requiredRoles: string[] = routeModule.roles || [];
  const basePath: string = routeModule.basePath || `/${moduleName}`;
  const disableAudit: boolean = routeModule.disableAudit === true;

  console.log(`${indent}   📋 Métadonnées:`);
  console.log(`${indent}      - Base path: ${basePath}`);
  console.log(`${indent}      - Public: ${isPublic}`);
  console.log(
    `${indent}      - Rôles: ${requiredRoles.length > 0 ? requiredRoles.join(", ") : "Aucun"}`
  );
  console.log(`${indent}      - Audit: ${disableAudit ? "Désactivé" : "Activé"}`);

  let finalRouter = router;

  if (!isPublic) {
    const protectedRouter = express.Router();
    protectedRouter.use(authMiddleware);
    console.log(`${indent}      🔒 Authentification appliquée`);

    if (!disableAudit) {
      protectedRouter.use(auditMiddleware(basePath, moduleName));
      console.log(`${indent}      📝 Audit appliqué`);
    }

    if (requiredRoles.length > 0) {
      protectedRouter.use(rbacMiddleware(requiredRoles));
      console.log(`${indent}      👤 RBAC appliqué: [${requiredRoles.join(", ")}]`);
    }

    protectedRouter.use(router);
    finalRouter = protectedRouter;
  } else {
    console.log(`${indent}      🔓 Route publique`);
  }

  const fullPath = `${API_PREFIX}${basePath}`;
  app.use(fullPath, finalRouter);

  const routeType = isPublic
    ? "🔓 publique"
    : `🔒 protégée${requiredRoles.length > 0 ? ` [${requiredRoles.join(", ")}]` : ""}`;
  console.log(`${indent}   ✅ Route montée: ${fullPath} (${routeType})`);

  recordRoute("ALL", fullPath, isPublic, requiredRoles);
}

// ============================================
// CHARGEMENT DYNAMIQUE DE TOUS LES MODULES
// ============================================
async function loadRoutes(): Promise<void> {
  const modulesDir = path.join(currentDirname, "modules");

  console.log(`\n📁 Recherche des routes dans: ${modulesDir}`);

  if (!existsSync(modulesDir)) {
    console.warn(`⚠️ Le dossier modules n'existe pas: ${modulesDir}`);
    return;
  }

  const entries = readdirSync(modulesDir, { withFileTypes: true });
  const folders = entries
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => name !== "auth");

  console.log(`📁 ${folders.length} dossiers trouvés dans modules`);

  for (const folder of folders) {
    const folderPath = path.join(modulesDir, folder);

    // ✅ Chercher un fichier de routes DIRECTEMENT dans le dossier
    const hasDirectRoutes = findRoutesFile(folderPath, folder) !== null;

    if (hasDirectRoutes) {
      await loadModuleRoutes(folderPath, folder);
      continue;
    }

    // ✅ Sinon, explorer les SOUS-DOSSIERS (ex: catalogue/etablissement/)
    const subEntries = readdirSync(folderPath, { withFileTypes: true });
    const subFolders = subEntries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => !name.startsWith("."));

    if (subFolders.length === 0) {
      console.log(`\n🔍 Traitement du module: ${folder}`);
      console.log(`   ⚠️ Aucun fichier de routes trouvé pour ${folder}`);
      continue;
    }

    console.log(
      `\n📂 Module conteneur détecté: ${folder} (${subFolders.length} sous-modules)`
    );

    for (const subFolder of subFolders) {
      const subFolderPath = path.join(folderPath, subFolder);
      await loadModuleRoutes(subFolderPath, subFolder, folder);
    }
  }
}

// ============================================
// AFFICHAGE FINAL DES ROUTES MONTÉES
// ============================================
function printMountedRoutes(): void {
  console.log("\n" + "=".repeat(70));
  console.log("📚 ROUTES DISPONIBLES");
  console.log("=".repeat(70));

  if (mountedRoutes.length === 0) {
    console.log("   ⚠️ Aucune route montée");
    console.log("=".repeat(70) + "\n");
    return;
  }

  const sorted = [...mountedRoutes].sort((a, b) => a.path.localeCompare(b.path));
  const publicRoutes = sorted.filter((r) => r.type === "public");
  const protectedRoutes = sorted.filter((r) => r.type === "protected");

  if (publicRoutes.length > 0) {
    console.log("\n🔓 Routes PUBLIQUES :");
    publicRoutes.forEach((r) => {
      console.log(`   ${r.method.padEnd(6)} ${r.path}`);
    });
  }

  if (protectedRoutes.length > 0) {
    console.log("\n🔒 Routes PROTÉGÉES :");
    protectedRoutes.forEach((r) => {
      const rolesInfo = r.roles.length > 0 ? ` [${r.roles.join(", ")}]` : "";
      console.log(`   ${r.method.padEnd(6)} ${r.path}${rolesInfo}`);
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log(
    `📊 Total: ${mountedRoutes.length} préfixe(s) monté(s) ` +
      `(${publicRoutes.length} public(s), ${protectedRoutes.length} protégé(s))`
  );
  console.log("=".repeat(70) + "\n");
}

// ============================================
// BOOTSTRAP
// ============================================
async function bootstrap(): Promise<void> {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 CHARGEMENT DES ROUTES");
  console.log("=".repeat(70));

  // 1. Connexion DB
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ Erreur de connexion à la base de données:", err);
    process.exit(1);
  }

  // 2. Auth routes EN PREMIER
  await loadAuthRoutes();

  // 3. Autres routes
  await loadRoutes();

  // 4. 404 APRÈS le chargement des routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: 404,
      message: "Route non trouvée",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });

  // 5. Gestion d'erreurs EN DERNIER
  app.use(errorHandler);

  console.log("\n" + "=".repeat(70));
  console.log("✅ CHARGEMENT DES ROUTES TERMINÉ");
  console.log("=".repeat(70));

  // 6. Démarrage du serveur
  httpServer.listen(PORT, () => {
    console.log("\n" + "=".repeat(70));
    console.log(`🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS`);
    console.log("=".repeat(70));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environnement: ${NODE_ENV}`);
    console.log(`📊 API: http://localhost:${PORT}${API_PREFIX}`);
    console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
    console.log(`💾 Base de données: PostgreSQL avec Prisma`);
    console.log(`👤 Client URL: ${CLIENT_URL}`);
    console.log(`📁 Dossiers:`);
    console.log(`   - Uploads: ${uploadsDir}`);
    console.log(`   - Bulletins: ${bulletinsDir}`);
    console.log(`   - Reçus: ${recusDir}`);
    console.log("=".repeat(70));

    // 7. Liste dynamique des routes montées
    printMountedRoutes();
  });
}

// ============================================
// GESTION DE L'ARRÊT GRACIEUX
// ============================================
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Signal ${signal} reçu, arrêt du serveur...`);

  io.close(() => {
    console.log("🔌 Socket.IO fermé");
  });

  try {
    await prisma.$disconnect();
    console.log("💾 Base de données déconnectée");
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion:", error);
  }

  httpServer.close(() => {
    console.log("✅ Serveur fermé avec succès");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⏰ Forçage de la fermeture du serveur");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("💥 Erreur non capturée:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Rejet non géré:", reason);
  gracefulShutdown("unhandledRejection");
});

// ============================================
// LANCEMENT
// ============================================
bootstrap();

export default app;