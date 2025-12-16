const http = require("http");
const express = require("express");
const mongo = require("mongoose");
const path = require("path");
const axios = require("axios");
const db = require("./config/dbconnexion.json");

// ✅ Import de TES routes
const produitRouter = require("./routes/produit");
const categorieRouter = require("./routes/categorie");

// ✅ Connexion MongoDB
mongo.connect(db.url)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.log("❌ Database error:", err));

const app = express();
const serviceName = "monservice produit";
const discovryserviceurl = "http://discovery:4000/register";
app.use(express.json());
const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discovryserviceurl, {
        name: "service-produit",
        address: "http://service-produit",
        port: 3004,
      });

      console.log("service-produit bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 8000); // attendre 4 secondes avant l'enregistrement
};
registerService();
// ✅ Vues (facultatif)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// ✅ TES ROUTES MICROSERVICE
app.use("/produit", produitRouter);
app.use("/categorie", categorieRouter);

// ✅ TEST RACINE
app.get("/", (req, res) => {
  res.send("bienvenue dans votre service : " + serviceName);
});

// ✅ SERVEUR
const server = http.createServer(app);

// ✅ PORT MICROSERVICE (3004 ou 4004)
const PORT = 3004;

server.listen(PORT, () => {
  console.log(`✅ Microservice GYM running on port ${PORT}`);
});
