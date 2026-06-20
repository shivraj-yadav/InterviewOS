import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (
        !session?.callId ||
        (!isHost && !isParticipant) ||
        session.status === "completed"
      ) {
        if (isMounted.current) setIsInitializingCall(false);
        return;
      }

      try {
        console.log("🚀 Initializing Stream call...");

        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (!isMounted.current) return;

        setStreamClient(client);
        console.log("✅ Stream client initialized");

        videoCall = client.call("default", session.callId);

        // 🎤 Request microphone permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });

          stream.getTracks().forEach((track) => track.stop());
        } catch (permError) {
          toast.error(
            "Please allow microphone access to join the call"
          );
          throw permError;
        }

        // 📞 Join call with proper audio configuration
        await videoCall.join({
          create: isHost,
          data: {
            settings_override: {
              audio: {
                default_device: "speaker", // Required field: "speaker" or "earpiece"
                mic_default_on: true,
                speaker_default_on: true,
                opus_dtx_enabled: true,
                redundant_coding_enabled: true,
                noise_cancellation: { 
                  mode: "available" // Valid enum: "available", "disabled", "auto-on"
                },
                // Ensure proper audio quality settings
                echo_cancellation: true,
                auto_gain_control: true,
                high_pass_filter: true,
              },
              video: {
                camera_default_on: false,
                target_resolution: {
                  width: 1280,
                  height: 720,
                },
              },
            },
          },
        });

        if (!isMounted.current) return;

        console.log("✅ Successfully joined call");
        setCall(videoCall);

        // 🔊 Ensure microphone is properly enabled and publishing
        setTimeout(async () => {
          try {
            console.log("🎤 Checking microphone state...");
            
            // Wait a bit more for the call to be fully established
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (videoCall?.microphone) {
              const micState = videoCall.microphone.state;
              console.log("🎤 Microphone state:", micState);
              
              // Force enable microphone if disabled
              if (micState.status === "disabled" || micState.muted) {
                console.log("🎤 Force enabling microphone...");
                await videoCall.microphone.enable();
                await videoCall.microphone.unmute();
                console.log("✅ Microphone force enabled");
              }
              
              // Ensure microphone is publishing
              if (videoCall.microphone.state?.status === "enabled") {
                console.log("🎤 Microphone is enabled and should be publishing");
              }
            } else {
              console.error("❌ Microphone not available in call");
            }
          } catch (error) {
            console.error("❌ Microphone setup error:", error);
          }
        }, 3000); // Increased delay for better initialization

        // ---------------- CHAT SETUP ----------------
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (!isMounted.current) return;

        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel(
          "messaging",
          session.callId
        );

        await chatChannel.watch();

        if (!isMounted.current) return;

        setChannel(chatChannel);
      } catch (error) {
        console.error("❌ Error initializing call:", error);

        if (error.name === "NotAllowedError") {
          toast.error("Microphone permission denied.");
        } else if (error.name === "NotFoundError") {
          toast.error("No microphone found.");
        } else if (error.name === "NotReadableError") {
          toast.error("Microphone is being used by another app.");
        } else {
          toast.error("Failed to join call.");
        }
      } finally {
        if (isMounted.current) setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    // 🧹 CLEANUP
    return () => {
      isMounted.current = false;

      (async () => {
        try {
          console.log("🧹 Cleaning up resources...");

          if (videoCall) {
            await videoCall.leave();
          }

          if (chatClientInstance) {
            await chatClientInstance.disconnectUser();
          }

          await disconnectStreamClient();

          console.log("✅ Cleanup complete");
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
