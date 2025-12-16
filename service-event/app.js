const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require("axios");

const app = express();

// ----------------- CONFIG -----------------
const serviceName = "service-event";
const discoveryserviceurl = "http://discovery:4000/register";
const dbConfPath = path.join(__dirname, 'config', 'dbconnection.json');
const { MONGO_URI } = JSON.parse(fs.readFileSync(dbConfPath, 'utf-8'));

// ----------------- FONCTION D'ENREGISTREMENT -----------------
const registerService = async () => {
  setTimeout(async () => {
    try {
      await axios.post(discoveryserviceurl, {
        name: "service-event",
        address: "http://service-event",
        port: 3002,
      });

      console.log("service-event bien enregistré !");
    } catch (error) {
      console.log("Erreur d'enregistrement :", error.message);
    }
  }, 4000); // attendre 4 secondes avant l'enregistrement
};
registerService();

// ----------------- MIDDLEWARES -----------------
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ----------------- ROUTES -----------------
app.use('/api/events', require('./routes/events'));
app.use('/api/reservations', require('./routes/reservations'));

// Route root pour test
app.get('/', (req, res) => res.json({ ok: true, app: serviceName }));

// ----------------- GESTION DES ERREURS -----------------
app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Server error' });
});

// ----------------- CONNEXION À MONGODB -----------------
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ----------------- DEMARRAGE DU SERVEUR -----------------
const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await registerService();
});
