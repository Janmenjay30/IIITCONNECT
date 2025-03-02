const Project =require('../models/project');
const Applicant=require('../models/applicant');
const User=require('../models/user');

// const { validationResult } = require('express-validator'); // If you want validation

// @desc    Create a new project
// @route   POST api/projects
// @access  Private
const createProject = async (req, res) => {
    // const errors = validationResult(req); // Use express-validator if needed
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    try {
        const { title, description, requiredRoles, tags } = req.body;

        // Create a new project
        const project = new Project({
            title,
            description,
            requiredRoles,
            tags,
            creator: req.user, // req.user is set by the authMiddleware
        });

        await project.save();

        res.status(201).json({ message: 'Project created successfully', project });  // Return the created project

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in projectController createProject');
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

        if (projects.length === 0) {
            return res.status(200).json({ message: 'No projects found', projects: [] });
          }
        res.json(projects);
    }
    catch(err){
        console.log(err);
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
      const project = await Project.findById(projectId)
        .populate('creator', 'name')
        .populate('applications') // Populate the applications field
        .exec();
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      res.json(project);
    } catch (err) {
      res.status(404).json({ message: 'Error fetching Project' });
    }
  };



const submitApplication = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { name, email, github, areaOfExpertise, description, skills, availability } = req.body;
  
      if (!name || !email || !areaOfExpertise || !description || !availability) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
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
  
      // Add the application to the project's applications array
      project.applications.push(application._id);
      await project.save();
  
      res.json({ message: 'Application submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error in projectController submitApplication');
    }
  };
  

module.exports = { createProject,getAllProjects,getProjectById,submitApplication,getProjectByCreator};
