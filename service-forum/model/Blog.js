const mongoose = require('mongoose');
const schema= mongoose.Schema

const Blog = new schema({
  titre: { 
    type: String, 
    required: true 
  },
  contenu: { 
    type: String,
    required: true 
  },
  auteur: { 
    type: String, 
    required: true 
  },
  categorie: { 
    type: String 
  },
  image: { 
    type: String 
  },
  date_publication: { 
    type: Date, 
    default: Date.now 
  },
  derniere_modification: { 
    type: Date, 
    default: Date.now 
  },
  likes: { 
    type: [String], 
    default: [] 
  },
  nombreCommentaires: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['publié', 'brouillon', 'archivé'], 
    default: 'publié' 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  vues: { 
    type: Number, 
    default: 0 }
});

module.exports = mongoose.model('blog', Blog);