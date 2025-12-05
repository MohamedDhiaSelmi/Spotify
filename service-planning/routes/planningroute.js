const express = require('express');
const router = express.Router();
const planningController = require('../controller/planningController');


// Routes
router.post('/add', planningController.addPlanning);
router.get('/', planningController.getPlanning);
router.delete('/delete/:id', planningController.deletePlanning);
router.put('/update/:id', planningController.updatePlanning);
router.get('/filter', planningController.filterPlanning);

module.exports = router;
