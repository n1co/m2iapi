// app.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const speakeasy = require('speakeasy')
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Configuration du middleware
app.use(bodyParser.json());

// Connexion à la base de données SQLite
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      otpSecret TEXT
    )`);
  }
});

// Configuration de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gestion de Comptes",
      version: "1.0.0",
      description:
        "API pour créer des comptes, se connecter, et gérer les informations utilisateur.",
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: ["./app.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware pour vérifier les tokens JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes de l'API

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Utilisateur existe déjà
 */
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
    [email, hashedPassword, name],
    function (err) {
      if (err) return res.status(400).json({ message: "Email déjà utilisé." });
      res.status(201).json({ id: this.lastID });
    },
  );
});

app.post("/enable-otp", authenticateToken, (req,res) => {
  const userId = req.user.userId;

  const secret = speakeasy.generateSecret({ length: 20 })

  db.run(
    "UPDATE users SET otpSecret = ? WHERE id = ?",
    [secret.base32, userId],
    function (err) {
      return res.status(500).json({ error: "Erreur" });
    },
  )

  const otpauthUrl = secret.otpauth_url;
  res.json({message: otpauthUrl})
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connecter un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Identifiants invalides
 */
app.post("/login", (req, res) => {
  const { email, password, otp } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err,user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return  res
      .status(400)
      .json({message:"email ou mdp incorrect"})
    }

    if(user.otpSecret) {
      if(!otp) {
        return res.status(400).json({message:"otp requis"})
      }

      const verified = speakeasy.totp.verify({
        secret: user.otpSecret,
        encoding: "base32",
        token: otp,
      });

      if(!verified) {
        return res.status(400).json({message:"OTP invalide"})
      }
    }

    const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({token})
  })
});

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *       401:
 *         description: Non autorisé
 */
app.get("/account", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(
    "SELECT id, email, name FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err || !user) return res.sendStatus(404);
      res.json(user);
    },
  );
});

/**
 * @swagger
 * /account/email:
 *   patch:
 *     summary: Changer l'email de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email mis à jour
 *       400:
 *         description: Erreur dans la mise à jour de l'email
 */
app.patch("/account/email", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { email } = req.body;

  db.run(
    "UPDATE users SET email = ? WHERE id = ?",
    [email, userId],
    function (err) {
      if (err)
        return res
          .status(400)
          .json({ message: "Erreur lors de la mise à jour de l'email." });
      res.json({ message: "Email mis à jour avec succès." });
    },
  );
});

/**
 * @swagger
 * /account/password:
 *   patch:
 *     summary: Changer le mot de passe de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       400:
 *         description: Erreur dans la mise à jour du mot de passe
 */
app.patch("/account/password", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, userId],
    function (err) {
      if (err)
        return res
          .status(400)
          .json({ message: "Erreur lors de la mise à jour du mot de passe." });
      res.json({ message: "Mot de passe mis à jour avec succès." });
    },
  );
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
