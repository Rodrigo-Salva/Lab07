# 🔐 demoSeguridad — API REST con JWT

API REST de autenticación y autorización con **Node.js + Express + Sequelize + MySQL + JWT**.

---

## 📋 Requisitos previos

Asegúrate de tener instalado:

| Herramienta | Versión mínima | Verificar |
|-------------|----------------|-----------|
| Node.js     | v18+           | `node -v` |
| npm         | v9+            | `npm -v`  |
| MySQL       | v8+            | `mysql --version` |

---

## 📁 Estructura del proyecto

```
demoSeguridad/
├── .env
├── package.json
└── app/
    ├── server.js
    ├── config/
    │   └── db.config.js
    ├── models/
    │   ├── index.js
    │   ├── user.model.js
    │   ├── role.model.js
    │   └── refreshToken.model.js
    ├── middleware/
    │   ├── authJwt.js
    │   ├── verifySignUp.js
    │   └── errorHandler.js
    ├── controllers/
    │   ├── auth.controller.js
    │   └── user.controller.js
    └── routes/
        ├── auth.routes.js
        └── user.routes.js
```

---

## ⚙️ Instalación

### 1. Crear la base de datos en MySQL

```sql
CREATE DATABASE jwt_db;
```

### 2. Clonar o descomprimir el proyecto

```bash
cd demoSeguridad
```

### 3. Instalar dependencias

```bash
npm install
```

> Instala: `express`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`, `helmet`, `sequelize`, `mysql2`, `uuid`
> Dev: `nodemon`

### 4. Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=jwt_db

JWT_SECRET=clave_super_segura_2024
JWT_REFRESH_SECRET=refresh_super_segura_2024
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

> ⚠️ El archivo `.env` debe estar en la **raíz del proyecto**, no dentro de `/app`.

### 5. Ejecutar el servidor

```bash
npm run dev
```

Salida esperada:

```
🚀 Servidor corriendo en http://localhost:3000
🔧 Modo: development
📦 Base de datos sincronizada
✅ Roles creados
```

> Al iniciar en modo `development`, Sequelize crea las tablas automáticamente y carga los roles: `user`, `moderator`, `admin`.

---

## 🧪 Endpoints disponibles

### Autenticación

| Método | Endpoint                | Descripción              | Auth requerida |
|--------|-------------------------|--------------------------|----------------|
| POST   | `/api/auth/signup`      | Registrar usuario        | ❌             |
| POST   | `/api/auth/signin`      | Iniciar sesión           | ❌             |
| POST   | `/api/auth/refresh`     | Renovar Access Token     | ❌             |
| POST   | `/api/auth/logout`      | Cerrar sesión            | ❌             |

### Rutas protegidas

| Método | Endpoint           | Descripción         | Rol requerido     |
|--------|--------------------|---------------------|-------------------|
| GET    | `/api/test/all`    | Contenido público   | Ninguno           |
| GET    | `/api/test/user`   | Contenido de usuario| Token válido      |
| GET    | `/api/test/mod`    | Contenido moderador | `moderator`       |
| GET    | `/api/test/admin`  | Contenido admin     | `admin`           |

---

## 🔑 Flujo de uso

```
1. POST /api/auth/signup   →  Registrar usuario con rol
2. POST /api/auth/signin   →  Obtener accessToken + refreshToken
3. GET  /api/test/admin    →  Enviar: Authorization: Bearer <accessToken>
4. POST /api/auth/refresh  →  Renovar accessToken cuando expire
5. POST /api/auth/logout   →  Invalidar refreshToken
```

---

## 📦 Dependencias

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.9.7",
    "sequelize": "^6.37.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## 🛡️ Seguridad implementada

- **JWT Access Token** — expira en 1 hora
- **Refresh Token** — almacenado en BD, expira en 7 días
- **bcryptjs** — hash de contraseñas con salt 10
- **Helmet** — headers HTTP de seguridad automáticos
- **RBAC** — control de acceso basado en roles (user, moderator, admin)
- **Middleware global de errores** — respuestas estandarizadas

---

## 👤 Autor

**Coello Palomino, Ricardo** — Desarrollo de Aplicaciones Web Avanzado — Tecsup 2026
