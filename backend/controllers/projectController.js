const Project = require('../models/project');
const Applicant = require('../models/applicant'); // This line should already exist
const User = require('../models/user');
const mongoose = require('mongoose');
// const { validationResult } = require('express-validator'); // If you want validation

// @desc    Create a new project
// @route   POST api/projects

const createProject = async (req, res) => {
    
    try {
        const { title, description, requiredRoles, tags , creatorRole } = req.body;

        // Create a new project
        const project = new Project({
            title,
            description,
            requiredRoles,
            tags,
            creator: req.user._id, 
            teamMembers:[{
              userId:req.user._id,
              role: creatorRole || 'Creator', // Default role for the creator
              joinedAt: new Date(),
              status: 'active'
            }],
            currentTeamSize:1 // Creator counts as 1
        });

        await project.save();

        res.status(201).json({ message: 'Project created successfully', project });  // Return the created project

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in projectController createProject');
    }
};

// Accept an application
const acceptApplication = async (req, res) => {
    console.log("=== ACCEPT APPLICATION CALLED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("User:", req.user?._id);

    try {
        const { projectId } = req.params;
        const { applicationId, assignedRole } = req.body;

        console.log("Accept application - projectId:", projectId);
        console.log("Accept application - applicationId:", applicationId);
        console.log("Accept application - assignedRole:", assignedRole);

        // Find the project and verify ownership
        const project = await Project.findById(projectId);
        if (!project) {
            console.log("Project not found");
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log("Project found:", project.title);

        // Check if user is the project creator
        if (project.creator.toString() !== req.user._id.toString()) {
            console.log("User is not project creator");
            return res.status(403).json({ message: 'Only project creator can accept applications' });
        }

        console.log("User is project creator - OK");

        // Check team size limit
        if (project.currentTeamSize >= project.maxTeamSize) {
            console.log("Team is full");
            return res.status(400).json({ message: 'Team is already full' });
        }

        console.log("Team size OK - current:", project.currentTeamSize, "max:", project.maxTeamSize);

        // Find the application
        const application = await Applicant.findById(applicationId);
        if (!application) {
            console.log("Application not found");
            return res.status(404).json({ message: 'Application not found' });
        }

        console.log("Application found:", application.name, application.email);

        // Find the user by email from application
        const applicantUser = await User.findOne({ email: application.email });
        if (!applicantUser) {
            console.log("Applicant user not found for email:", application.email);
            return res.status(404).json({ message: 'Applicant user not found' });
        }

        console.log("Applicant user found:", applicantUser.name, applicantUser._id);

        // Check if user is already a team member (FIXED)
        const isAlreadyMember = project.teamMembers.some(
            member => member.userId.toString() === applicantUser._id.toString() // ✅ FIXED: Compare userId with userId
        );
        if (isAlreadyMember) {
            console.log("User is already a team member");
            return res.status(400).json({ message: 'User is already a team member' });
        }

        console.log("User is not already a member - OK");

        // Add user to team members
        project.teamMembers.push({
            userId: applicantUser._id,
            role: assignedRole || application.areaOfExpertise,
            joinedAt: new Date(),
            status: 'active'
        });

        // Update team size
        project.currentTeamSize += 1;

        // Remove application from applications array
        project.applications = project.applications.filter(
            app => app.toString() !== applicationId
        );

        console.log("Saving project with new team member...");
        await project.save();

        // Delete the application document
        await Applicant.findByIdAndDelete(applicationId);

        console.log("Application accepted successfully");

        res.json({ 
            message: 'Application accepted successfully', 
            project: await Project.findById(projectId).populate('teamMembers.userId', 'name email')
        });
    } catch (err) {
        console.error('=== ERROR IN ACCEPT APPLICATION ===');
        console.error('Error:', err);
        res.status(500).json({ 
            message: 'Server Error in accepting application',
            error: err.message 
        });
    }
};


// Reject an application
const rejectApplication = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { applicationId } = req.body;

        // Find the project and verify ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is the project creator
        if (project.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only project creator can reject applications' });
        }

        // Remove application from applications array
        project.applications = project.applications.filter(
            app => app.toString() !== applicationId
        );

        await project.save();

        // Delete the application document
        await Applicant.findByIdAndDelete(applicationId);

        res.json({ message: 'Application rejected successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error in rejecting application' });
    }
};

const getProjectByCreator=async(req,res)=>{
    try{
        const user=await User.findById(req.user).select('-password');
        // console.log("user at getprojectsByCreator function ",user);

        if(!user){
            console.log("User not found");
            return res.status(404).json({message:'User not found'});
        }
        const id=user._id;
        const projects=await Project.find({creator:id}).populate('creator','name email').exec();

        // if (projects.length === 0) {
        //     return res.status(200).json({ message: 'No projects found', projects: [] });
        //   }
        res.status(200).json(projects);
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Server Error in getProjectByCreator' });
    }
}

