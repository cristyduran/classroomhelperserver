// classRoutes.js
const express = require('express');
const router = express.Router();
const {createClass, getClassData} = require('../controllers/classController');

// Define class-related routes
router.post('/createClass', createClass);
// Add other class-related routes here
router.get('/myClasses', getClassData);

module.exports = router;
