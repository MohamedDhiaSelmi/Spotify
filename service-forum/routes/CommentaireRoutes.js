const express = require('express');
const router = express.Router();
const CommentaireController = require('../controller/CommentaireController');
const validate = require('../middl/validateCommentaire');
const { authenticateToken } = require('../middl/authMiddleware');


router.post('/add/:blogId',authenticateToken, validate, CommentaireController.addCommentaire);

//router.get('/', CommentaireController.getCommentaire);

router.get('/blog/:blogId',authenticateToken, CommentaireController.getCommentaireByBlog);

router.get('/:id',authenticateToken, CommentaireController.getCommentaireById);

router.put('/update/:id',authenticateToken,validate, CommentaireController.updateCommentaire);

router.delete('/delete/:id',authenticateToken, CommentaireController.deleteCommentaire);

router.post('/likeC/:id',authenticateToken,CommentaireController.toggleLikeComment);


module.exports = router;
