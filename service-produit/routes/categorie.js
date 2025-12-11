const express = require('express')
const router = express.Router()
const Categorie = require("../model/categorie")
const categorieController = require("../controller/categorieController")
const { authenticateToken } = require('../middl/authMiddleware');

router.get('/categorie', (req, res) => {
    console.log('categorie route test ok')
})

router.post("/add", authenticateToken,categorieController.add)
router.get("/showcategorie",authenticateToken, categorieController.showcategorie)
router.get("/showcategoriebyid/:id", authenticateToken,categorieController.showcategoriebyid)

router.delete("/deletecategorie/:id", async (req, res) => {
    try {
        await Categorie.findByIdAndDelete(req.params.id);
        res.status(200).json("categorie supprimée");
    } catch (err) {
        console.log(err);
    }
})

router.put("/updatecategorie/:id", async (req, res) => {
    try {
        const categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(categorie);
    } catch (err) {
        console.log(err);
    }
})
router.get("/filtrer", categorieController.filtrerEtTrier);

router.get("/verifierProduits/:id", categorieController.verifierProduits);

router.get("/categorieAvecProduits/:id", categorieController.getCategorieAvecProduits);

module.exports = router
