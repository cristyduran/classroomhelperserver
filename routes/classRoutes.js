// classRoutes.js
const express = require('express');
const router = express.Router();
const {createClass, getClassData, getSingleClassData, getClassRosterAndAssignments, saveCompletion} = require('../controllers/classController');

// Define class-related routes
router.post('/createClass', createClass);
// Add other class-related routes here
router.get('/myClasses', getClassData);
router.get('/:classId', getSingleClassData); //Retrieve Single class by ID
router.get('/:classId/student-data', getClassRosterAndAssignments);
router.post('/:classId/complete', saveCompletion);

module.exports = router;
