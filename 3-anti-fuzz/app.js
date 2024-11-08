const express = require('express')
const app = express()
const PORT = 3000;

function generateRandomString(lenght) {
    const characters = 'azertyuiopqsdfghjklmwxcvbn1234567890AZERTYUIOPQSDFGHJKLMWXCVBN ';
    let result = '';
    for(let i = 0; i < lenght; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result;
}

function generateRandomResponse(){
    const numLines = Math.floor(Math.random() * 10) + 1;
    let response = '';
    for (let i=0; i <numLines; i++){
        const lineLength = Math.floor(Math.random() * 50) + 1
        response += generateRandomString(lineLength) + '\n';
    }
    return response
}

app.get('/admin', (req, res) => {
    res.status(267).send('Page admin');
})

/*
app.use((req, res, next) => {
    res.status(200).send(generateRandomResponse());
})
    */


app.listen(PORT)