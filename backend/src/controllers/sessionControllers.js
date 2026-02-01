import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../model/Session.js";
/**
 * Create a new session record, initialize a corresponding video call and a messaging channel, and return the created session.
 *
 * Creates a Session document using `req.body` values, creates a video call in the streaming service with metadata, and creates a chat channel identified by the session callId.
 *
 * @param {import('express').Request} req - Express request. Expects `req.body` to be an array [problem, difficulty]; `req.user._id` is used as the host ID; `req.clerkId` is used for service metadata and chat membership.
 * @param {import('express').Response} res - Express response used to send HTTP responses.
 *
 * Behavior:
 * - Responds 201 with the created session on success.
 * - Responds 400 if `problem` or `difficulty` are missing.
 */
export async function createSession(req,res){
  try {
    const [problem , difficulty] = req.body;
    const userId = req.user._id;
    const clerkId = req.clerkId;
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
  created_by:clerkId,
  members:[clerkId]
});
await channel.create();
    res.status(201).json({session});
  } catch (error) {
    
  }
}

/**
 * Retrieve and respond with up to 20 active sessions.
 *
 * Responds with sessions sorted by newest first and with each session's host populated with `name`, `profileImage`, and `clerkId`.
 */
export async function getActiveSession(_,res) {
  try {
    const sessions = await Session.find({status:"active"}).populate("host","name profileImage clerkId").sort({createdAt:-1}).limit(20);
    res.status(200).json({sessions});
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    res.status(500).json({message:"Internal server error"});
  }
}

/**
 * Retrieve up to 20 most recent completed sessions where the requesting user was the host or a participant.
 *
 * Populates each session's host fields (name, profileImage, clerkId) and responds with a 200 status and the sessions.
 *
 * @param {import('express').Request} req - Express request; expects `req.user._id` to contain the requesting user's ID.
 * @param {import('express').Response} res - Express response used to send the sessions or an error status.
 */
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

/**
 * Retrieve a session by its ID and return it with host and participant details populated.
 *
 * Finds the session specified by req.params.id, populates the host and participant fields
 * (name, email, profileImage, clerkId), and sends the session in the response.
 * Responds with 404 if the session does not exist and 500 on internal errors.
 */
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

/**
 * Add the authenticated user as the participant of a session identified by ID and add their clerk ID to the session's chat channel.
 *
 * Responds with 404 if the session does not exist, 403 if the session already has a participant, and 200 on successful join.
 * @param {import('express').Request & { user: { _id: string, clerkId: string }, params: { id: string } }} req - Express request; must include params.id and user._id and user.clerkId.
 * @param {import('express').Response} res - Express response used to send HTTP status and JSON messages.
 */
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

/**
 * End the specified session as its host, mark it completed, and remove associated streaming and chat resources.
 *
 * Marks the session's status as "completed", deletes the corresponding video call in the streaming service and the chat channel tied to the session's callId, and sends an HTTP response indicating success or failure.
 */
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