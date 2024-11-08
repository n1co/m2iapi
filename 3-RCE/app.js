const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

app.get('/ping', (req,res) => {
    const { host } = req.query;

    exec(`ping ${host}`, (error, stdout, stderr) => {
        if(error) {
            res.status(500).send(error.message)
            return;
        }
        if(stderr) {
            res.status(500).send(stderr)
            return;
        }

        res.send(stdout)
    })
})

app.listen(PORT);