const Project=require('../models/project');
const User=require('../models/user');
const Applicant=require('../models/applicant');

const getNumberOfApplications=async(projectId)=>{

    try{
        const application=await Applicant.find({projectId:projectId});
        return application.length;
    }
    catch(err){
        console.log(err);
    }
}


const getAllApplications=async(req,res)=>{
    try{
        const applications=await Applicant.find({})
    }
    catch(err){
        console.log(err);
    }
};

module.exports={getAllApplications,getNumberOfApplications};