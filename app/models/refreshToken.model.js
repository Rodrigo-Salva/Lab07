import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

export default (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("refreshTokens", {
    token: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  RefreshToken.createToken = async function (user) {
    const jwt = await import("jsonwebtoken");

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    const token = jwt.default.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

    const refreshToken = await this.create({
      token,
      expiryDate: expiredAt,
      userId: user.id
    });

    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = function (token) {
    return token.expiryDate.getTime() < new Date().getTime();
  };

  return RefreshToken;
};