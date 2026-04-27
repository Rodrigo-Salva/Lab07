import { allAccess, userBoard, moderatorBoard, adminBoard } from "../controllers/user.controller.js";
import { authJwt } from "../middleware/authJwt.js";

export default function (app) {
  // Pública: sin token
  app.get("/api/test/all", allAccess);

  // Protegida: cualquier usuario autenticado
  app.get("/api/test/user", [authJwt.verifyToken], userBoard);

  // Protegida: solo MODERATOR
  app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isModerator], moderatorBoard);

  // Protegida: solo ADMIN
  app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], adminBoard);
}