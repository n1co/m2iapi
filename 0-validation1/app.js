const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/
    return emailRegex.test(email);
}

app.post('/users', (req,res) => {
    const { email, password } = req.body;
    console.log(req.body)

    if(!email || !password) {
        return res.status(400).json({error:"email et mot de passe requis"});
    }

    if(!isValidEmail(email)) {
        return res.status(400).json({error:"Email invalide"});
    }

    return res.status(200).json({error:"Compte OK"});
});

app.listen(3000);