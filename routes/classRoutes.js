// classRoutes.js
const express = require('express');
const router = express.Router();
const {createClass, getClassData, getSingleClassData, getClassRosterAndAssignments} = require('../controllers/classController');

// Define class-related routes
router.post('/createClass', createClass);
// Add other class-related routes here
router.get('/myClasses', getClassData);
router.get('/:classId', getSingleClassData); //Retrieve Single class by ID
router.get('/:classId/student-data', getClassRosterAndAssignments);
module.exports = router;
