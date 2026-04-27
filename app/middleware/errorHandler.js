/**
 * Middleware global de manejo de errores.
 * Captura cualquier error que llegue con next(error)
 * y devuelve una respuesta estandarizada.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // Error de Sequelize: restricción única
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Ya existe un registro con esos datos",
      details: err.errors?.map(e => e.message)
    });
  }

  // Error de Sequelize: validación
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      details: err.errors?.map(e => e.message)
    });
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expirado" });
  }

  // Error genérico
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "Error interno del servidor"
  });
};