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

  // Authentification du socket
  const userId = getUserIdFromSocket(socket);
  if (userId) {
    // Rejoindre la room personnelle de l'utilisateur
    socket.join(`user:${userId}`);
    console.log(`🔗 Socket ${socket.id} rejoint la room user:${userId}`);
    
    // Envoyer confirmation
    socket.emit("authenticated", { 
      userId, 
      message: "Authentification Socket réussie",
      timestamp: new Date().toISOString()
    });

    // Récupérer les rôles de l'utilisateur depuis la base de données
    prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { role: true }
    }).then((user: { role: string } | null) => {
      if (user) {
        const role = user.role;
        socket.join(`role:${role}`);
        console.log(`🔗 Socket ${socket.id} rejoint la room role:${role}`);
        socket.emit("role-assigned", { role });
      }
    }).catch((err: Error) => {
      console.error("Erreur lors de la récupération du rôle:", err);
    });
  } else {
    console.log(`⚠️ Socket ${socket.id} non authentifié`);
  }

  // Événements personnalisés
  socket.on("join-room", (room: string) => {
    if (typeof room === "string" && room.length > 0) {
      socket.join(room);
      console.log(`📢 Socket ${socket.id} a rejoint la room: ${room}`);
      socket.emit("room-joined", { room });
    }
  });

  socket.on("leave-room", (room: string) => {
    if (typeof room === "string" && room.length > 0) {
      socket.leave(room);
      console.log(`📢 Socket ${socket.id} a quitté la room: ${room}`);
      socket.emit("room-left", { room });
    }
  });

  // Ping/Pong pour maintenir la connexion
  socket.on("ping", (callback) => {
    if (typeof callback === "function") {
      callback({ timestamp: Date.now() });
    }
  });

  // Gestion des erreurs
  socket.on("error", (error) => {
    console.error(`❌ Erreur socket ${socket.id}:`, error);
  });

  // Déconnexion
  socket.on("disconnect", (reason) => {
    console.log(`❌ Client déconnecté : ${socket.id} (${reason})`);
  });

  socket.on("disconnecting", (reason) => {
    console.log(`🔄 Client en déconnexion : ${socket.id} (${reason})`);
    // Nettoyer les rooms
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
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

// Rate Limiting
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: "Trop de tentatives de connexion, réessayez dans 15 minutes.",
  },
  skipSuccessfulRequests: true,
});

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  exposedHeaders: ["X-Total-Count", "Content-Disposition"],
}));

app.use(compression());
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined", {
  skip: (req) => req.path === "/health" || req.path === "/",
}));

app.use(express.json({ 
  limit: "50mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: "50mb" 
}));

app.use(cookieParser());
app.use(passport.initialize());

// Rate limiting global
app.use("/api", limiter);

// ============================================
// CONNEXION À LA BASE DE DONNÉES
// ============================================
connectDB().catch((err) => {
  console.error("❌ Erreur de connexion à la base de données:", err);
  process.exit(1);
});

// ============================================
// FICHIERS STATIQUES
// ============================================
const uploadsDir = path.join(__dirname, "../uploads");
const bulletinsDir = path.join(__dirname, "../bulletins");
const recusDir = path.join(__dirname, "../recus");

// Créer les dossiers s'ils n'existent pas
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
if (!existsSync(bulletinsDir)) {
  mkdirSync(bulletinsDir, { recursive: true });
}
if (!existsSync(recusDir)) {
  mkdirSync(recusDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));
app.use("/bulletins", express.static(bulletinsDir));
app.use("/recus", express.static(recusDir));
app.use("/images", express.static(uploadsDir));

// ============================================
// ROUTES PUBLIQUES
// ============================================

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "🏫 School Management API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    socket: {
      connected: io.engine.clientsCount,
      clients: io.engine.clientsCount,
    }
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
      connected: io.engine.clientsCount,
    },
    database: "connected"
  });
});

