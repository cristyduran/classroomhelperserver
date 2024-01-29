// classRoutes.js
const express = require('express');
const router = express.Router();
const createClass = require('../controllers/classController');

// Define class-related routes
router.post('/createClass', createClass);
// Add other class-related routes here

module.exports = router;
