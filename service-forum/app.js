const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const axios = require("axios");
const path = require("path")

const dbConfig = require('./config/dbconnection.json')
const BlogRoutes = require("./routes/BlogRoutes")
const CommentaireRoutes = require("./routes/CommentaireRoutes")
const notificationRoutes = require('./routes/NotificationRoutes');
const StatsRoutes = require('./routes/StatsRoutes');
const app = express()

const serviceName = "monservice forum";
const discovryserviceurl = "http://discovery:4000/register";

const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discovryserviceurl, {
        name: "service-forum",
        address: "http://service-forum",
        port: 3003,
      });

      console.log("service-forum bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 5000); // attendre 4 secondes avant l'enregistrement
};
registerService();

app.use(express.json())
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

app.use("/Blog",BlogRoutes)
app.use("/Commentaire",CommentaireRoutes)
app.use('/Notifications', notificationRoutes);
app.use('/Stats',StatsRoutes);
app.get("/", (req, res) => {
  res.send("bienvenue dans votre service : " + serviceName);
});

// create an http server from the express app
const server = http.createServer(app)

// Connect using mongoose so mongoose models use the same connection
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log('connected to db')
        const port = process.env.PORT || 3003
        server.listen(port, () => console.log('server run on port', port))
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
        process.exit(1)
    })