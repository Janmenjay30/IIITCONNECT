const mongoose=require('mongoose');
const applicantSchema=new mongoose.Schema({
    name:{type:String,require:true},
    email:{type:String,required:true},
    github:{type:String},
    areaOfExpertise:{type:String,required:true},
    description:{type:String,required:true},
    skills:{type:String},
    availability:{type:Number,required:true},
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

});

module.exports=mongoose.model('Applicant',applicantSchema);