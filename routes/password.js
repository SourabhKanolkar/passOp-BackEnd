import express from "express";
import Password from "../models/Password.js";

import { body, validationResult } from "express-validator";
import fetchUser from "../middleware/fetchUser.js";
import User from "../models/User.js";



const router = express.Router();

//Add Password api "/api/passwords/"-POST (to add password)
router.post(
  "/",
  [
    body("site", "Enter a valid site Url").isLength({ min: 3 }),
    body("username", "Enter a Valid username").isLength({ min: 3 }),
    body("password", "Enter a valid password").isLength({ min: 3 }),
  ],fetchUser,
  async (req, res) => {
    try {
      const { site, username, password } = req.body;

      //ROUTE 1  if there are errors return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newPass = await Password.create({
        user:req.user.id,
        site,
        username,
        password,
      });

      res.status(201).json({ newPass });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  },
);

//ROUTE 2: Get All the Passwords using: GET "/api/passwords/".
router.get('/',fetchUser,async(req,res)=>{

   try {
      const data=await Password.find({user:req.user.id}).sort({createdAt:-1});
      res.status(200).json({data})

   } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
   }

});

//ROUTE 3: Update an existing Password  using: PUT "/api/passwords/:id"
router.put("/:id",[
    body("site", "Enter a valid site Url").isLength({ min: 3 }),
    body("username", "Enter a Valid username").isLength({ min: 3 }),
    body("password", "Enter a valid password").isLength({ min: 3 }),
  ],fetchUser,async(req,res)=>{

    try {
       const errors = validationResult(req);
       if(!errors.isEmpty()){
          return res.status(400).json({ errors: errors.array() });
       }
        const existing = await Password.findById(req.params.id);
        if(!existing){
         return res.status(404).send("Not Found");
           }

        if(existing.user.toString() !== req.user.id){
          return res.status(401).send("Not Allowed");
             }
       
       const updated=await Password.findByIdAndUpdate(
         req.params.id,
         req.body,
         {new:true}
       );

       res.status(200).json(updated);
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
});

//ROUTE 4: Delete an existing Password  using: DELETE "/api/passwords/:id".
router.delete('/:id', fetchUser, async (req, res) => {
  try {

    // check if password exists
    let password = await Password.findById(req.params.id);
    if (!password) {
      return res.status(404).send("Not Found");
    }

    // check ownership
    if (password.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // delete password
    password = await Password.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: "Password has been deleted",
      password: password
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

 

export default router;
