const express = require('express');
const router = express.Router();

const applicantController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware'); // Protect route

router.get('/numberOfApplications',authMiddleware,applicantController.getNumberOfApplications);

router.get('/:projectId',authMiddleware,applicantController.getAllApplications);

module.exports=router;