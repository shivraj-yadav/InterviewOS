import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";
import Session from "./model/Session.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const PORT = ENV.PORT;

//Middleware 
app.use(express.json());
app.use(cors({origin: ENV.CLIENT_URL,credentials:true}));
app.use(clerkMiddleware());
app.use("/api/inngest",serve({client:inngest,functions}));
app.use("/api/chat",chatRoutes);
app.use("/api/sessions",sessionRoutes);
app.use("/api/execute", executeRoutes);

//Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "InterviewOS Backend API is running!",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", backend: "active" });
});

app.get("/api/inngest/health", (req, res) => {
  res.json({ status: "ok", inngest: "active" });
});

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Set up WebSocket server for Yjs real-time collaboration
    const wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (conn, req) => {
      setupWSConnection(conn, req, { gc: true });
    });

    server.on("upgrade", async (request, socket, head) => {
      const { pathname } = new URL(request.url, `http://${request.headers.host}`);

      if (!pathname.startsWith("/yjs")) {
        return;
      }

      const sessionId = pathname.split("/").filter(Boolean).pop();

      if (!sessionId) {
        socket.destroy();
        return;
      }

      try {
        const session = await Session.findById(sessionId).select("status");
        if (!session || session.status !== "active") {
          socket.destroy();
          return;
        }
      } catch {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
  }
};

startServer();