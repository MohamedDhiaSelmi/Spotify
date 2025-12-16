const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const axios = require("axios");

// Security & utilities
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const dbConfig = require('./config/dbconnection.json')

const app = express()
const serviceName = "service-user";
const discovryserviceurl = "http://discovery:4000/register";

const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discovryserviceurl, {
        name: "service-user",
        address: "http://service-user",
        port: 3005,
      });

      console.log("service-user bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 9000); // attendre 4 secondes avant l'enregistrement
};
registerService();

// Basic security middlewares
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
})

// Configuration des vues Twig
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// Import des routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

// Routes d'authentification (publiques)
app.use("/auth", authLimiter, authRouter);

// Routes protégées
app.use("/user", userRouter);

// Route racine
app.get("/", (req, res) => {
  res.render("login");
});

// Page de réinitialisation de mot de passe (version simplifiée)
app.get("/reset-password", (req, res) => {
  const token = req.query.token || "";
  
  console.log('Token reçu:', token);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Réinitialisation - Port 3005</title>
      <style>
        body { font-family: Arial; background: #f0f0f0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #1db954; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { background: #1db954; color: white; padding: 10px 20px; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Réinitialisation du mot de passe</h1>
        <p>Service tournant sur le port <strong>3005</strong></p>
        <form id="resetForm">
          <input type="password" id="password" placeholder="Nouveau mot de passe" required>
          <input type="password" id="confirmPassword" placeholder="Confirmer le mot de passe" required>
          <button type="submit">Réinitialiser</button>
        </form>
        <div id="message" style="margin-top: 20px;"></div>
      </div>
      <script>
        document.getElementById('resetForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          
          if(password !== confirmPassword) {
            document.getElementById('message').innerHTML = '<p style="color:red;">Les mots de passe ne correspondent pas</p>';
            return;
          }
          
          document.getElementById('message').innerHTML = '<p style="color:green;">Formulaire soumis avec succès (port 3005)</p>';
        });
      </script>
    </body>
    </html>
  `);
});

// Pages de démonstration
app.get("/dashboard", (req, res) => {
  res.send(`
    <html>
    <head><title>Dashboard</title></head>
    <body>
      <h1>Dashboard - Port 3005</h1>
      <p>Bienvenue sur le service utilisateur</p>
      <p>Port: <strong>3005</strong></p>
    </body>
    </html>
  `);
});

app.get("/admin", (req, res) => {
  res.send(`
    <html>
    <head><title>Admin</title></head>
    <body>
      <h1>Admin - Port 3005</h1>
      <p>Interface d'administration</p>
    </body>
    </html>
  `);
});

app.get("/coach", (req, res) => {
  res.send(`
    <html>
    <head><title>Coach</title></head>
    <body>
      <h1>Coach - Port 3005</h1>
      <p>Interface coach</p>
    </body>
    </html>
  `);
});

// Route de test simple
app.get("/test", (req, res) => {
  res.json({
    message: "Service utilisateur fonctionnel",
    port: 3005,
    status: "OK",
    timestamp: new Date()
  });
});

// Route pour vérifier la santé du service
app.get("/health", (req, res) => {
  res.json({
    service: "user-service",
    status: "healthy",
    port: 3005,
    uptime: process.uptime()
  });
});

// create an http server from the express app
const server = http.createServer(app)

// Connexion MongoDB
mongoose.connect(dbConfig.url)
    .then(() => {
        console.log('✅ MongoDB connecté')
        const PORT = 3005; // ✓ PORT 3005
        server.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 Service utilisateur en cours d'exécution`)
          console.log(`📡 Port: ${PORT}`)
          console.log(`🌐 URL: http://localhost:${PORT}`)
          console.log(`🌐 URL réseau: http://0.0.0.0:${PORT}`)
          
          // Enregistrer le service après le démarrage
          setTimeout(() => {
            registerService();
          }, 1000);
        })
    })
    .catch(err => {
        console.error('❌ Erreur MongoDB:', err.message)
        // Démarrer quand même le serveur même sans MongoDB (pour le test)
        const PORT = 3005;
        server.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 Service démarré SANS MongoDB sur le port ${PORT}`)
          console.log(`⚠️  Mode démo - Base de données non connectée`)
          setTimeout(() => {
            registerService();
          }, 1000);
        })
    })