const express = require('express');
const router = express.Router();
const CommentaireController = require('../controller/CommentaireController');
const validate = require('../middl/validateCommentaire');


router.post('/add/:blogId', validate, CommentaireController.addCommentaire);

//router.get('/', CommentaireController.getCommentaire);

router.get('/blog/:blogId', CommentaireController.getCommentaireByBlog);

router.get('/:id', CommentaireController.getCommentaireById);

router.put('/update/:id', validate, CommentaireController.updateCommentaire);

router.delete('/delete/:id', CommentaireController.deleteCommentaire);

router.post('/likeC/:id', CommentaireController.toggleLikeComment);


module.exports = router;
