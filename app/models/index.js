import dbConfig from "../config/db.config.js";
import pkg from "sequelize";
const { Sequelize, DataTypes } = pkg;

import userModel from "./user.model.js";
import roleModel from "./role.model.js";
import refreshTokenModel from "./refreshToken.model.js";

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// inicializar modelos SIN await
db.user = userModel(sequelize, Sequelize);
db.role = roleModel(sequelize, Sequelize);
db.refreshToken = refreshTokenModel(sequelize, DataTypes);

// relaciones
db.role.belongsToMany(db.user, {
  through: "user_roles"
});

db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.user.hasMany(db.refreshToken, { as: "refreshTokens" });
db.refreshToken.belongsTo(db.user, { foreignKey: "userId", as: "user" });

export default db;