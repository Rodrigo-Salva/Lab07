// Ruta pública (sin autenticación)
export const allAccess = (req, res) => {
  res.json({ success: true, message: "Public Content." });
};

// Ruta protegida: cualquier usuario autenticado
export const userBoard = (req, res) => {
  res.json({ success: true, message: "User Content.", userId: req.userId });
};

// Ruta protegida: solo MODERATOR
export const moderatorBoard = (req, res) => {
  res.json({ success: true, message: "Moderator Content.", userId: req.userId });
};

// Ruta protegida: solo ADMIN
export const adminBoard = (req, res) => {
  res.json({ success: true, message: "Admin Content.", userId: req.userId });
};