const getAllProjects=async(req,res)=>{
    try{
        const{tags,search}=req.query;
        let query={};

        if(tags){
            query.tags={ $in: tags.split(',') };
        }
        if(search){
            query.$or=[
                {title:{$regex:search,$options:'i'}},
                {description:{$regex:search,$options:'i'}}
            ];
        }
        const projects=await Project.find(query)
        .populate('creator','name email')
        .sort({createdAt:-1});

        res.json({
            success:true,

        count:projects.length,
        data:projects
        });
    }catch(err){
        console.error(err);
        res.status(500).send('Server Error in projectController getAllProjects');
    }
}

const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        console.log("=== PROJECT FETCH DEBUG ===");
        console.log("1. Project ID received:", projectId);
        console.log("2. Is valid ObjectId?", mongoose.Types.ObjectId.isValid(projectId));
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            console.log("3. Invalid ObjectId format");
            return res.status(400).json({ message: 'Invalid project ID format' });
        }

        console.log("3. Searching for project in database...");
        const project = await Project.findById(projectId)
            .populate('creator', 'name email')
            .populate('applications')
            .populate('teamMembers.userId', 'name email profilePicture')
            .exec();

        console.log("4. Project found:", !!project);
        if (project) {
            console.log("5. Project title:", project.title);
        }
        
        if (!project) {
            console.log("6. No project found with this ID");
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log("7. Sending project response");
        res.json(project);
    } catch (err) {
        console.error("=== ERROR IN getProjectById ===");
        console.error("Error type:", err.name);
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        res.status(500).json({ 
            message: 'Server error while fetching project',
            error: err.message 
        });
    }
};


const submitApplication = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { name, email, github, areaOfExpertise, description, skills, availability } = req.body;

      if (!name || !email || !areaOfExpertise || !description || !availability) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      const project = await Project.findById(projectId).populate('creator', 'email');

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Prevent creator from applying to their own project (by email)
      if (project.creator && project.creator.email && email === project.creator.email) {
        return res.status(400).json({ message: "You cannot apply to your own project." });
      }

      // If you use authentication and req.user is available, you can also check by user ID:
      // if (req.user && project.creator && req.user.toString() === project.creator._id.toString()) {
      //   return res.status(400).json({ message: "You cannot apply to your own project." });
      // }

      const application = new Applicant({
        name,
        email,
        github,
        areaOfExpertise,
        description,
        skills,
        availability,
        projectId: projectId
      });

      await application.save();

      project.applications.push(application._id);
      await project.save();

      res.json({ message: 'Application submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error in projectController submitApplication');
    }
};
  const getAllApplications=async(req,res)=>{
    // console.log("in getAllApplications");
    try{
      const projectId=req.params.projectId;
      // console.log("projectId in getAllApplications",projectId);

      const project=await Project.findById(projectId).populate(
        {
          path:'applications',
          model: 'Applicant',
        }
      ).exec();

      if(!project){
        return res.status(404).json({message:'Project not Found'});

      }

      res.json(project.applications);

    }
    catch(err){
      console.error(err);
      res.status(500).send("Server Error in ProjectController in getAllApplications")
    }
  }

  // Get project team members
const getProjectTeam = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('teamMembers.userId', 'name email profilePicture skills')
            .populate('creator', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({
            projectId: project._id,
            projectTitle: project.title,
            creator: project.creator,
            teamMembers: project.teamMembers,
            currentTeamSize: project.currentTeamSize,
            maxTeamSize: project.maxTeamSize
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error in getting project team' });
    }
};

// Get projects where user is a team member
const getMyTeams = async (req, res) => {
    try {
        const userId = req.user._id;

        const projects = await Project.find({
            'teamMembers.userId': userId
        })
        .populate('creator', 'name email')
        .populate('teamMembers.userId', 'name email')
        .select('title description tags teamMembers currentTeamSize maxTeamSize createdAt');

        // Add user's role in each project
        const projectsWithRole = projects.map(project => {
            const userMember = project.teamMembers.find(
                member => member.userId._id.toString() === userId.toString()
            );
            return {
                ...project.toObject(),
                myRole: userMember ? userMember.role : null
            };
        });

        res.json(projectsWithRole);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error in getting my teams' });
    }
};

module.exports = { 
    createProject,
    getAllProjects, 
    getProjectById, 
    submitApplication, 
    getProjectByCreator,
    getAllApplications,
    acceptApplication, 
    rejectApplication, 
    getProjectTeam, 
    getMyTeams 
};