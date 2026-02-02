import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import { useSessionById } from "../hooks/useSessions";
import { useJoinSession } from "../hooks/useSessions";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: sessionData, isLoading, error } = useSessionById(id);
  const joinSessionMutation = useJoinSession();

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

  const session = sessionData.session;

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

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Session Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Problem</h3>
                <p className="text-base-content/70">{session.problem}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Difficulty</h3>
                <span className="badge badge-primary">{session.difficulty}</span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Status</h3>
                <span className={`badge ${session.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {session.status}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Host</h3>
                <p className="text-base-content/70">{session.host?.name || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="card-actions justify-end mt-6">
              <button 
                className="btn btn-primary"
                onClick={handleJoinSession}
                disabled={joinSessionMutation.isPending}
              >
                {joinSessionMutation.isPending ? 'Joining...' : 'Join Session'}
              </button>
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
    </div>
  );
}

export default SessionPage;