// ============================================
// CHARGEMENT DYNAMIQUE DES ROUTES AVEC __dirname
// ============================================
async function loadRoutes() {
  const modulesDir = path.join(__dirname, "modules");
  
  console.log(`\n📁 Recherche des routes dans: ${modulesDir}`);
  
  // Vérifier si le dossier modules existe
  if (!existsSync(modulesDir)) {
    console.warn(`⚠️ Le dossier modules n'existe pas: ${modulesDir}`);
    return;
  }

  // Lire tous les dossiers dans modules
  const entries = readdirSync(modulesDir, { withFileTypes: true });
  const folders = entries
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith("."));

  console.log(`📁 ${folders.length} dossiers trouvés dans modules`);

  for (const folder of folders) {
    console.log(`\n🔍 Traitement du module: ${folder}`);

    // Rechercher les fichiers de routes possibles
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
      // Importer dynamiquement le module
      const routeModule = await import(filePath);
      const router = routeModule.default;

      if (!router) {
        console.warn(`   ⚠️ ${folder}: pas de routeur exporté`);
        continue;
      }

      // Récupérer les métadonnées
      const isPublic = routeModule.publicRoute === true;
      const requiredRoles = routeModule.roles || [];
      const basePath = routeModule.basePath || `/${folder}`;
      const disableAudit = routeModule.disableAudit === true;

      console.log(`   📋 Métadonnées:`);
      console.log(`      - Base path: ${basePath}`);
      console.log(`      - Public: ${isPublic}`);
      console.log(`      - Rôles: ${requiredRoles.length > 0 ? requiredRoles.join(', ') : 'Aucun'}`);
      console.log(`      - Audit: ${disableAudit ? 'Désactivé' : 'Activé'}`);

      // Construction du routeur final
      let finalRouter = router;

      if (!isPublic) {
        const protectedRouter = express.Router();
        
        // Appliquer l'authentification
        protectedRouter.use(authMiddleware);
        console.log(`      🔒 Authentification appliquée`);
        
        // Appliquer l'audit si non désactivé
        if (!disableAudit) {
          protectedRouter.use(auditMiddleware(basePath, folder));
          console.log(`      📝 Audit appliqué`);
        }
        
        // Appliquer RBAC si des rôles sont spécifiés
        if (requiredRoles.length > 0) {
          protectedRouter.use(rbacMiddleware(requiredRoles));
          console.log(`      👤 RBAC appliqué: [${requiredRoles.join(', ')}]`);
        }
        
        protectedRouter.use(router);
        finalRouter = protectedRouter;
      } else {
        console.log(`      🔓 Route publique`);
      }

      // Monter la route
      const fullPath = `${API_PREFIX}${basePath}`;
      app.use(fullPath, finalRouter);
      
      const routeType = isPublic ? '🔓 publique' : `🔒 protégée${requiredRoles.length > 0 ? ` [${requiredRoles.join(', ')}]` : ''}`;
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
// CHARGEMENT DES ROUTES D'AUTHENTIFICATION
// ============================================
async function loadAuthRoutes() {
  console.log("\n🔐 Chargement des routes d'authentification...");
  
  const authPaths = [
    path.join(__dirname, "modules", "auth", "auth.routes.ts"),
    path.join(__dirname, "modules", "auth", "auth.routes.js"),
    path.join(__dirname, "modules", "auth", "index.routes.ts"),
    path.join(__dirname, "modules", "auth", "index.routes.js"),
  ];

  let loaded = false;

  for (const authPath of authPaths) {
    try {
      if (existsSync(authPath)) {
        const authModule = await import(authPath);
        const router = authModule.default;
        
        if (router) {
          app.use(`${API_PREFIX}/auth`, authLimiter, router);
          console.log(`✅ Route d'authentification chargée: ${API_PREFIX}/auth 🔓 (publique) [rate limit: 5/15min]`);
          loaded = true;
          break;
        }
      }
    } catch (error) {
      continue;
    }
  }

  if (!loaded) {
    console.warn("⚠️ Routes d'authentification non trouvées");
  }
}

// ============================================
// LANCER LE CHARGEMENT DES ROUTES (FONCTION IMMÉDIATE)
// ============================================
(async () => {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 CHARGEMENT DES ROUTES");
  console.log("=".repeat(70));

  // Charger les routes d'authentification d'abord
  await loadAuthRoutes();

  // Puis charger toutes les autres routes
  await loadRoutes();

  console.log("\n" + "=".repeat(70));
  console.log("✅ CHARGEMENT DES ROUTES TERMINÉ");
  console.log("=".repeat(70) + "\n");
})();

// ============================================
// ROUTE 404
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: "Route non trouvée",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// MIDDLEWARE DE GESTION DES ERREURS
// ============================================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Erreur serveur:", err);
  
  // Erreurs de validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      message: "Erreur de validation",
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Erreurs Prisma
  if (err.code && err.code.startsWith("P")) {
    const prismaErrors: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: "Un enregistrement avec ces données existe déjà" },
      P2025: { status: 404, message: "Enregistrement non trouvé" },
      P2003: { status: 400, message: "Violation de contrainte de clé étrangère" },
      P2014: { status: 400, message: "Violation de contrainte de relation" },
    };
    
    const prismaError = prismaErrors[err.code];
    if (prismaError) {
      return res.status(prismaError.status).json({
        status: prismaError.status,
        message: prismaError.message,
        code: err.code,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Erreur JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Token invalide ou expiré",
      timestamp: new Date().toISOString(),
    });
  }

  // Erreur par défaut
  const status = err.status || 500;
  const response: any = {
    status,
    message: err.message || "Erreur interne du serveur",
    timestamp: new Date().toISOString(),
  };

  if (NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
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
  console.log(`   - Uploads: ${path.join(__dirname, "../uploads")}`);
  console.log(`   - Bulletins: ${path.join(__dirname, "../bulletins")}`);
  console.log(`   - Reçus: ${path.join(__dirname, "../recus")}`);
  console.log("=".repeat(70));
  console.log(`📚 Routes disponibles:`);
  console.log(`   POST   ${API_PREFIX}/auth/login`);
  console.log(`   POST   ${API_PREFIX}/auth/register`);
  console.log(`   POST   ${API_PREFIX}/auth/verify-otp`);
  console.log(`   POST   ${API_PREFIX}/auth/refresh`);
  console.log(`   POST   ${API_PREFIX}/auth/logout`);
  console.log(`   GET    ${API_PREFIX}/eleves`);
  console.log(`   GET    ${API_PREFIX}/enseignants`);
  console.log(`   GET    ${API_PREFIX}/classes`);
  console.log(`   GET    ${API_PREFIX}/matieres`);
  console.log(`   GET    ${API_PREFIX}/bulletins`);
  console.log(`   GET    ${API_PREFIX}/paiements`);
  console.log(`   GET    ${API_PREFIX}/presences`);
  console.log(`   GET    ${API_PREFIX}/emplois-temps`);
  console.log(`   GET    ${API_PREFIX}/health`);
  console.log("=".repeat(70));
  console.log(`🔌 Socket.IO:`);
  console.log(`   - Transport: websocket, polling`);
  console.log(`   - Ping timeout: 60000ms`);
  console.log(`   - Ping interval: 25000ms`);
  console.log(`   - Rooms disponibles: user:*`, `role:*`);
  console.log("=".repeat(70));
});

// ============================================
// GESTION DE L'ARRÊT GRACIEUX
// ============================================
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Signal ${signal} reçu, arrêt du serveur...`);

  // Fermer Socket.IO
  io.close(() => {
    console.log("🔌 Socket.IO fermé");
  });

  // Fermer la connexion Prisma
  try {
    await prisma.$disconnect();
    console.log("💾 Base de données déconnectée");
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion de la base de données:", error);
  }

  // Fermer le serveur HTTP
  httpServer.close(() => {
    console.log("✅ Serveur fermé avec succès");
    process.exit(0);
  });

  // Forcer la fermeture après 10 secondes
  setTimeout(() => {
    console.error("⏰ Forçage de la fermeture du serveur");
    process.exit(1);
  }, 10000);
}

// Écoute des signaux
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("💥 Erreur non capturée:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Rejet non géré:", reason);
  gracefulShutdown("unhandledRejection");
});

// ============================================
// EXPORT DE L'APPLICATION
// ============================================
export default app;