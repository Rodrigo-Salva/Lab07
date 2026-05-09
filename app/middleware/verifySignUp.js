import db from "../models/index.js";

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const userByUsername = await db.user.findOne({ where: { username: req.body.username } });
    if (userByUsername) {
      return res.status(400).json({ message: "El username ya está en uso" });
    }

    const userByEmail = await db.user.findOne({ where: { email: req.body.email } });
    if (userByEmail) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};