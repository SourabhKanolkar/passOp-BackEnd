import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fetchUser from "../middleware/fetchUser.js";

const router=express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "passopsecret";

// ROUTE 1 → Register user
// POST  /api/users/register
router.post('/register', [
    body("name", "Enter valid name min 3 char").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password", "Password must be atleast 3 chars").isLength({ min: 3 }),
  ],async(req,res)=>{
        
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let {name,email,password}=req.body;

         // normalize email 
        email = email.toLowerCase();

        let user=await User.findOne({email});
        if(user){
             return res.status(400).json({ error: "User already exists" });
        }

        // hasing password here
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        user=await User.create({
            name,
            email,
            password:hashedPassword
        });
       
        //belwo data gets stored in authtoken
        const payload={
            user:{
                id:user.id
            }
        }
     
        const authToken=jwt.sign(payload,JWT_SECRET);
        res.status(201).json({authToken});


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }


});

// ROUTE 2 → Login user
// POST /api/users/login
router.post('/login',[
    body("email", "Enter valid email").isEmail(),
    body("password", "Password cannot be blank").exists()
  ],async(req,res)=>{
      const errors=validationResult(req);

      if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        let {email,password}=req.body;
        email=email.toLowerCase();

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const compare=await bcrypt.compare(password,user.password);

        if(!compare){
             return res.status(400).json({ error: "Invalid credentials" });
        }

        const payload={
            user:{
                id:user.id
            }
        };
        
        const authToken=jwt.sign(payload,JWT_SECRET);
        res.status(200).json({authToken});

      } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
      }
});

router.get('/getuser',fetchUser,async(req,res)=>{
     try {
        const userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        res.send(user);

     } catch (error) {
      res.status(500).send("Internal Server Error");
     }
 })


export default router;