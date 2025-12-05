const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  blogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true 
  },
  auteurBlog: { 
    type: String, 
    required: true 
  }, // destinataire : auteur du blog
  type: { 
    type: String,
    enum: ['reply', 'comment', 'like_blog', 'like_comment'], 
    required: true 
  },
  sourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
