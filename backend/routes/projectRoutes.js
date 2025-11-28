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

// correct Order of routes
router.get('/by-creator', authMiddleware, projectController.getProjectByCreator);
router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.post('/:projectId/applicants', projectController.submitApplication);
router.get('/:projectId/applications', projectController.getAllApplications);

// Missing endpoints to add:
router.get('/:projectId/team', authMiddleware, projectController.getProjectTeam);
router.post('/:projectId/remove-member', authMiddleware, projectController.removeMember);
router.post('/:projectId/leave', authMiddleware, projectController.leaveProject);
router.get('/my-teams', authMiddleware, projectController.getMyTeams);
router.put('/:projectId/update-role', authMiddleware, projectController.updateMemberRole);

// Team management routes
router.post('/:projectId/accept-application', authMiddleware, projectController.acceptApplication);
router.post('/:projectId/reject-application', authMiddleware, projectController.rejectApplication);

// Task management routes
router.post('/:projectId/tasks', authMiddleware, projectController.createTask);
router.get('/:projectId/tasks', authMiddleware, projectController.getProjectTasks);
router.put('/:projectId/tasks/:taskId/status', authMiddleware, projectController.updateTaskStatus);
router.delete('/:projectId/tasks/:taskId', authMiddleware, projectController.deleteTask);


// Dynamic route last
router.get('/:projectId', projectController.getProjectById);

module.exports = router;