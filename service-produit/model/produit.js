const mongo = require('mongoose')
const schema = mongo.Schema

const Produit = new schema({
    nom: String,
    prix: Number,
    description: String,

    // Relation vers categorie
    categorie: { type: mongo.Schema.Types.ObjectId, ref: 'categorie' },

    quantite: { type: Number, default: 0 }
    
})

// Méthode d'instance : calculer la valeur du stock pour un produit
Produit.methods.calculerValeurStock = function() {
    return this.prix * this.quantite;
}

// Méthode statique : filtrer les produits par plage de prix
Produit.statics.filtrerProduitsParPrix = async function(min, max) {
    return await this.find({
        prix: { $gte: min, $lte: max }
    });
}

// Méthode statique : vérifier le stock d'un produit (alerte si < 5)
Produit.statics.verifierStock = async function(id) {
    const produit = await this.findById(id).populate("categorie");

    if (!produit) {
        throw new Error('Produit non trouvé');
    }
    return {
        produit: produit,
        alerte: produit.quantite < 5,
        message: produit.quantite < 5
            ? `⚠️ Alerte: Stock faible (${produit.quantite} unités)`
            : `Stock OK (${produit.quantite} unités)`
    };
}

// Méthode statique : appliquer une réduction en pourcentage
Produit.statics.appliquerReduction = async function(id, pourcentage) {
    const produit = await this.findById(id);
    if (!produit) {
        throw new Error('Produit non trouvé');
    }
    const reduction = (produit.prix * pourcentage) / 100;
    produit.prix = produit.prix - reduction;
    await produit.save();
    return produit;
}

// Méthode statique : générer un rapport statistique sur les produits
Produit.statics.genererRapportProduits = async function() {
    const produits = await this.find().populate("categorie");

    const totalProduits = produits.length;
    const valeurTotaleStock = produits.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    const produitsEnRupture = produits.filter(p => p.quantite === 0).length;
    const produitsStockFaible = produits.filter(p => p.quantite > 0 && p.quantite < 5).length;
    const prixMoyen = produits.length > 0 ? produits.reduce((sum, p) => sum + p.prix, 0) / produits.length : 0;
    const quantiteTotale = produits.reduce((sum, p) => sum + p.quantite, 0);

    return {
        totalProduits: totalProduits,
        valeurTotaleStock: valeurTotaleStock,
        produitsEnRupture: produitsEnRupture,
        produitsStockFaible: produitsStockFaible,
        prixMoyen: prixMoyen.toFixed(2),
        quantiteTotale: quantiteTotale,
        produits: produits
    };
}

module.exports = mongo.model('produit', Produit)
