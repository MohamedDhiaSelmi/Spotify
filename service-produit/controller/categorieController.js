const Categorie = require("../model/categorie");
const Produit = require("../model/produit");

// ➤ CREATE
async function add(req, res) {
    try {
        const categorie = new Categorie(req.body);
        await categorie.save();
        res.status(201).json(categorie);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de l'ajout", error: err });
    }
}

// ➤ READ ALL
async function showcategorie(req, res) {
    try {
        const categories = await Categorie.find();
        res.status(200).json(categories);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de l'affichage", error: err });
    }
}

// ➤ READ ONE
async function showcategoriebyid(req, res) {
    try {
        const categorie = await Categorie.findById(req.params.id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.status(200).json(categorie);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de la recherche", error: err });
    }
}

// ➤ UPDATE
async function updatecategorie(req, res) {
    try {
        const categorie = await Categorie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // renvoie la version mise à jour
        );

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.status(200).json(categorie);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de la modification", error: err });
    }
}

// ➤ DELETE
async function deletecategorie(req, res) {
    try {
        const categorie = await Categorie.findByIdAndDelete(req.params.id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        res.status(200).json({ message: "Catégorie supprimée avec succès" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de la suppression", error: err });
    }
}
// ➤ FILTER + SORT
async function filtrerEtTrier(req, res) {
    try {
        const { search, sort = "nom", order = "asc" } = req.query;

        let filtre = {};
        if (search) {
            filtre.nom = { $regex: search, $options: "i" }; // recherche insensible à la casse
        }

        const categories = await Categorie.find(filtre)
            .sort({ [sort]: order === "asc" ? 1 : -1 });

        res.status(200).json(categories);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors du filtrage/tri", error: err });
    }
}

// ➤ CHECK IF CATEGORY HAS PRODUCTS
async function verifierProduits(req, res) {
    try {
        const id = req.params.id;

        const count = await Produit.countDocuments({ categorie: id });

        res.status(200).json({
            categorie: id,
            produits: count,
            message: count > 0 ? "Cette catégorie contient des produits" : "Catégorie vide"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de la vérification", error: err });
    }
}
// ➤ GET CATEGORY WITH PRODUCTS
async function getCategorieAvecProduits(req, res) {
    try {
        const id = req.params.id;

        const categorie = await Categorie.findById(id);
        if (!categorie) {
            return res.status(404).json({ message: "Catégorie introuvable" });
        }

        const produits = await Produit.find({ categorie: id });

        res.status(200).json({
            categorie,
            produits
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur lors de la récupération", error: err });
    }
}



module.exports = {
    add,
    showcategorie,
    showcategoriebyid,
    updatecategorie,
    deletecategorie,
    filtrerEtTrier,
    verifierProduits,
    getCategorieAvecProduits
};

