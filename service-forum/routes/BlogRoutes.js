const express = require('express');
const router = express.Router();
const BlogController = require('../controller/BlogController');
const validate = require('../middl/validateBlog');


router.post('/add', validate, BlogController.addBlog);

router.get('/', BlogController.getBlogs);

router.get('/:id', BlogController.getBlogById);

router.put('/update/:id', validate, BlogController.updateBlog);

router.delete('/delete/:id', BlogController.deleteBlog);

router.post('/likeB/:id', BlogController.toggleLike);

module.exports = router;
