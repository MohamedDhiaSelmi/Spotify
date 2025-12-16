const CommentaireModel = require('../model/Commentaire');
const BlogModel = require('../model/Blog');
//const Blog = require('../model/Blog');
const { createNotification } = require('../utils/notificationHelper');



async function addCommentaire(req, res) {
  console.log('Route création Commentaire :');
  try {
    const { auteurC, description } = req.body;
    const { blogId } = req.params;

    if (!auteurC || !description) {
      return res.status(400).json({ error: 'auteur et contenu sont requis' });
    }

    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog introuvable' });
    }

    const commentaire = new CommentaireModel({
      auteurC,
      description,
      blogId
    });

    await commentaire.save();

    // Incrémenter le nombre de commentaires du blog
    blog.nombreCommentaires += 1;
    await blog.save();

     // 🔔 Création de la notification
    await createNotification(
      blog,
      'comment',
      commentaire._id,
      `Ton blog "${blog.titre}" a reçu un nouveau commentaire de ${auteurC}`
    );


    return res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      commentaire
    });
  } catch (err) {
    console.error('Erreur lors de la création du commentaire :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getCommentaire(req, res) {
  try {
    const commentaires = await CommentaireModel.find()
      .populate('blogId', 'titre auteur')
      .sort({ date_creation: -1 });

    return res.status(200).json({ commentaires });
  } catch (err) {
    console.error('Erreur lors de la récupération des commentaires :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getCommentaireByBlog(req, res) {
  try {
    const { blogId } = req.params;
    const commentaires = await CommentaireModel.find({ blogId })
      .sort({ date_creation: -1 });

    return res.status(200).json({ commentaires });
  } catch (err) {
    console.error('Erreur lors de la récupération des commentaires du blog :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getCommentaireById(req, res) {
  try {
    const commentaire = await CommentaireModel.findById(req.params.id)
      .populate('blogId', 'titre auteur');

    if (!commentaire) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }

    return res.status(200).json({ commentaire });
  } 
  catch (err) {
    console.error('Erreur lors de la récupération du commentaire :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function updateCommentaire(req, res) {
  try {
    const { id } = req.params;
    const { auteurC, description } = req.body;

    const commentaire = await CommentaireModel.findByIdAndUpdate(
      id,
      { auteurC, description },
      { new: true, runValidators: true }
    );

    if (!commentaire) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }

    return res.status(200).json({
      message: 'Commentaire mis à jour avec succès',
      commentaire
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du commentaire :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}


async function deleteCommentaire(req, res) {
  try {
    const { id } = req.params;
    const commentaire = await CommentaireModel.findByIdAndDelete(id);

    if (!commentaire) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }

    return res.status(200).json({ message: 'Commentaire supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du commentaire :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function toggleLikeComment(req, res) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const commentaire = await CommentaireModel.findById(id);
    if (!commentaire) {
      return res.status(404).json({ error: 'Commentaire introuvable' });
    }

    const alreadyLiked = commentaire.likesC.includes(userId);
    if (alreadyLiked) {
      commentaire.likesC = commentaire.likesC.filter(id => id !== userId);
    } else {
      commentaire.likesC.push(userId);
    }

    await commentaire.save();

    return res.status(200).json({
      message: alreadyLiked ? 'Like retiré du commentaire' : 'Commentaire liké',
      totalLikes: commentaire.likesC.length
    });
  } catch (err) {
    console.error('Erreur lors du like/unlike du commentaire :', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

module.exports = {
  addCommentaire,
  getCommentaire,
  getCommentaireByBlog,
  getCommentaireById,
  updateCommentaire,
  deleteCommentaire,
  toggleLikeComment
};
