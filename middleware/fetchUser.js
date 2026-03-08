import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "passopsecret";

const fetchUser=(req,res,next)=>{
       
    try {
        //get the token from req
        const token=req.header('auth-token');

        if(!token){
             return res.status(401).send("Access Denied. No token provided");
        }

        //verify token
        const data=jwt.verify(token,JWT_SECRET);

        // attach user to req
        req.user=data.user;
        next();
    } catch (error) {
         res.status(401).send("Invalid Token");
    }
}

export default fetchUser;