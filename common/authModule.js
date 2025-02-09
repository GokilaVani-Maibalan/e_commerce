const jwt = require("jsonwebtoken");

const authUser = (req,res,next) => {
    const token = req.header("Authorization");
    if(!token) return res.status(401).json({error: "Access Denied"});

    try {
        const verified = jwt.verify(token.replace("Bearer ",""), process.env.JWT_SECRET);
        req.user = verified;
        
        next();
    } catch(error){
        res.status(400).json({error:"Invalid Token"})
    }
}

const authRole = (roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({error:"Insufficient Access"})
        }
        next();
    }
}




module.exports ={authUser,authRole}