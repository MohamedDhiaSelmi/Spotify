const express = require('express');
const router = express.Router();
const BlogController = require('../controller/BlogController');
const validate = require('../middl/validateBlog');
const { authenticateToken } = require('../middl/authMiddleware');


router.post('/add',authenticateToken,validate, BlogController.addBlog);

router.get('/',authenticateToken,BlogController.getBlogs);

router.get('/:id',authenticateToken,BlogController.getBlogById);

router.put('/update/:id',authenticateToken,validate, BlogController.updateBlog);

router.delete('/delete/:id',authenticateToken,BlogController.deleteBlog);

router.post('/likeB/:id',authenticateToken,BlogController.toggleLike);

module.exports = router;
