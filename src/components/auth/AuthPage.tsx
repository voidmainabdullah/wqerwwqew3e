import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
export const AuthPage: React.FC = () => {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    actualTheme
  } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      });
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match"
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long"
      });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const {
          error
        } = await signUp(email, password, displayName);
        if (!error) {
          toast({
            title: "Account created!",
            description: "Please verify your email to continue."
          });
        }
      } else {
        const {
          error
        } = await signIn(email, password);
        if (!error) {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully."
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: error.message || "Failed to sign in with Google"
      });
    } finally {
      setLoading(false);
    }
  };
  return <>
      <style>{`
        .auth-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #000;
          overflow: hidden;
        }

       .auth-image-section {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  width: 100%;
  height: 100vh; /* full viewport height, no scroll */
}

.auth-image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  margin: 0; /* fix any bottom spacing */
  pointer-events: none; /* optional: prevent accidental scroll/drag */
}


        .auth-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: radial-gradient(circle at top right, #000 0%, #000 100%);
        }
 
        .auth-wrapper .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: #1f1f1f;
          padding: 40px;
          width: 100%;
          max-width: 380px;
          border-radius: 16px;
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
          border: 1px solid #333;
          max-height: 85vh;
          overflow-y: auto;
        }

        .auth-wrapper .form::-webkit-scrollbar {
          width: 6px;
        }

        .auth-wrapper .form::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 10px;
        }

        .auth-wrapper .form::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 10px;
        }

        .auth-wrapper .form::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .auth-wrapper .logo-area {
          text-align: center;
          margin-bottom: 16px;
        }

        .auth-wrapper .logo {
        display: none;
          width: 60px;
          height: 60px;
          
          margin-bottom: 12px;
        }

        .auth-wrapper h2 {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .auth-wrapper .logo-area > p {
          color: #aaa;
          font-size: 13px;
          margin: 6px 0 0 0;
        }

        .auth-wrapper label {
          color: #f1f1f1;
          font-weight: 600;
          font-size: 13px;
        }

        .auth-wrapper .inputForm {
          border: 1.5px solid #333;
          border-radius: 8px;
          height: 44px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          background-color: #2b2b2b;
          transition: 0.3s ease;
        }

        .auth-wrapper .inputForm:focus-within {
          border-color: #2d79f3;
          box-shadow: 0 0 8px rgba(45, 121, 243, 0.2);
        }

        .auth-wrapper .input {
          width: 100%;
          background: none;
          border: none;
          color: #f1f1f1;
          font-size: 14px;
          height: 100%;
        }

        .auth-wrapper .input:focus {
          outline: none;
        }

        .auth-wrapper .button-submit {
          background: linear-gradient(90deg, #194bd4, #000000);
          color: white;
          border: none;
          height: 36px;
          border-radius: 8px;
          font-weight: 600; 
          font-size: 15px;
          cursor: pointer;
          transition: 0.3s ease;
          margin-top: 8px;
        }

        .auth-wrapper .button-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 10px #2d79f3;
        }

        .auth-wrapper .button-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-wrapper .flex-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .auth-wrapper .span {
          color: #2d79f3;
          cursor: pointer;
          transition: color 0.2s;
        }

        .auth-wrapper .span:hover {
          color: #4a8bff;
        }

        .auth-wrapper .btn {
          flex: 1;
          height: 40px;
          border-radius: 8px;
          background: #2b2b2b;
          color: #f1f1f1;
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 500;
          font-size: 13px;
          transition: 0.3s ease;
          cursor: pointer;
        }

        .auth-wrapper .btn:hover:not(:disabled) {
          border-color: #2d79f3;
          background: #2d3c52;
        }

        .auth-wrapper .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-wrapper .flex-column {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-wrapper .p {
          text-align: center;
          margin: 0;
          font-size: 13px;
        }

        .auth-wrapper .p.line {
          color: #666;
          font-size: 12px;
          margin: 6px 0;
          position: relative;
        }

        .auth-wrapper .remember-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin: 4px 0;
        }

        .auth-wrapper input[type="checkbox"] {
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .auth-wrapper {
            grid-template-columns: 1fr;
          }

          .auth-image-section {
            display: none;
          }

          .auth-form-section {
            background: radial-gradient(circle at top left, #111 0%, #000 100%);
          }
        }

        @media (max-width: 480px) {
          .auth-wrapper .form {
            padding: 30px 24px;
            border-radius: 12px;
            max-width: 100%;
          }

          .auth-form-section {
            padding: 20px;
          }

          .auth-wrapper h2 {
            font-size: 20px;
          }
        }
      `}</style>
      <div className="auth-wrapper">
        <div className="auth-image-section rounded-2xl">
          <img src="/showcase2.png" alt="File sharing showcase" />
        </div>
        <div className="auth-form-section">
          <form onSubmit={handleSubmit} className="form mx-0">
        <div className="logo-area">
          <img src="/skie.png" alt="logo" className="logo" />
          <h2>{isSignUp ? "Join SkieShare" : "Welcome Back"}</h2>
          <p>
            {isSignUp ? "Create your account and start sharing securely" : "Sign in to your SkieShare dashboard"}
          </p>
        </div>

        {isSignUp && <div className="flex-column">
            <label>Display Name</label>
            <div className="inputForm">
              <input type="text" className="input" placeholder="Enter your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          </div>}

        <div className="flex-column">
          <label>Email</label>
          <div className="inputForm">
            <input type="email" className="input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className="inputForm">
            <input type="password" className="input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>

        {isSignUp && <div className="flex-column">
            <label>Confirm Password</label>
            <div className="inputForm">
              <input type="password" className="input" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>}

        <div className="flex-row">
          <div className="remember-row">
            
            
          </div>
          <span className="span">Forgot password?</span>
        </div>

        <button type="submit" disabled={loading} className="bg-transparent">
          {loading ? isSignUp ? "Creating Account..." : "Signing In..." : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <p className="p">
          {isSignUp ? <>
              Already have an account?
              <span className="span" onClick={() => {
                setIsSignUp(false);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}>
                 Sign In
              </span>
            </> : <>
              Don’t have an account? 
              <span onClick={() => {
                setIsSignUp(true);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }} className="span text-left mx-[5px]">
                Sign Up
              </span>
            </>}
        </p>

        <p className="p line">Or With</p>

      <div className="flex flex-row gap-3">
  {/* Google Button */}
  <button
    type="button"
    className="btn google flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
    onClick={handleGoogleSignIn}
    disabled={loading}
  >
    <img
      alt="Google"
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSI0OHB4IiBoZWlnaHQ9IjQ4cHgiPjxwYXRoIGZpbGw9IiNGRkMxMDciIGQ9Ik00My42MTEsMjAuMDgzSDQyVjIwSDI0djhoMTEuMzAzYy0xLjY0OSw0LjY1Ny02LjA4LDgtMTEuMzAzLDhjLTYuNjI3LDAtMTItNS4zNzMtMTItMTJjMC02LjYyNyw1LjM3My0xMiwxMi0xMmMzLjA1OSwwLDUuODQyLDEuMTU0LDcuOTYxLDMuMDM5bDUuNjU3LTUuNjU3QzM0LjA0Niw2LjA1MywyOS4yNjgsNCwyNCw0QzEyLjk1NSw0LDQsMTIuOTU1LDQsMjRjMCwxMS4wNDUsOC45NTUsMjAsMjAsMjBjMTEuMDQ1LDAsMjAtOC45NTUsMjAtMjBDNDQsMjIuNjU5LDQzLjg2MiwyMS4zNSw0My42MTEsMjAuMDgzeiIvPjxwYXRoIGZpbGw9IiNGRjNEMDAiIGQ9Ik02LjMwNiwxNC42OTFsNi41NzEsNC44MTlDMTQuNjU1LDE1LjEwOCwxOC45NjEsMTIsMjQsMTJjMy4wNTksMCw1Ljg0MiwxLjE1NCw3Ljk2MSwzLjAzOWw1LjY1Ny01LjY1N0MzNC4wNDYsNi4wNTMsMjkuMjY4LDQsMjQsNEMxNi4zMTgsNCw5LjY1Niw4LjMzNyw2LjMwNiwxNC42OTF6Ii8+PHBhdGggZmlsbD0iIzRDQUY1MCIgZD0iTTI0LDQ0YzUuMTY2LDAsOS44Ni0xLjk3NywxMy40MDktNS4xOTJsLTYuMTktNS4yMzhDMjkuMjExLDM1LjA5MSwyNi43MTUsMzYsMjQsMzZjLTUuMjAyLDAtOS42MTktMy4zMTctMTEuMjgzLTcuOTQ2bC02LjUyMiw1LjAyNUM5LjUwNSwzOS41NTYsMTYuMjI3LDQ0LDI0LDQ0eiIvPjxwYXRoIGZpbGw9IiMxOTc2RDIiIGQ9Ik00My42MTEsMjAuMDgzSDQyVjIwSDI0djhoMTEuMzAzYy0wLjc5MiwyLjIzNy0yLjIzMSw0LjE2Ni00LjA4Nyw1LjU3MWMwLjAwMS0wLjAwMSwwLjAwMi0wLjAwMSwwLjAwMy0wLjAwMmw2LjE5LDUuMjM4QzM2Ljk3MSwzOS4yMDUsNDQsMzQsNDQsMjRDNDQsMjIuNjU5LDQzLjg2MiwyMS4zNSw0My42MTEsMjAuMDgzeiIvPjwvc3ZnPg=="
      className="w-5 h-5"
    />
    <span>Google</span>
  </button>

  {/* GitHub Button */}
  <button
    type="button"
    className="btn github flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
    onClick={handleGitHubSignIn}
  >
    <img
      alt="GitHub"
      src="data:image/png;base64,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"
      className="w-5 h-5"
    />
    <span>GitHub</span>
  </button>
</div>

          </form>
        </div>
      </div>
    </>;
};