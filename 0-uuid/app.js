const express = require("express");
const { v4:uuidv4 } = require("uuid");


const app = express();
const PORT = 3000;

app.get('/uid', (req,res) => {
    const uid = uuidv4();
    res.json({ uid })
})

app.get('/error', (req,res) => {
    res.status(499).json({error:"mon erreur custom"})
})


app.listen(PORT)