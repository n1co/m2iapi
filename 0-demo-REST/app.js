const express = require("express");

const app = express();
const PORT = 3000;

app.get('/bonjour', (req, res) => {
    res.send({ message: 'Bonjour !' });
});

app.get('/aurevoir', (req, res) => {
    res.send({ message: 'Au revoir !' });
});

app.get('/test', (req, res) => {
    res.send({ message: 'Au revoir !' });
});

app.get('/admin', (req, res) => {
    res.send({ message: 'Au revoir !' });
});

app.post('/post', (req, res) => {
    res.send({ message: 'Au revoir !' });
});


app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});