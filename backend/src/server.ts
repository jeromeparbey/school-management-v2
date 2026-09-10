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
// Si tsx exécute en CJS, __dirname existe déjà. On le protège avec un check.
const currentFilename = typeof __filename !== "undefined"
  ? __filename
  : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(currentFilename);

// ============================================
// CONFIGURATION
// ============================================
const PORT = Number(process.env.PORT) || 5001;
const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || "development";
const API_PREFIX = "/api/v1";

// ============================================
// EXPRESS APP
// ============================================
const app = express();

// ============================================
// FONCTION POUR EXTRAIRE USER_ID DU SOCKET
// ============================================
function getUserIdFromSocket(socket: import("socket.io").Socket): string | null {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return null;

    const secret = process.env.JWT_SECRET || "default_secret";
    const payload = jwt.verify(token, secret) as { userId?: string };
    return payload.userId ?? null;
  } catch (err) {
    console.warn("⚠️ Socket auth token invalide", err);
    return null;
  }
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
// GESTION DES CONNEXIONS SOCKET.IO
// ============================================
io.on("connection", (socket) => {
  console.log(`✅ Client connecté : ${socket.id}`);
  console.log(`📡 Transport: ${socket.conn.transport.name}`);

  const userId = getUserIdFromSocket(socket);
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`🔗 Socket ${socket.id} rejoint la room user:${userId}`);

    socket.emit("authenticated", {
      userId,
      message: "Authentification Socket réussie",
      timestamp: new Date().toISOString(),
    });

    prisma.utilisateur
      .findUnique({
        where: { id: userId },
        select: { role: true },
      })
      .then((user: { role: string } | null) => {
        if (user) {
          const role = user.role;
          socket.join(`role:${role}`);
          console.log(`🔗 Socket ${socket.id} rejoint la room role:${role}`);
          socket.emit("role-assigned", { role });
        }
      })
      .catch((err: Error) => {
        console.error("Erreur lors de la récupération du rôle:", err);
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

// ============================================
// EXPORT DE IO POUR LES AUTRES MODULES
// ============================================
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
// ROUTES PUBLIQUES
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
// HELPER : import dynamique cross-platform
// ============================================
async function dynamicImport(filePath: string): Promise<any> {
  const moduleUrl = pathToFileURL(filePath).href;
  return await import(moduleUrl);
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

        if (router) {
          app.use(`${API_PREFIX}/auth`, router);
          console.log(`✅ Route auth montée: ${API_PREFIX}/auth`);
          loaded = true;
          break;
        }
      }
    } catch (error: any) {
      console.error(`❌ Erreur import auth (${path.basename(authPath)}):`, error.message);
    }
  }

  if (!loaded) {
    console.warn("⚠️ Routes d'authentification non trouvées");
  }
}

// ============================================
// CHARGEMENT DYNAMIQUE DES AUTRES ROUTES
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
    .filter((name) => name !== "auth"); // ✅ auth déjà monté

  console.log(`📁 ${folders.length} dossiers trouvés dans modules`);

  for (const folder of folders) {
    console.log(`\n🔍 Traitement du module: ${folder}`);

    const possibleFiles = [
      `${folder}.routes.ts`,
      `${folder}.routes.js`,
      `index.routes.ts`,
      `index.routes.js`,
      `routes.ts`,
      `routes.js`,
    ];

    let filePath: string | null = null;

    for (const file of possibleFiles) {
      const fullPath = path.join(modulesDir, folder, file);
      try {
        if (existsSync(fullPath) && statSync(fullPath).isFile()) {
          filePath = fullPath;
          console.log(`   📄 Fichier trouvé: ${file}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!filePath) {
      console.log(`   ⚠️ Aucun fichier de routes trouvé pour ${folder}`);
      continue;
    }

    try {
      const routeModule = await dynamicImport(filePath);
      const router = routeModule.default;

      if (!router) {
        console.warn(`   ⚠️ ${folder}: pas de routeur exporté`);
        continue;
      }

      const isPublic = routeModule.publicRoute === true;
      const requiredRoles: string[] = routeModule.roles || [];
      const basePath: string = routeModule.basePath || `/${folder}`;
      const disableAudit: boolean = routeModule.disableAudit === true;

      console.log(`   📋 Métadonnées:`);
      console.log(`      - Base path: ${basePath}`);
      console.log(`      - Public: ${isPublic}`);
      console.log(`      - Rôles: ${requiredRoles.length > 0 ? requiredRoles.join(", ") : "Aucun"}`);
      console.log(`      - Audit: ${disableAudit ? "Désactivé" : "Activé"}`);

      let finalRouter = router;

      if (!isPublic) {
        const protectedRouter = express.Router();
        protectedRouter.use(authMiddleware);
        console.log(`      🔒 Authentification appliquée`);

        if (!disableAudit) {
          protectedRouter.use(auditMiddleware(basePath, folder));
          console.log(`      📝 Audit appliqué`);
        }

        if (requiredRoles.length > 0) {
          protectedRouter.use(rbacMiddleware(requiredRoles));
          console.log(`      👤 RBAC appliqué: [${requiredRoles.join(", ")}]`);
        }

        protectedRouter.use(router);
        finalRouter = protectedRouter;
      } else {
        console.log(`      🔓 Route publique`);
      }

      const fullPath = `${API_PREFIX}${basePath}`;
      app.use(fullPath, finalRouter);

      const routeType = isPublic
        ? "🔓 publique"
        : `🔒 protégée${requiredRoles.length > 0 ? ` [${requiredRoles.join(", ")}]` : ""}`;
      console.log(`   ✅ Route montée: ${fullPath} (${routeType})`);
    } catch (error: any) {
      console.error(`   ❌ Erreur chargement route ${folder}:`, error.message);
      if (NODE_ENV === "development") {
        console.error(error.stack);
      }
    }
  }
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

  // 2. Auth routes EN PREMIER (les plus critiques)
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
  console.log("=".repeat(70) + "\n");

  // 6. Démarrage du serveur
  httpServer.listen(PORT, () => {
    console.log("=".repeat(70));
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
    console.log(`📚 Routes disponibles:`);
    console.log(`   POST   ${API_PREFIX}/auth/register`);
    console.log(`   POST   ${API_PREFIX}/auth/login`);
    console.log(`   POST   ${API_PREFIX}/auth/verify-otp`);
    console.log(`   POST   ${API_PREFIX}/auth/resend-otp`);
    console.log(`   POST   ${API_PREFIX}/auth/refresh`);
    console.log(`   POST   ${API_PREFIX}/auth/logout`);
    console.log(`   POST   ${API_PREFIX}/auth/forgot-password`);
    console.log(`   POST   ${API_PREFIX}/auth/reset-password`);
    console.log(`   GET    ${API_PREFIX}/auth/me`);
    console.log(`   PUT    ${API_PREFIX}/auth/me`);
    console.log(`   POST   ${API_PREFIX}/auth/change-password`);
    console.log("=".repeat(70));
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
    console.error("❌ Erreur lors de la déconnexion de la base de données:", error);
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

// ============================================
// EXPORT
// ============================================
export default app;