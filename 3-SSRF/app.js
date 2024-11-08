const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
})

app.get('/fetch', async (req,res) => {
    const {url} = req.query;

    const response = await axios.get(url);
    res.send(response.data);
})


app.listen(PORT)