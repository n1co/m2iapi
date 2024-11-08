const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const PORT = 3001;
const JWT_SECRET_KEY =
  "14d84011a9c27465c3e5d84ed59145d601400210e4884ae0f3b46cb27bd43057";

const app = express();
app.use(bodyParser.json());

// Configuration de la base de données
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Création de la table utilisateurs et du compte admin par défaut
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    ["admin"],
    async (err, row) => {
      if (!row) {
        const hashedPassword = await bcrypt.hash("password", 10);
        db.run(
          `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
          ["admin", hashedPassword, "admin"],
        );
        console.log(
          "Default admin account created with username 'admin' and password 'password'",
        );
      }
    },
  );
});

// Middleware pour vérifier le token JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extraction du token après "Bearer"
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Utilisation du code 403 pour token invalide
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Code 401 pour absence d'authentification
  }
};

// Middleware pour vérifier le rôle d'administrateu
/*
const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.sendStatus(403);
  }
};
*/

const isAdmin = (req, res, next) => {
  db.get(
    `SELECT role FROM users WHERE id = ?`,
    [req.user.id],
    (err, row) => {
      if(err || !row) {
        return res.status(500)
      }
      if (row.role !== "admin") {
        return res.status(403)
      }
      next();
    }
  )
};

// Endpoint pour la création d'un utilisateur
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (
    !username ||
    !password ||
    !role ||
    (role !== "admin" && role !== "user")
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, role],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "User already exists" });
      }
      res.status(201).json({ message: "User created successfully" });
    },
  );
});

// Endpoint pour la connexion et la génération de JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err || !user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET_KEY,
        { expiresIn: "1h" },
      );
      res.json({ token });
    },
  );
});

// Endpoint /admin pour lister tous les utilisateurs (réservé aux admins)
app.get("/admin", authenticateJWT, isAdmin, (req, res) => {
  db.all(`SELECT id, username, role FROM users`, [], (err, users) => {
    if (err) {
      return res.status(500).json({ message: "An error occurred" });
    }
    res.json(users);
  });
});

// Endpoint /user pour obtenir les informations de l'utilisateur connecté
app.get("/user", authenticateJWT, (req, res) => {
  db.get(
    `SELECT id, username, role FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    },
  );
});

// Démarrage de l'API
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
