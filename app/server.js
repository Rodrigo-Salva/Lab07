import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import db from "./models/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const isDev = process.env.NODE_ENV === "development";

await db.sequelize.sync({ force: isDev });
console.log("Base de datos sincronizada");

const count = await db.role.count();
if (count === 0) {
  await db.role.bulkCreate([
    { id: 1, name: "user" },
    { id: 2, name: "moderator" },
    { id: 3, name: "admin" }
  ]);
  console.log("Roles creados");
}

authRoutes(app);
userRoutes(app);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV}`);
});