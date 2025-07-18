const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Add debugging middleware
router.use((req, res, next) => {
    console.log(`[PROJECT ROUTES] ${req.method} ${req.path}`);
    console.log("Full URL:", req.url);
    console.log("Params:", req.params);
    next();
});

// Your existing routes in the correct order...
router.get('/by-creator', authMiddleware, projectController.getProjectByCreator);
router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.post('/:projectId/applicants', projectController.submitApplication);
router.get('/:projectId/applications', projectController.getAllApplications);

// Team management routes
router.post('/:projectId/accept-application', authMiddleware, projectController.acceptApplication);
router.post('/:projectId/reject-application', authMiddleware, projectController.rejectApplication);

// Dynamic route last
router.get('/:projectId', projectController.getProjectById);

module.exports = router;