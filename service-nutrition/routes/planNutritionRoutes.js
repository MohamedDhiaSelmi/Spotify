const express = require('express');
const router = express.Router();
const PlanController = require('../controller/PlanController');
const validatePlan=require('../middl/validatePlan')
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
// add plan (avec validation)
router.post("/add",authenticateToken,validatePlan,PlanController.addPlan);
router.post('/add',authenticateToken, PlanController.addPlan);

//show plans
router.get('/',authenticateToken,PlanController.getPlans);

//delete plan by name
router.delete('/delete/:nom_plan',authenticateToken, PlanController.deletePlan)

//update plan by name
router.put('/update/:nom_plan', authenticateToken,PlanController.updatePlan)
// route pour le total de calories
router.get('/:id_plan/calories-total',authenticateToken, PlanController.getTotalCaloriesByPlan);


module.exports = router;