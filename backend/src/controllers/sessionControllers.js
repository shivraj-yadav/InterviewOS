import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../model/Session.js";
export async function createSession(req,res){
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    if(!problem || !difficulty) {
      return res.status(400).json({message:"Missing problem or difficulty"});
    }

    // generate unique callId for video call
    const callId =
  'session-' +
  Date.now() +
  '-' +
  Math.random().toString(36).substring(2, 8);

    const session = await Session.create({
      problem,
      difficulty,
      host:userId,
      callId
    });

    await streamClient.video.call("default",callId).getOrCreate({
      data:{
        created_by_id:clerkId,
        custom:{problem,difficulty,sessionId:session._id.toString()}
      }
    });
//chat messaging channel can be created here if needed
const channel = chatClient.channel("messaging",callId,{
  name:`${problem} Session`,
  created_by: { id: clerkId },
  members:[clerkId]
});
await channel.create();
    res.status(201).json({session});
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({message:"Internal server error"});
  }
}

export async function getActiveSession(_,res) {
  try {
    const sessions = await Session.find({status:"active"}).populate("host","name profileImage clerkId").sort({createdAt:-1}).limit(20);
    res.status(200).json({sessions});
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({message:"Internal server error"});
  }
}

export async function getMyRecentSession(req,res) {
  try {
    const userId = req.user._id;
    //Fetch sessions where user is host or participant
    const sessions = await Session.find({
      status:"completed",
      $or: [
        { host: userId },
        { participant: userId }
      ]
    }).populate("host","name profileImage clerkId").sort({createdAt:-1}).limit(20);
    res.status(200).json({sessions});
  } catch (error) {
    console.error("Error fetching user's recent sessions:", error);
    res.status(500).json({message:"Internal server error"});
  }
}

export async function getSessionById(req,res) {
    try {
      const {id} = req.params;
      const session = await Session.findById(id).populate("host","name email profileImage clerkId").populate("participant","name email profileImage clerkId");
      if(!session) {
        return res.status(404).json({message:"Session not found"});
      }
      res.status(200).json({session});
    } catch (error) {
      console.error("Error fetching session by ID:", error);
      res.status(500).json({message:"Internal server error"});
    }
}
export async function joinSessionById(req,res) {
  try {
    const {id} = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if(!session) {
      return res.status(404).json({message:"Session not found"});
    }

    if(session.participant) {
      return res.status(403).json({message:"Session is Full"});
    }
    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging",session.callId);
    await channel.addMembers([clerkId]);
    res.status(200).json({message:"Successfully joined session"});
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({message:"Internal server error"});
  }
}

export async function endSession(req,res) {
  try {
    const {id} = req.params;
    const userId = req.user._id;
    const session = await Session.findById(id);
    if(!session) {
      return res.status(404).json({message:"Session not found"});
    }
    if(session.host.toString()!==userId.toString()) {
      return res.status(403).json({message:"Only host can end the session"});
    }

    if(session.status==="completed") {
      return res.status(400).json({message:"Session already ended"});
    }
    session.status="completed";
    await session.save();

    //delete video call from stream
    await streamClient.video.call("default",session.callId).delete();
    //delete chat channel
    const channel = chatClient.channel("messaging",session.callId);
    await channel.delete();
    res.status(200).json({message:"Session ended successfully"});
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({message:"Internal server error"});
  }
}