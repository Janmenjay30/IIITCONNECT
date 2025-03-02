const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware'); // Protect route
const Project=require('../models/project');

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.get('/by-creator', authMiddleware, projectController.getProjectByCreator);

router.post('/', authMiddleware, projectController.createProject);

router.get('/', projectController.getAllProjects);

router.get('/:projectId',projectController.getProjectById);

router.post('/:projectId/applicants', projectController.submitApplication);




module.exports = router;
