const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require("axios");

const app = express();

const serviceName = "monservice-event";
const discoveryserviceurl = "http://localhost:4000/register";
const dbConfPath = path.join(__dirname, 'config', 'dbconnection.json');
const { MONGO_URI } = JSON.parse(fs.readFileSync(dbConfPath, 'utf-8'));
const registerService = async () => {
  try {
    await axios.post(discoveryserviceurl, {
      name: "service-event",
      address: "localhost",   // Pas http://localhost
      port: 3002,
    });

    console.log(serviceName + " bien enregistré");
  } catch (error) {
    console.log("Erreur dans l'enregistrement : " + error.message);
  }
};
app.listen(3002, () => {
  console.log("service event tourne sur http://localhost:3002");
registerService();
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use("/events", require("./routes/events"));
app.use("/reservations", require("./routes/reservations"));
app.get('/', (req, res) => {
  res.send("Bienvenue dans votre service : " + serviceName);
});

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

app.use('/api/events', require('./routes/events'));           
app.use('/api/reservations', require('./routes/reservations'));

app.get('/', (req, res) => res.json({ ok: true, app: 'gym-app' }));

app.use((err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

