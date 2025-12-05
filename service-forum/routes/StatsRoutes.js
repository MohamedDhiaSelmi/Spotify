const express = require('express');
const router = express.Router();
const stats = require('../controller/StatsController');

// Blogs
router.get('/Blog/top-liked', stats.topLikedBlogs);
router.get('/Blog/top-commented', stats.topCommentedBlogs);
router.get('/Blog/top-viewed', stats.topViewedBlogs);
router.get('/Blog/by-category', stats.blogsByCategory);
router.get('/Blog/top-tags', stats.topTags);
router.get('/Blog/comments-summary', stats.commentsSummary);

// Commentaires
router.get('/Commentaire/top-authors', stats.topCommentAuthors);
router.get('/Commentaire/per-day', stats.commentsPerDay);
router.get('/Commentaire/likes-summary', stats.commentLikesSummary);

module.exports = router;
