const BlogModel = require('../model/Blog');
const CommentaireModel = require('../model/Commentaire');


//Blog
// 1. Top n des blogs les plus likés (par nombre de likes)
async function topLikedBlogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const pipeline = [
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1 } },
      { $limit: limit },
      { $project: { titre: 1, auteur: 1, likesCount: 1, nombreCommentaires: 1, vues: 1 } }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 2. Top n des blogs les plus commentés (par nombreCommentaires)
async function topCommentedBlogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const pipeline = [
      { $sort: { nombreCommentaires: -1 } },
      { $limit: limit },
      { $project: { titre: 1, auteur: 1, nombreCommentaires: 1, likes: 1, vues: 1 } }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 3. Top n des blogs les plus vus
async function topViewedBlogs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const pipeline = [
      { $sort: { vues: -1 } },
      { $limit: limit },
      { $project: { titre: 1, auteur: 1, vues: 1, nombreCommentaires: 1 } }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 4. Répartition des blogs par catégorie
async function blogsByCategory(req, res) {
  try {
    const pipeline = [
      { $group: { _id: '$categorie', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 5. Top tags (fréquence des tags)
async function topTags(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pipeline = [
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 6. Moyenne de commentaires par blog, total blogs, total commentaires
async function commentsSummary(req, res) {
  try {
    const pipeline = [
      { $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalComments: { $sum: { $ifNull: ['$nombreCommentaires', 0] } },
          avgCommentsPerBlog: { $avg: { $ifNull: ['$nombreCommentaires', 0] } }
        }
      },
      { $project: { _id: 0 } }
    ];
    const result = await BlogModel.aggregate(pipeline);
    return res.json({ result: result[0] || { totalBlogs:0, totalComments:0, avgCommentsPerBlog:0 } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

//Commentaires 

// 7. Top auteurs de commentaires (par nombre de commentaires écrits)
async function topCommentAuthors(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pipeline = [
      { $group: { _id: '$auteurC', totalCommentaires: { $sum: 1 } } },
      { $sort: { totalCommentaires: -1 } },
      { $limit: limit }
    ];
    const result = await CommentaireModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 8. Evolution des commentaires par jour (dernier N jours)
async function commentsPerDay(req, res) {
  try {
    const days = parseInt(req.query.days) || 7;
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0,0,0,0);

    const pipeline = [
      { $match: { date_commentaire: { $gte: start } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date_commentaire' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const result = await CommentaireModel.aggregate(pipeline);
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 9. Moyenne de likes par commentaire et total likes
async function commentLikesSummary(req, res) {
  try {
    const pipeline = [
      { $addFields: { likesCount: { $size: { $ifNull: ['$likesC', []] } } } },
      { $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          avgLikesPerComment: { $avg: '$likesCount' }
        }
      },
      { $project: { _id: 0 } }
    ];
    const result = await CommentaireModel.aggregate(pipeline);
    return res.json({ result: result[0] || { totalComments:0, totalLikes:0, avgLikesPerComment:0 } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  // blogs
  topLikedBlogs,
  topCommentedBlogs,
  topViewedBlogs,
  blogsByCategory,
  topTags,
  commentsSummary,
  // commentaires
  topCommentAuthors,
  commentsPerDay,
  commentLikesSummary
};
