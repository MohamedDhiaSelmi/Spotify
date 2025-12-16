const express = require('express');
const router = express.Router();
const planningController = require('../controller/planningController');
const { authenticateToken } = require('../middl/authMiddleware');


// Routes
router.post('/add', authenticateToken, planningController.addPlanning);
router.get('/',authenticateToken, planningController.getPlanning);
router.delete('/delete/:id',authenticateToken, planningController.deletePlanning);
router.put('/update/:id',authenticateToken,planningController.updatePlanning);
router.get('/filter',authenticateToken, planningController.filterPlanning);

module.exports = router;
