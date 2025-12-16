const Produit = require("../model/produit");
const Categorie = require('../model/categorie'); // ← AJOUT OBLIGATOIRE

async function add(req, res) {
    try {
        const { nom, prix, description, quantite, categorie } = req.body;

        // Vérifie que l'ID de categorie est bien fourni
        if (!categorie) {
            return res.status(400).json({ message: "L'ID de la catégorie est obligatoire." });
        }

        // Vérifie que cette catégorie existe en base
        const categorieExiste = await Categorie.findById(categorie);
        if (!categorieExiste) {
            return res.status(404).json({ message: "Catégorie introuvable." });
        }

        // Création du produit
        const produit = new Produit({
            nom,
            prix,
            description,
            quantite,
            categorie
        });

        await produit.save();

        // Renvoie le produit avec la catégorie populée
        const produitFinal = await Produit.findById(produit._id).populate("categorie");

        res.status(200).json(produitFinal);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
}


async function showproduit(req, res) {
    try {
        const produits = await Produit.find();
        res.status(200).json(produits);
    } catch (err) {
        console.log(err);
    }
}

async function showproduitbyid(req, res) {
    try {
        const produit = await Produit.findById(req.params.id);
        res.status(200).json(produit);
    } catch (err) {
        console.log(err);
    }
}

// Calculer la valeur du stock d'un produit
async function calculerValeurStock(req, res) {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        const valeur = produit.calculerValeurStock();
        res.status(200).json({
            produit: produit.nom,
            prix: produit.prix,
            quantite: produit.quantite,
            valeurStock: valeur
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erreur lors du calcul' });
    }
}

// Filtrer les produits par plage de prix
async function filtrerProduitsParPrix(req, res) {
    try {
        const { min, max } = req.query;
        if (!min || !max) {
            return res.status(400).json({ message: 'Les paramètres min et max sont requis' });
        }
        const produits = await Produit.filtrerProduitsParPrix(parseFloat(min), parseFloat(max));
        res.status(200).json(produits);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erreur lors du filtrage' });
    }
}

// Vérifier le stock d'un produit
async function verifierStock(req, res) {
    try {
        const result = await Produit.verifierStock(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message || 'Erreur lors de la vérification' });
    }
}

// Appliquer une réduction
async function appliquerReduction(req, res) {
    try {
        const { pourcentage } = req.body;
        if (!pourcentage || pourcentage < 0 || pourcentage > 100) {
            return res.status(400).json({ message: 'Le pourcentage doit être entre 0 et 100' });
        }
        const produit = await Produit.appliquerReduction(req.params.id, pourcentage);
        res.status(200).json({
            message: `Réduction de ${pourcentage}% appliquée`,
            produit: produit
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message || 'Erreur lors de l\'application de la réduction' });
    }
}

// Générer un rapport sur les produits
async function genererRapportProduits(req, res) {
    try {
        const rapport = await Produit.genererRapportProduits();
        res.status(200).json(rapport);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
    }
}

module.exports = { 
    add, 
    showproduit, 
    showproduitbyid,
    calculerValeurStock,
    filtrerProduitsParPrix,
    verifierStock,
    appliquerReduction,
    genererRapportProduits
};
