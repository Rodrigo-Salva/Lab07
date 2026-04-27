import 'dotenv/config';
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;


const errorResponse = (res, status, message, details = null) =>
  res.status(status).json({ success: false, message, ...(details && { details }) });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


export const signup = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { username, email, password, roles } = req.body || {};

    // Validaciones
    if (!username || !email || !password) {
      await t.rollback();
      return errorResponse(res, 400, "Faltan campos requeridos: username, email, password");
    }
    if (username.length < 3) {
      await t.rollback();
      return errorResponse(res, 400, "El username debe tener al menos 3 caracteres");
    }
    if (!isValidEmail(email)) {
      await t.rollback();
      return errorResponse(res, 400, "Email inválido");
    }
    if (password.length < 6) {
      await t.rollback();
      return errorResponse(res, 400, "El password debe tener al menos 6 caracteres");
    }

    // Verificar que existan roles en BD
    const rolesCount = await Role.count({ transaction: t });
    if (rolesCount === 0) {
      await t.rollback();
      return errorResponse(res, 500, "No existen roles en la base de datos. Reinicia el servidor.");
    }

    // Crear usuario
    const user = await User.create(
      { username, email, password: bcrypt.hashSync(password, 10) },
      { transaction: t }
    );

    // Resolver roles
    let rolesToAssign = [];
    if (Array.isArray(roles) && roles.length > 0) {
      const foundRoles = await Role.findAll({ where: { name: roles }, transaction: t });
      if (foundRoles.length !== roles.length) {
        await t.rollback();
        return errorResponse(res, 400, "Uno o más roles no existen. Roles válidos: user, moderator, admin");
      }
      rolesToAssign = foundRoles;
    } else {
      const defaultRole = await Role.findOne({ where: { name: "user" }, transaction: t });
      if (!defaultRole) {
        await t.rollback();
        return errorResponse(res, 500, "No existe el rol por defecto 'user'");
      }
      rolesToAssign = [defaultRole];
    }

    await user.setRoles(rolesToAssign, { transaction: t });
    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: rolesToAssign.map(r => r.name)
      }
    });
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, 400, "Username o email ya están en uso");
    }
    return errorResponse(res, 500, "Error al registrar usuario", error.message);
  }
};

// ── SIGNIN ──────────────────────────────────────────────
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, 400, "Email y password son requeridos");
    }

    const user = await User.findOne({
      where: { email },
      include: { model: Role, through: { attributes: [] } }
    });

    if (!user) return errorResponse(res, 404, "Usuario no encontrado");

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return errorResponse(res, 401, "Password incorrecto");

    // Access Token (corta duración)
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Refresh Token (larga duración)
    const refreshToken = await RefreshToken.createToken(user);

    const authorities = user.roles?.map(r => r.name) || [];

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    return errorResponse(res, 500, "Error en login", error.message);
  }
};

// ── REFRESH TOKEN ────────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: requestToken } = req.body;

    if (!requestToken) {
      return errorResponse(res, 403, "Refresh Token requerido");
    }

    // Verificar firma del refresh token
    let decoded;
    try {
      decoded = jwt.verify(requestToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return errorResponse(res, 401, "Refresh Token inválido o expirado");
    }

    // Buscar en BD
    const tokenRecord = await RefreshToken.findOne({ where: { token: requestToken } });

    if (!tokenRecord) {
      return errorResponse(res, 403, "Refresh Token no encontrado. Inicia sesión nuevamente.");
    }

    // Verificar expiración en BD
    if (RefreshToken.verifyExpiration(tokenRecord)) {
      await tokenRecord.destroy();
      return errorResponse(res, 403, "Refresh Token expirado. Inicia sesión nuevamente.");
    }

    // Emitir nuevo Access Token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Access Token renovado",
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    return errorResponse(res, 500, "Error al renovar token", error.message);
  }
};

// ── LOGOUT ───────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const { refreshToken: requestToken } = req.body;

    if (!requestToken) {
      return errorResponse(res, 400, "Refresh Token requerido para logout");
    }

    // Eliminar el refresh token de la BD (invalidar sesión)
    const deleted = await RefreshToken.destroy({ where: { token: requestToken } });

    if (!deleted) {
      return errorResponse(res, 404, "Refresh Token no encontrado");
    }

    return res.status(200).json({
      success: true,
      message: "Logout exitoso. Sesión cerrada."
    });
  } catch (error) {
    return errorResponse(res, 500, "Error al cerrar sesión", error.message);
  }
};
