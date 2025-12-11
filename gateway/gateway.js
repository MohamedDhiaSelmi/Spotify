const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
port = 5000;
const servicedecouverteurl = "http://localhost:4000/services";
app.use(express.json());
// Servir le fichier dashboard.html à la racine
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use(async (req, res, next) => {
  try {
    const reponse = await axios.get("http://localhost:4000/services");
    const services = reponse.data;
    // console.log("services :" + JSON.stringify(services));

    if (req.path.startsWith("/service-nutrition")) {
      req.targetService = services.find((s) => s.name === "service-nutrition");
      console.log("TargetService1 :" + JSON.stringify(req.targetService));
    } else if (req.path.startsWith("/service-planning")) {
      req.targetService = services.find((s) => s.name === "service-planning");
      console.log("TargetService2 :" + JSON.stringify(req.targetService));
    } else if (req.path.startsWith("/service-forum")) {
      req.targetService = services.find((s) => s.name === "service-forum");
      console.log("TargetService2 :" + JSON.stringify(req.targetService));
    }
    else if (req.path.startsWith("/service-produit")) {
      req.targetService = services.find((s) => s.name === "service-produit");
      console.log("TargetService2 :" + JSON.stringify(req.targetService));
    }
    else if (req.path.startsWith("/service-user")) {
      req.targetService = services.find((s) => s.name === "service-user");
      console.log("TargetService2 :" + JSON.stringify(req.targetService));
    }

    if (req.targetService) {
      req.targetServiceUrl = `${req.targetService.address}:${req.targetService.port}`;
      next();
      console.log(req.targetServiceUrl);
    } else {
      res.status(404).send({ message: "non trouvable" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.use(async (req, res) => {
  try {
    console.log(req.body);
    const reponse = await axios({
      method: req.method,
      url: `${req.targetServiceUrl}${req.originalUrl.replace(
        /^\/service-(nutrition|planning|forum|produit|user)/,
        ""
      )}`,
      data: req.body,
    });
    console.log("data ++++++++++++++++" + reponse.data);
    res.send(reponse.data);
  } catch (error) {
    // console.log("data ++++++++++++++++" + reponse.data);
    res.status(500).send(error);
  }
});

app.listen(port, console.log("gateway in run"));
