const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.register = async(req,res)=>{
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send({message:'User Registerd'})
    } catch(err) {
        res.status(400).send({error:err.message})
    }
}

exports.login = async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).send({message: "This mail is not registered"})
        }
        if(!(await bcrypt.compare(req.body.password,user.password))){
            return res.status(401).send({message: "Enter Correct Password"})
        }
        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET);
        res.send({token});
    } catch (error) {
        res.status(500).send({error:error.message});
    }
}