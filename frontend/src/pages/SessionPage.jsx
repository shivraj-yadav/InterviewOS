import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSessionById, useJoinSession, useEndSession, useUpdateSession } from "../hooks/useSessions";
import useStreamClient from "../hooks/useStreamClient";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import VideoCallUI from "../components/VideoCallUI";
import ProblemDescription from "../components/ProblemDescription";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import { LANGUAGE_CONFIG, PROBLEMS } from "../data/problems";
import { StreamVideo, StreamCall } from "@stream-io/video-react-sdk";
import { codeExecutionApi } from "../api/codeExecution";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import {
  getYjsWsUrl,
  COLLAB_TEXT_KEY,
  COLLAB_META_KEY,
  COLLAB_EXECUTION_KEY,
} from "../lib/collaboration";

function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const { data: sessionData, isLoading, error } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();
  const updateSessionMutation = useUpdateSession();
  
  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGE_CONFIG.javascript.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isApplyingRemoteMetaRef = useRef(false);

  const destroyCollaboration = () => {
    if (bindingRef.current) {
      try {
        bindingRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
      bindingRef.current = null;
    }
    if (providerRef.current) {
      try {
        providerRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
      providerRef.current = null;
    }
    if (ydocRef.current) {
      try {
        ydocRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
      ydocRef.current = null;
    }
    editorRef.current = null;
    monacoRef.current = null;
  };

  useEffect(() => () => destroyCollaboration(), []);
  
  // Get session data
  const session = sessionData?.session;
  
  // Check if current user is the host
  const isHost = user?.id && session?.host?.clerkId === user.id;
  
  // Check if current user is a participant
  const isParticipant = user?.id && session?.participant?.clerkId === user.id;
  
  // Check if session already has a participant
  const hasParticipant = session?.participant;
  
  // ✅ Call useStreamClient at the TOP LEVEL, before any returns
  const { streamClient, call, chatClient, channel, isInitializingCall } = useStreamClient(
    session,
    isLoading,
    isHost,
    isParticipant
  );
  
  // Initialize problem ID when session loads
  useEffect(() => {
    if (session?.problem) {
      const problemId = session.problem.toLowerCase().replace(/\s+/g, '-');
      setCurrentProblemId(problemId);
    }
  }, [session]);
  
  // Get current problem data
  const currentProblem = PROBLEMS[currentProblemId] || PROBLEMS["two-sum"];
  
  const applySharedExecution = (ymeta) => {
    const execution = ymeta.get(COLLAB_EXECUTION_KEY);
    if (!execution) return;

    setIsRunning(execution.state === "running");
    setOutput(execution.output ?? null);
  };

  const updateSharedExecution = (state, output = null) => {
    const ydoc = ydocRef.current;
    if (!ydoc) return;

    ydoc.getMap(COLLAB_META_KEY).set(COLLAB_EXECUTION_KEY, { state, output });
  };

  const applySharedDocumentState = (ytext, ymeta) => {
    const sharedLanguage = ymeta.get("language");
    const sharedProblemId = ymeta.get("problemId");
    const sharedCode = ytext.toString();

    isApplyingRemoteMetaRef.current = true;

    if (sharedLanguage && sharedLanguage !== selectedLanguage) {
      setSelectedLanguage(sharedLanguage);
      if (editorRef.current && monacoRef.current) {
        monacoRef.current.editor.setModelLanguage(
          editorRef.current.getModel(),
          LANGUAGE_CONFIG[sharedLanguage].monacoLang
        );
      }
    }

    if (sharedProblemId && sharedProblemId !== currentProblemId) {
      setCurrentProblemId(sharedProblemId);
    }

    setCode(sharedCode);
    applySharedExecution(ymeta);
    isApplyingRemoteMetaRef.current = false;
  };

  const updateSharedDocument = ({ language, problemId, nextCode }) => {
    const ydoc = ydocRef.current;
    if (!ydoc) return;

    const ytext = ydoc.getText(COLLAB_TEXT_KEY);
    const ymeta = ydoc.getMap(COLLAB_META_KEY);

    ydoc.transact(() => {
      if (language) ymeta.set("language", language);
      if (problemId) ymeta.set("problemId", problemId);
      if (nextCode !== undefined) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, nextCode);
      }
    });
  };

  const handleProblemChange = (problemId) => {
    const newProblem = PROBLEMS[problemId];
    if (!newProblem) return;

    const newCode =
      newProblem.starterCode?.[selectedLanguage] ||
      LANGUAGE_CONFIG[selectedLanguage].starterCode;

    setCurrentProblemId(problemId);
    setCode(newCode);
    updateSharedDocument({ problemId, nextCode: newCode });

    updateSessionMutation.mutate({
      id,
      data: {
        problem: newProblem.title,
        difficulty: newProblem.difficulty.toLowerCase(),
      },
    });
  };

  useEffect(() => {
    if (error) {
      console.error("Session error:", error);
      navigate("/dashboard");
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!sessionData?.session) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Session not found</h2>
            <button 
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  if (session?.status === "completed") {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-base-300 p-4">
          <div className="card bg-base-100 shadow-xl w-full max-w-md border border-base-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
              <p className="text-base-content/70 mb-6">
                This collaborative session has been ended by the host.
              </p>
              
              <div className="space-y-3 text-left bg-base-200 p-4 rounded-lg mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Problem:</span>
                  <span className="font-semibold">{session?.problem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Difficulty:</span>
                  <span className="badge badge-primary badge-sm capitalize">{session?.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Host:</span>
                  <span className="font-semibold">{session?.host?.name || "Unknown"}</span>
                </div>
                {session?.participant && (
                  <div className="flex justify-between">
                    <span className="opacity-70">Participant:</span>
                    <span className="font-semibold">{session?.participant?.name || "Unknown"}</span>
                  </div>
                )}
              </div>

              <div className="card-actions justify-center">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-primary w-full"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleJoinSession = () => {
    joinSessionMutation.mutate(id, {
      onSuccess: () => {
        // Session joined successfully
      },
      onError: (error) => {
        console.error("Failed to join session:", error);
      }
    });
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      endSessionMutation.mutate(id, {
        onSuccess: () => {
          navigate("/dashboard");
        }
      });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    const newCode = LANGUAGE_CONFIG[newLanguage].starterCode;

    setSelectedLanguage(newLanguage);
    setCode(newCode);

    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel(),
        LANGUAGE_CONFIG[newLanguage].monacoLang
      );
    }

    updateSharedDocument({ language: newLanguage, nextCode: newCode });
  };

  const getRandomColor = () => {
    const colors = [
      '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', 
      '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', 
      '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#f472b6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleEditorMount = (editor, monaco) => {
    destroyCollaboration();

    editorRef.current = editor;
    monacoRef.current = monaco;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(getYjsWsUrl(), id, ydoc, {
      connect: true,
    });
    providerRef.current = provider;

    const ytext = ydoc.getText(COLLAB_TEXT_KEY);
    const ymeta = ydoc.getMap(COLLAB_META_KEY);

    ytext.observe(() => {
      setCode(ytext.toString());
    });

    ymeta.observe((event) => {
      if (isApplyingRemoteMetaRef.current) return;

      event.changes.keys.forEach((change, key) => {
        if (change.action === "delete") return;

        if (key === "language") {
          const sharedLanguage = ymeta.get("language");
          if (!sharedLanguage) return;

          setSelectedLanguage(sharedLanguage);
          monaco.editor.setModelLanguage(
            editor.getModel(),
            LANGUAGE_CONFIG[sharedLanguage].monacoLang
          );
        }

        if (key === "problemId") {
          const sharedProblemId = ymeta.get("problemId");
          if (sharedProblemId) setCurrentProblemId(sharedProblemId);
        }

        if (key === COLLAB_EXECUTION_KEY) {
          applySharedExecution(ymeta);
        }
      });
    });

    provider.on("sync", (isSynced) => {
      if (!isSynced) return;

      if (ytext.length === 0) {
        const initialCode =
          PROBLEMS[currentProblemId]?.starterCode?.[selectedLanguage] ||
          LANGUAGE_CONFIG[selectedLanguage].starterCode;

        ydoc.transact(() => {
          if (ytext.length === 0) {
            ymeta.set("language", selectedLanguage);
            ymeta.set("problemId", currentProblemId);
            ytext.insert(0, initialCode);
          }
        });
      } else {
        applySharedDocumentState(ytext, ymeta);
      }
    });

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;

    if (user) {
      provider.awareness.setLocalStateField("user", {
        name: user.fullName || user.username || "Anonymous",
        color: getRandomColor(),
      });
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    updateSharedExecution("running", null);

    try {
      const codeToRun = editorRef.current?.getValue() ?? code;

      const result = await codeExecutionApi.executeCode(
        codeToRun,
        selectedLanguage,
        ""
      );

      const newOutput = {
        success: true,
        output: result.output || "Code executed successfully (no output)",
        executionTime: result.executionTime,
        memory: result.memory,
      };

      setOutput(newOutput);
      updateSharedExecution("idle", newOutput);
    } catch (error) {
      console.error("Code execution error:", error);

      const errorOutput = {
        success: false,
        output: "",
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to execute code",
      };

      setOutput(errorOutput);
      updateSharedExecution("idle", errorOutput);
    } finally {
      setIsRunning(false);
    }
  };

  // Show loading while initializing call
  if (isInitializingCall && (isHost || isParticipant)) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-lg">Setting up video call...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      
      {/* Session Info Bar */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{session?.problem}</h1>
            <span className={`badge ${session?.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
              {session?.status}
            </span>
            <span className="badge badge-primary">{session?.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/70">Host:</span>
            <span className="font-medium">{session?.host?.name || 'Unknown'}</span>
            {session?.participant && (
              <>
                <span className="text-sm text-base-content/70 ml-4">• 2/2 participants</span>
              </>
            )}
            {isHost && session?.status === "active" && (
              <button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending}
                className="btn btn-error btn-sm ml-4 gap-2"
              >
                {endSessionMutation.isPending ? "Ending..." : "End Session"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-8rem)]">
        {!isHost && !isParticipant ? (
          // Show join session UI for non-participants
          <div className="h-full flex items-center justify-center">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Session Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Problem</h3>
                    <p className="text-base-content/70">{session?.problem}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Difficulty</h3>
                    <span className="badge badge-primary">{session?.difficulty}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <span className={`badge ${session?.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {session?.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Host</h3>
                    <p className="text-base-content/70">{session?.host?.name || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-6">
                  {!hasParticipant && (
                    <button 
                      className="btn btn-primary"
                      onClick={handleJoinSession}
                      disabled={joinSessionMutation.isPending}
                    >
                      {joinSessionMutation.isPending ? 'Joining...' : 'Join Session'}
                    </button>
                  )}
                  
                  {hasParticipant && (
                    <div className="alert alert-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      <span>This session is already full.</span>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-ghost"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show 2-column layout: Problem Description | Video + Code Editor + Output
          <div className="grid grid-cols-2 gap-4 h-full p-4">
            {/* LEFT PANEL - Problem Description */}
            <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
              <ProblemDescription
                problem={currentProblem}
                currentProblemId={currentProblemId}
                onProblemChange={handleProblemChange}
                allProblems={Object.values(PROBLEMS)}
                isHost={isHost}
              />
            </div>
            
            {/* RIGHT PANEL - Video Call + Code Editor + Output */}
            <div className="flex flex-col gap-4">
              {/* Video Call Section */}
              <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden h-1/2">
                {streamClient && call ? (
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <LoadingSpinner />
                      <p className="mt-4">Connecting to video call...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor + Output Section */}
              <div className="flex flex-col gap-4 h-1/2">
                {/* Code Editor */}
                <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex-1">
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    onLanguageChange={handleLanguageChange}
                    onRunCode={handleRunCode}
                    onEditorMount={handleEditorMount}
                    isCollaborative
                  />
                </div>

                {/* Output Panel */}
                <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden h-32">
                  <OutputPanel output={output} isRunning={isRunning} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionPage;