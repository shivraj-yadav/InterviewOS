import { requireAuth, clerkClient } from '@clerk/express'
import User from '../model/User.js';
import { upsertStreamUser } from '../lib/stream.js';

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
        let user = await User.findOne({clerkId});
        
        if(!user){
          console.log("User not found in database. Attempting lazy sync from Clerk...");
          try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            if (clerkUser) {
              const email = clerkUser.emailAddresses?.[0]?.emailAddress;
              const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email?.split('@')[0] || "Unknown User";
              
              user = await User.create({
                clerkId: clerkId,
                email: email,
                name: name,
                profileImage: clerkUser.imageUrl,
              });
              
              await upsertStreamUser({
                id: user.clerkId.toString(),
                name: user.name,
                image: user.profileImage,
              });
              
              console.log("Successfully synced user from Clerk to DB:", user._id);
            }
          } catch (syncError) {
            console.error("Failed to sync user from Clerk:", syncError);
          }
        }
        
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