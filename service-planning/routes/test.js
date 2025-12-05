const express = require('express');
const router = express.Router();
const coursController = require('../controller/coursController');
const validate=require('../middl/validate')
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

/*router.post("/add",validate,testController.addUser);
router.post('/add', testController.addUser);

//show users
router.get('/', testController.getUsers);

//delete user by name
router.delete('/delete/:name', testController.deleteUser)

//update user by name
router.put('/update/:name', testController.updateUser)*/
router.post('/add',coursController.addCours);
router.get('/', coursController.getCours);
router.delete('/delete/:nom_cours', coursController.deleteCours);
router.put('/update/:nom_cours', coursController.updateCours);
// Recherche cours par nom
router.get('/search/:nom', coursController.getCoursByName);
router.get('/sorted', coursController.getCoursSortedByName);

module.exports = router;