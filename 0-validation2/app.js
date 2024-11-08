const express = require('express');
const PasswordValidator = require('password-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

app.use(express.json());

const passwordSchema = new PasswordValidator();
passwordSchema
.is().min(12)   //longueur du mdp
.has().uppercase() // il y'a des majuscules ?
.has().lowercase() // il y'a des minuscules ?
.has().digits() // il y'a des nombres ?
.has().symbols() // il y'a des caractères spéciaux ?
.has().not().spaces() // pas d'espace


app.post('/users', async (req,res) => {
    const { email, password } = req.body;
    console.log(req.body)

    if(!email || !password) {
        return res.status(450).json({error:"email et mot de passe requis"});
    }

    if(!validator.isEmail(email)) {
        return res.status(451).json({error:"email invalide"});
    }

    if(!passwordSchema.validate(password)) {
        return res.status(452).json({error:"mdp invalide"});
    }

    const hashedPassword = await bcrypt.hash(password,5);

    console.log(hashedPassword);

    return res.status(200).json({error:"Compte OK"});
});

app.listen(3000);