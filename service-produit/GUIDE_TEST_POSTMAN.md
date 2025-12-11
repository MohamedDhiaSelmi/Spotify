# Guide de Test avec Postman LE VRAI VRAI VRAI 

## Configuration initiale

1. **Démarrez votre serveur** :
   ```bash
   npm run dev
   ```
   Le serveur tourne sur `http://localhost:3000`

2. **Ouvrez Postman** et créez une nouvelle collection "Méthodes Métier"

---

## Étapes de test

### ÉTAPE 1 : Créer un produit (pour avoir des données à tester)

**Méthode** : `POST`  
**URL** : `http://localhost:3000/produit/add`

**Body** (onglet Body → raw → JSON) :
```json
{
  "nom": "Haltères 10kg",
  "prix": 50,
  "description": "Haltères en fonte",
  "categorie": "Équipement",
  "quantite": 15
}
```

**Cliquez sur "Send"**  
**Copiez l'ID** du produit créé (dans la réponse JSON, champ `_id`)

---

### ÉTAPE 2 : Créer un deuxième produit avec stock faible

**Méthode** : `POST`  
**URL** : `http://localhost:3000/produit/add`

**Body** :
```json
{
  "nom": "Corde à sauter",
  "prix": 15,
  "description": "Corde en nylon",
  "categorie": "Accessoire",
  "quantite": 3
}
```

---

## Tests des Méthodes Métier

### 1. calculerValeurStock()

**Méthode** : `GET`  
**URL** : `http://localhost:3000/produit/calculerValeurStock/VOTRE_ID_ICI`

⚠️ Remplacez `VOTRE_ID_ICI` par l'ID du premier produit (celui avec quantite: 15)

**Résultat attendu** :
```json
{
  "produit": "Haltères 10kg",
  "prix": 50,
  "quantite": 15,
  "valeurStock": 750
}
```

---

### 2. filtrerProduitsParPrix()

**Méthode** : `GET`  
**URL** : `http://localhost:3000/produit/filtrerProduitsParPrix?min=10&max=50`

**Résultat attendu** : Liste des produits avec prix entre 10 et 50

---

### 3. verifierStock()

**Méthode** : `GET`  
**URL** : `http://localhost:3000/produit/verifierStock/VOTRE_ID_ICI`

**Test 1** : Avec le produit qui a quantite: 15 (stock OK)
```json
{
  "produit": { ... },
  "alerte": false,
  "message": "Stock OK (15 unités)"
}
```

**Test 2** : Avec le produit qui a quantite: 3 (alerte)
```json
{
  "produit": { ... },
  "alerte": true,
  "message": "⚠️ Alerte: Stock faible (3 unités)"
}
```

---

### 4. appliquerReduction()

**Méthode** : `PUT`  
**URL** : `http://localhost:3000/produit/appliquerReduction/VOTRE_ID_ICI`

**Body** (onglet Body → raw → JSON) :
```json
{
  "pourcentage": 20
}
```

**Résultat attendu** : Le prix passe de 50 à 40 (réduction de 20%)
```json
{
  "message": "Réduction de 20% appliquée",
  "produit": {
    "prix": 40,
    ...
  }
}
```

---

### 5. genererRapportProduits()

**Méthode** : `GET`  
**URL** : `http://localhost:3000/produit/genererRapportProduits`

**Résultat attendu** :
```json
{
  "totalProduits": 2,
  "valeurTotaleStock": 795,
  "produitsEnRupture": 0,
  "produitsStockFaible": 1,
  "prixMoyen": "32.50",
  "quantiteTotale": 18,
  "produits": [ ... ]
}
```

---

## Résumé des URLs à tester

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/produit/add` | Créer un produit |
| GET | `/produit/calculerValeurStock/:id` | Calculer valeur stock |
| GET | `/produit/filtrerProduitsParPrix?min=10&max=50` | Filtrer par prix |
| GET | `/produit/verifierStock/:id` | Vérifier stock |
| PUT | `/produit/appliquerReduction/:id` | Appliquer réduction |
| GET | `/produit/genererRapportProduits` | Générer rapport |

---

## Astuce Postman

Vous pouvez créer des **variables d'environnement** dans Postman :
- Variable : `base_url` = `http://localhost:3000`
- Variable : `produit_id` = `VOTRE_ID_ICI`

Ensuite utilisez : `{{base_url}}/produit/calculerValeurStock/{{produit_id}}`

