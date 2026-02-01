import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'

import chatRoutes from "./routes/chatRoutes.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const PORT = ENV.PORT;

//Middleware 
app.use(express.json());
app.use(cors({origin: ENV.CLIENT_URL,credentials:true}));
app.use("/api/inngest",serve({client:inngest,functions}));
app.use("/api/chat",chatRoutes);
app.use(clerkMiddleware());

//Routes
app.get("/api/inngest/health", (req, res) => {
  res.json({ status: "ok", inngest: "active" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
  }

};

startServer();