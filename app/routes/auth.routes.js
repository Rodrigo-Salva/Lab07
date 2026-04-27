import { signup, signin, refreshToken, logout } from "../controllers/auth.controller.js";
import { checkDuplicateUsernameOrEmail } from "../middleware/verifySignUp.js";

export default function (app) {
  // Registro
  app.post("/api/auth/signup", checkDuplicateUsernameOrEmail, signup);

  // Login
  app.post("/api/auth/signin", signin);

  // Renovar Access Token
  app.post("/api/auth/refresh", refreshToken);

  // Logout (invalida el refresh token)
  app.post("/api/auth/logout", logout);
}
