const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const port = 5000;
const serviceDiscoveryUrl = "http://discovery:4000/services";

// Middleware pour parser le JSON et les urlencoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir le fichier dashboard.html à la racine
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Middleware pour récupérer le service cible depuis le service de découverte
app.use(async (req, res, next) => {
  try {
    const response = await axios.get(serviceDiscoveryUrl);
    const services = response.data;

    // Détection du service cible selon le préfixe de la route
    const serviceMap = {
      "/service-nutrition": "service-nutrition",
      "/service-planning": "service-planning",
      "/service-forum": "service-forum",
      "/service-produit": "service-produit",
      "/service-user": "service-user",
      "/service-event": "service-event",
    };

    let targetServiceName;
    for (const prefix in serviceMap) {
      if (req.path.startsWith(prefix)) {
        targetServiceName = serviceMap[prefix];
        break;
      }
    }

    if (!targetServiceName) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    const targetService = services.find((s) => s.name === targetServiceName);
    if (!targetService) {
      return res.status(404).json({ message: "Service non disponible" });
    }

    // Construire l'URL complète du service
    let address = targetService.address;
    if (!address.startsWith("http://") && !address.startsWith("https://")) {
      address = "http://" + address;
    }
    req.targetServiceUrl = `${address}:${targetService.port}`;
    req.targetServicePrefix = Object.keys(serviceMap).find(
      (p) => serviceMap[p] === targetServiceName
    );

    next();
  } catch (err) {
    console.error("Erreur gateway :", err.message);
    res.status(500).json({ error: "Erreur serveur gateway" });
  }
});

// Middleware pour rediriger toutes les requêtes vers le service cible
app.use(async (req, res) => {
  try {
    // Construire l'URL finale pour le service
    const targetUrl = `${req.targetServiceUrl}${req.originalUrl.replace(
      new RegExp(`^${req.targetServicePrefix}`),
      ""
    )}`;

    console.log("Requête vers :", targetUrl);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body, // JSON body
      headers: {
        ...req.headers,
        host: undefined,
        "Content-Length": undefined, // évite le problème "request aborted"
      },
      params: req.query, // query params
      timeout: 10000, // 10 secondes pour éviter blocage
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Erreur proxy :", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Erreur interne gateway" });
    }
  }
});

app.listen(port, () => console.log(`Gateway en cours d'exécution sur le port ${port}`));
