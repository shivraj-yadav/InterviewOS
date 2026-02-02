import {  requireAuth } from '@clerk/express'
import User from '../model/User.js';

export const protectRoute =[requireAuth(),
  async (req, res, next) => {
    try {
      console.log("=== PROTECT ROUTE DEBUG ===");
      console.log("Auth object:", req.auth);
      console.log("Clerk ID:", req.auth?.userId);
      
      const clerkId = req.auth.userId;
      if(!clerkId){
        console.log("No clerkId found - unauthorized");
        return res.status(401).json({message:"Unauthorized"});
      }
        //Find user in DB by clerkId
        const user = await User.findOne({clerkId});
        console.log("Found user:", user);
        if(!user){
          console.log("User not found in database - unauthorized");
          return res.status(401).json({message:"Unauthorized"});
        }

        req.user = user; //Attach user to request object
        console.log("User attached to request:", req.user._id);
        console.log("============================");
        next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      return res.status(500).json({message:"Internal server error"});
    }
  }
]