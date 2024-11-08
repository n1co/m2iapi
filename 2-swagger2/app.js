const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "API de demonstration",
            version: "1.0.0",
            description:"ma super api",
        },
        server: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ["./app.js"], // fichier ou swagger va trouver ses définitions
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
 * @swagger
 * /:
 *   get:
 *      summary: Retourne le message de bienvenue
 *      responses:
 *          200:
 *            description: Message de bienvenue
 */
app.get('/', (req,res) => {
    res.send("Bienvenue sur mon API !")
})

/**
 * @swagger
 * /users:
 *      get:
 *          summary: Lister les users
 *          responses:
 *              200:
 *                  description: Liste les utilisateurs
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      name:
 *                                          type: string
 */
app.get('/users' , (req,res) => {
    const users = [
        { id: 1, name:"John"},
        { id: 2, name:"Alice"},
    ];
    res.status(234).json(users);
});

/**
 * @swagger
 * /users:
 *      post:
 *          summary: creer un nouvel utilisateur
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *          response:
 *              201:
 *                  description: l'utilisateur a bien été crée
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: integer
 *                                  name:
 *                                      type:string
 */
app.post('/users', (req,res) => {
    const newUser = {
        id: Date.now(),
        name: req.body.name
    };
    res.status(201).json(newUser);
})

app.listen(PORT)