const mongoose = require('mongoose');
const schema= mongoose.Schema

const Commentaire = new schema({
    description: { 
        type: String, 
        required: true 
    },
  auteurC: { 
    type: String, 
    required: true 
},
  date_commentaire: { 
    type: Date, 
    default: Date.now 
},
  likesC: { 
    type: [String], 
    default: [] 
},
  statusC: { 
    type: String, 
    enum: ['visible', 'modéré', 'supprimé'], 
    default: 'visible' 
},
  blogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true },
  reponses: [{
    auteur: String,
    contenu: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('commentaire', Commentaire);