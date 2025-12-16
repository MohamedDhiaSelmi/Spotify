const BlogModel = require('../model/Blog'); 
const Notification = require('../model/Notification');
const { createNotification } = require('../utils/notificationHelper');


async function addBlog(req, res) {
  console.log('Route création Blog :');
  try {
    const { titre, contenu, auteur, categorie, image, tags, status } = req.body;

    if (!titre || !contenu || !auteur) {
      return res.status(400).json({ error: 'titre, contenu et auteur sont requis' });
    }

    const blog = new BlogModel({
      titre,
      contenu,
      auteur,
      categorie,
      image,
      tags,
      status
    });

    await blog.save();
    return res.status(201).json({ message: 'Blog créé avec succès', blog });
  } catch (err) {
    console.error('Erreur lors de la création du blog :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}


async function getBlogs(req, res) {
  try {
    const blogs = await BlogModel.find().sort({ date_publication: -1 });
    return res.status(200).json({ blogs });
  } catch (err) {
    console.error('Erreur lors de la récupération des blogs :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getBlogById(req, res) {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog introuvable' });
    }
    
    // Incrémenter le nombre de vues
    blog.vues += 1;
    await blog.save();
    
    return res.status(200).json({ blog });
  } catch (err) {
    console.error(' Erreur lors de la récupération du blog :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function updateBlog(req, res) {
  try {
    const updates = req.body;
    updates.derniere_modification = Date.now();

    const result = await BlogModel.updateOne({ _id: req.params.id }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Blog non trouvé' });
    }

    return res.status(200).json({ message: 'Blog mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du blog :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function deleteBlog(req, res) {
  try {
    const result = await BlogModel.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Blog non trouvé' });
    }
    return res.status(200).json({ message: 'Blog supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du blog :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function toggleLike(req, res) {
  try {
    const { userId } = req.body;
    const blog = await BlogModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog non trouvé' });
    }

    const alreadyLiked = blog.likes.includes(userId);
    if (alreadyLiked) {
      blog.likes = blog.likes.filter(id => id !== userId);
    } else {
      blog.likes.push(userId);

      // Créer une notification seulement quand on like
      await createNotification(
        blog,
        'like_blog',
        blog._id,
        `Ton blog "${blog.titre}" a reçu un nouveau like ❤️`
      );
    }

    await blog.save();
    return res.status(200).json({
      message: alreadyLiked ? 'Like retiré' : 'Blog liké',
      totalLikes: blog.likes.length
    });
  } catch (err) {
    console.error('Erreur lors du like/unlike :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}



module.exports = {
  addBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike
};
