const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const axios = require("axios");
const path = require("path");
const repasRoute = require('./routes/repasRoutes')
const planNutritionRoute = require('./routes/planNutritionRoutes')
const dbConfig = require('./config/dbconnection.json')

const app = express()
const serviceName = "monservice nutrition";

const discovryserviceurl = "http://localhost:4000/register";
const registerService = async () => {
  try {
    await axios.post(discovryserviceurl, {
      name: "service-nutrition",
      address: "http://localhost",
      port: 3000,
    });
    console.log(serviceName + "bien enregistre");
  } catch (error) {
    console.log("erreur dans d'enregistrement :" + error.message);
  }
};
registerService();


app.use(express.json())
app.use('/plan', planNutritionRoute)
app.use('/repas', repasRoute)
app.get("/", (req, res) => {
  res.send("bienvenue dans votre service : " + serviceName);
});
// create an http server from the express app
const server = http.createServer(app)

// Connect using mongoose so mongoose models use the same connection
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log('connected to db')
        const port = process.env.PORT || 3000
        server.listen(port, () => console.log('server run on port', port))
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    })