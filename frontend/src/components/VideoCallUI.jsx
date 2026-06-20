import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { 
    useCallCallingState, 
    useParticipantCount, 
    useMicrophoneState,
    useCallSession 
  } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { microphone, isMute } = useMicrophoneState();
  const session = useCallSession();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTogglingMic, setIsTogglingMic] = useState(false);

  // Debug: Log mic state changes
  useEffect(() => {
    console.log("🎤 Microphone state:", { 
      microphone: !!microphone, 
      isMute,
      status: microphone?.state?.status,
      mediaStream: microphone?.state?.mediaStream,
    });
  }, [microphone, isMute]);

  // Auto-enable microphone when component mounts
  useEffect(() => {
    const enableAudio = async () => {
      if (!microphone) {
        console.log("⏳ Waiting for microphone to be available...");
        return;
      }

      try {
        console.log("🎤 Current mic state:", microphone.state);
        
        if (isMute) {
          console.log("🎤 Attempting to enable microphone...");
          await microphone.enable();
          console.log("✅ Microphone enabled successfully");
          toast.success("Microphone enabled");
        } else {
          console.log("✅ Microphone already enabled");
        }
      } catch (error) {
        console.error("❌ Failed to enable microphone:", error);
        toast.error(`Microphone error: ${error.message}`);
      }
    };
    
    // Add a small delay to ensure microphone is ready
    const timer = setTimeout(() => {
      enableAudio();
    }, 1000);

    return () => clearTimeout(timer);
  }, [microphone]);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  const toggleMicrophone = async () => {
    if (!microphone) {
      console.error("❌ Microphone not available");
      toast.error("Microphone not available");
      return;
    }

    setIsTogglingMic(true);
    
    try {
      console.log("🔄 Toggling microphone from:", isMute ? "MUTED" : "UNMUTED");
      
      if (isMute) {
        // Unmute
        console.log("🎤 Enabling microphone...");
        await microphone.enable();
        console.log("✅ Microphone enabled");
        toast.success("Microphone enabled");
      } else {
        // Mute
        console.log("🔇 Disabling microphone...");
        await microphone.disable();
        console.log("✅ Microphone disabled");
        toast.success("Microphone muted");
      }
    } catch (error) {
      console.error("❌ Failed to toggle microphone:", error);
      toast.error(`Failed to toggle microphone: ${error.message}`);
      
      // Try alternative method
      try {
        console.log("🔄 Trying alternative toggle method...");
        await microphone.toggle();
        console.log("✅ Alternative toggle successful");
      } catch (altError) {
        console.error("❌ Alternative toggle also failed:", altError);
      }
    } finally {
      setIsTogglingMic(false);
    }
  };

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* Participants count badge, Audio Status, and Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {participantCount}{" "}
                {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>
            
            {/* Audio Status Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMicrophone}
                disabled={isTogglingMic || !microphone}
                className={`btn btn-sm gap-2 ${
                  !microphone 
                    ? 'btn-disabled' 
                    : isMute 
                    ? 'btn-error' 
                    : 'btn-success'
                }`}
                title={isMute ? "Click to unmute" : "Click to mute"}
              >
                {isTogglingMic ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    ...
                  </>
                ) : isMute ? (
                  <>
                    <MicOffIcon className="size-4" />
                    Muted
                  </>
                ) : (
                  <>
                    <MicIcon className="size-4" />
                    Active
                  </>
                )}
              </button>
              
              {/* Debug info - Remove in production */}
              <span className="text-xs text-base-content/50">
                {microphone ? `Status: ${microphone.state?.status || 'unknown'}` : 'No mic'}
              </span>
            </div>
          </div>
          
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
              title={isChatOpen ? "Hide chat" : "Show chat"}
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
          )}
        </div>

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout />
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SECTION */}
      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
                
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;