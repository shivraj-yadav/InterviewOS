import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema({
  problem:{
    type: String,
    required: true,
  },
  difficulty:{
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  host:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participant:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    default:null
  },
  status:{
    type:String,
    enum:["active","completed"],
    default:"activr",
  },
  callId:{
    type:String,
    default:null,
  }
},{timestamps:true});

const Session = mongoose.model("Session", SessionSchema);
export default Session; 