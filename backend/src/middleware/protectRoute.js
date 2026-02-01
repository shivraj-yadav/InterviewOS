import {  requireAuth } from '@clerk/express'
import User from '../model/User.js';

export const protectRoute =[requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if(!clerkId){
        return res.status(401).json({message:"Unauthorized"});
      }
        //Find user in DB by clerkId
        const user = await User.findOne({clerkId});
        if(!user){
          return res.status(401).json({message:"Unauthorized"});
        }

        req.user = user; //Attach user to request object
        next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      return res.status(500).json({message:"Internal server error"});
    }
  }
]