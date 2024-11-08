const express = require('express')
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database(':memory:');


db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username,password) VALUES ('admin','password1234')");
    db.run("INSERT INTO users (username,password) VALUES ('test','passwd')");
    db.run("INSERT INTO users (username,password) VALUES ('tes11t','passdddwd')");
})

app.get('/users', (req,res) => {
    const username = req.query.username;

    const query = `SELECT * FROM users WHERE username = '${username}'`;

    db.all(query, (err,rows) => {
        if(err) {
            res.status(500).send('erreur');
            return;
        }

        res.json(rows.length ? rows : {message:'utilisateur non trouvé'})
    })
})

app.listen(port);