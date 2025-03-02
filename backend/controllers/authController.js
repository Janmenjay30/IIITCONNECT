const User=require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        // Fix: Change token payload structure to match middleware expectations
        const token = jwt.sign(
            {
                user: {
                    id: user._id
                }
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(200).json({token});
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server Error'});
    }
}   

const register = async (req, res) => {
    const {name,email,password}=req.body;
    try{
        // console.log("in authControlle register")
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword=await bcrypt.hash(password, 10);
        const user=await User.create({name,email,password:hashedPassword});
        res.status(201).json({message: 'User created'});
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Server Error in authcontroller register"});
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user).select('-password'); // Exclude password
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };


module.exports = { login,register,getProfile };