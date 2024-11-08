const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(bodyParser.json());

// CREATE TABLE users
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)",
  );
  db.run(
    "INSERT INTO users (username, password) VALUES ('admin', 'password123')",
  );
});

// 1. **Injection SQL** - L'endpoint permet une injection SQL
app.get("/users", (req, res) => {
  const username = req.query.username || ""; // Pas de validation ni de paramétrage sécurisé
  const sql = `SELECT * FROM users WHERE username = '${username}'`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// 2. **Manque d'authentification** - Pas d'authentification pour cet endpoint
app.post("/users", (req, res) => {
  const { username, password } = req.body;
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.run(sql, [username, password], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// 3. **Manque de validation des entrées** - Entrées utilisateur non validées
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const sql = `UPDATE users SET username = '${username}', password = '${password}' WHERE id = ${id}`;
  db.run(sql, [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "User updated" });
  });
});

// 4. **Exposition d'informations sensibles** - Mot de passe dans la base de données en texte clair
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM users WHERE id = ${id}`;
  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ user: row });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

// 5. **Absence de gestion des autorisations** - Pas de contrôle d'accès sur les endpoints
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM users WHERE id = ${id}`;
  db.run(sql, [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "User deleted" });
  });
});

// 6. **XSS (Cross-Site Scripting)** - Injection de scripts dans les réponses
app.get("/search", (req, res) => {
  const query = req.query.q || "";
  res.json({ result: `<div>${query}</div>` });
});

// 7. **Exposition de données sensibles par URL** - Information sensible dans l'URL
app.get("/admin/:password", (req, res) => {
  const { password } = req.params;
  if (password === "admin123") {
    res.json({ message: "Admin access granted" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// 8. **Abus de gestion des sessions** - Pas de gestion de session ni de cookie sécurisé
app.get("/profile", (req, res) => {
  res.json({ profile: "User Profile" });
});

// 9. **Méthodes HTTP non sécurisées** - Utilisation de méthodes HTTP dangereuses (ex : DELETE sans vérification)
app.delete("/delete-account", (req, res) => {
  res.status(200).json({ message: "Account deleted" });
});

// 10. **Réponse avec erreur générique** - Pas d'informations utiles dans les erreurs
app.get("/error", (req, res) => {
  try {
    const result = someUndefinedFunction();
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3000");
});
