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

authRoutes(app);
userRoutes(app);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// 🔥 ARRANCAR SERVER PRIMERO (clave para Render)
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  try {
    const isDev = process.env.NODE_ENV === "development";

    await db.sequelize.authenticate();
    console.log("DB conectada");

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

  } catch (error) {
    console.error("❌ Error conectando DB:", error.message);
  }
});