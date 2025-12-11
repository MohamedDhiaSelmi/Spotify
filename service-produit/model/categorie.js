const mongo = require('mongoose')
const schema = mongo.Schema

const Categorie = new schema({
    nom: String,
    description: String
})

module.exports = mongo.model('categorie', Categorie)
