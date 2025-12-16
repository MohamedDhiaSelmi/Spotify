const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const axios = require("axios");
const path = require("path");
const repasRoute = require('./routes/repasRoutes')
const planNutritionRoute = require('./routes/planNutritionRoutes')
const dbConfig = require('./config/dbconnection.json')

const app = express()
const serviceName = "service-nutrition";

const discovryserviceurl = "http://discovery:4000/register";
const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discovryserviceurl, {
        name: "service-nutrtion",
        address: "http://service-nutrition",
        port: 3000,
      });

      console.log("service-nutrition bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 6000); // attendre 4 secondes avant l'enregistrement
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