const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(401).send({message:'No token found'})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).send({error:"Invalid Token"})
    }
}