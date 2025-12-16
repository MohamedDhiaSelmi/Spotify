const express = require('express');
const router = express.Router();
const RepasController = require('../controller/RepasController');
const validateRepas=require('../middl/validateRepas')
const { authenticateToken } = require('../middl/authMiddleware');
/*
router.post('/add/:name/:email/:password', (req, res) => {
  console.log('User creation route accessed');
  const newUser = new userModel({
    name: req.params.name,
    email: req.params.email,
    password: req.params.password
  });
  newUser.save()
    .then(() => res.status(201).send('User created'))
    .catch(err => res.status(400).send('Error creating user'));
});
*/
// add repas (avec validation)
router.post("/add",authenticateToken,validateRepas,RepasController.addRepas);
router.post('/add',authenticateToken,RepasController.addRepas);

//show repas
router.get('/',authenticateToken,RepasController.getRepas);

//delete repas by name
router.delete('/delete/:nom_repas', authenticateToken,RepasController.deleteRepas)

//update repas by name
router.put('/update/:nom_repas', authenticateToken,RepasController.updateRepas)

// route pour la recherche d un repas par nutriment 
router.get('/search',authenticateToken, RepasController.searchRepasByNutriment);
//////// route 
router.get('/suggestion',authenticateToken, RepasController.getRepasSuggestion);
module.exports = router;