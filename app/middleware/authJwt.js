import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.user;
const Role = db.role;

// ── Verificar Access Token ──────────────────────────────
const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  token = token.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: token inválido o expirado" });
    }
    req.userId = decoded.id;
    next();
  });
};

// ── Verificar rol ADMIN ─────────────────────────────────
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, { include: Role });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    for (let role of user.roles) {
      if (role.name === "admin") return next();
    }

    return res.status(403).json({ message: "Requiere rol ADMIN" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Verificar rol MODERATOR ─────────────────────────────
const isModerator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, { include: Role });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    for (let role of user.roles) {
      if (role.name === "moderator") return next();
    }

    return res.status(403).json({ message: "Requiere rol MODERATOR" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const authJwt = { verifyToken, isAdmin, isModerator };