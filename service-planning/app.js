const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require("path");
const axios = require("axios");
const testRoute = require('./routes/test');
const planningroute = require('./routes/planningroute'); // <-- notre route planning
const dbConfig = require('./config/dbconnection.json');

const app = express();
const serviceName = "monservice planning";
const discovryserviceurl = "http://localhost:4000/register";
const registerService = async () => {
  try {
    await axios.post(discovryserviceurl, {
      name: "service-planning",
      address: "http://localhost",
      port: 3001,
    });
    console.log(serviceName + "bien enregistre");
  } catch (error) {
    console.log("erreur dans l'enregistrement :" + error.message);
  }
}; // assurer communation entre gateway et les services
registerService();
app.use(express.json());

// Routes

app.use('/cours', testRoute);
app.use('/planning', planningroute);

app.get("/", (req, res) => {
  res.send("bienvenue dans votre service : " + serviceName);
});


// create an http server from the express app
const server = http.createServer(app)

// Connect using mongoose so mongoose models use the same connection
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log('connected to db')
        const port = process.env.PORT || 3001
        server.listen(port, () => console.log('server run on port', port))
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    })