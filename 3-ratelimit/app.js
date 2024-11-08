const express = require('express');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const app = express();
const PORT = 3000;


const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message}) => {
            return `${timestamp} [${level.toUpperCase()}] - ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename : "app.log"}),
    ],
})

app.use((req, res, next) => {
    logger.info(`Requete entrante: ${req.method} ${req.url} depuis: ${req.ip}`);
    next();
})


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Rate limit",
    headers: true,
    handler: (req,res) => {
        logger.warn(`Requete bloquée: ${req.method} ${req.url} depuis: ${req.ip}`);
        res.status(429).send('trop de requetes');
    },
})

app.use(limiter);

app.get('/bonjour', (req,res) => {
    res.send("bonjour");
})

app.listen(PORT)