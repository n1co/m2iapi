
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

const {
  PORT,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  AUTHORIZATION_URL,
  TOKEN_URL,
  PROTECTED_RESOURCE_URL,
} = process.env;

// Route pour démarrer l'authentification OAuth
app.get("/login", (req, res) => {
  const authUrl = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read`;
  res.redirect(authUrl);
});

// Callback pour récupérer le code d'authentification
app.get("/oauth/callback", async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    // Échange du code contre un token d'accès
    const response = await axios.post(
      TOKEN_URL,
      {
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        transformRequest: [
          (data) => {
            // Convertir l'objet JSON en chaîne de requête pour form-urlencoded
            return Object.keys(data)
              .map(
                (key) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`,
              )
              .join("&");
          },
        ],
      },
    );

    const accessToken = response.data.access_token;

    // Sauvegarder le token d'accès et rediriger l'utilisateur
    req.session = { accessToken }; // Simple session de test
    res.send(
      "Vous êtes connecté! Vous pouvez maintenant accéder aux ressources protégées.",
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la récupération du token");
  }
});

// Route protégée
app.get("/protected", async (req, res) => {
  const { accessToken } = req.session || {};

  if (!accessToken) {
    return res.status(401).send("Non autorisé. Veuillez vous connecter.");
  }

  try {
    // Requête pour une ressource protégée avec le token d'accès
    const response = await axios.get(PROTECTED_RESOURCE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'accès à la ressource protégée");
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
