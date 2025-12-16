
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const axios = require("axios");

const testRoute = require("./routes/test");
const planningroute = require("./routes/planningroute");
const dbConfig = require("./config/dbconnection.json");

const app = express();
const serviceName = "service-planning";
const discoveryServiceUrl = "http://discovery:4000/register";

// Middleware AVANT les routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/cours", testRoute);
app.use("/planning", planningroute);

app.get("/", (req, res) => {
  res.send("Bienvenue dans " + serviceName);
});

// Serveur HTTP
const server = http.createServer(app);

// Enregistrement service
const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discoveryServiceUrl, {
        name: "service-planning",
        address: "http://service-planning",
        port: 3001,
      });

      console.log("service-planning bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 7000); // attendre 4 secondes avant l'enregistrement
};
registerService();

// MongoDB + démarrage serveur
mongoose.connect(dbConfig.url)
  .then(() => {
    console.log("Connected to DB");

    server.listen(3001, async () => {
      console.log("Service planning sur le port 3001");
      await registerService(); // ✅ ICI SEULEMENT
    });
  })
  .catch(err => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

