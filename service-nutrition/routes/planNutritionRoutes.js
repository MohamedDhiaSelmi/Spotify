const express = require('express');
const router = express.Router();
const PlanController = require('../controller/PlanController');
const validatePlan=require('../middl/validatePlan')
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
// add plan (avec validation)
router.post("/add",validatePlan,PlanController.addPlan);
router.post('/add', PlanController.addPlan);

//show plans
router.get('/', PlanController.getPlans);

//delete plan by name
router.delete('/delete/:nom_plan', PlanController.deletePlan)

//update plan by name
router.put('/update/:nom_plan', PlanController.updatePlan)
// route pour le total de calories
router.get('/:id_plan/calories-total', PlanController.getTotalCaloriesByPlan);


module.exports = router;