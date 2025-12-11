const express = require('express')
const router = express.Router()
const Produit = require("../model/produit")
const produitController = require("../controller/produitController")
const { authenticateToken } = require('../middl/authMiddleware');

router.get('/produit', (req, res) => {
    console.log('produit route test ok')
})

router.post("/add",authenticateToken, produitController.add)




router.get("/showproduit", authenticateToken,produitController.showproduit)
router.get("/showproduitbyid/:id",authenticateToken, produitController.showproduitbyid)

router.get("/showproduitbyname/:nom", async (req, res) => {
    try {
        const produit = await Produit.findOne({ nom: req.params.nom });
        res.status(200).json(produit);
    } catch (err) {
        console.log(err);
    }
})

router.get("/showAllproduitbyname/:nom", async (req, res) => {
    try {
        const produits = await Produit.find({ nom: req.params.nom });
        res.status(200).json(produits);
    } catch (err) {
        console.log(err);
    }
})

router.delete("/deleteproduit/:id", async (req, res) => {
    try {
        await Produit.findByIdAndDelete(req.params.id);
        res.status(200).json("produit supprimé");
    } catch (err) {
        console.log(err);
    }
})

router.put("/updateproduit/:id", async (req, res) => {
    try {
        const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(produit);
    } catch (err) {
        console.log(err);
    }
})

// Routes pour les méthodes métier
router.get("/calculerValeurStock/:id", produitController.calculerValeurStock)
router.get("/filtrerProduitsParPrix", produitController.filtrerProduitsParPrix)
router.get("/verifierStock/:id", produitController.verifierStock)
router.put("/appliquerReduction/:id", produitController.appliquerReduction)
router.get("/genererRapportProduits", produitController.genererRapportProduits)

module.exports = router
