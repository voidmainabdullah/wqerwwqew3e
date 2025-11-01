import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();  
  const { actualTheme } = useTheme();

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
        description: "Please fill in all required fields",
      });
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (!error) {
          toast({
            title: "Account created!",
            description: "Please verify your email to continue.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
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
        description: error.message || "Failed to sign in with Google",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #000;
          overflow: hidden;
        }

        .auth-image-section {
          relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
        }

        .auth-image-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .auth-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: radial-gradient(circle at top right, #111 0%, #000 100%);
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
          background: linear-gradient(90deg, #2d79f3, #194bd4);
          color: white;
          border: none;
          height: 66px;
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
        <div className="auth-image-section">
          <img src="/showcase2.png" alt="File sharing showcase" />
        </div>
        <div className="auth-form-section">
          <form className="form" onSubmit={handleSubmit}>
        <div className="logo-area">
          <img src="/skie.png" alt="logo" className="logo" />
          <h2>{isSignUp ? "Join SkieShare" : "Welcome Back"}</h2>
          <p>
            {isSignUp
              ? "Create your account and start sharing securely"
              : "Sign in to your SkieShare dashboard"}
          </p>
        </div>

        {isSignUp && (
          <div className="flex-column">
            <label>Display Name</label>
            <div className="inputForm">
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-column">
          <label>Email</label>
          <div className="inputForm">
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className="inputForm">
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {isSignUp && (
          <div className="flex-column">
            <label>Confirm Password</label>
            <div className="inputForm">
              <input
                type="password"
                className="input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="flex-row">
          <div className="remember-row">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <span className="span">Forgot password?</span>
        </div>

        <button
          type="submit"
          className="button-submit"
          disabled={loading}
        >
          {loading
            ? isSignUp
              ? "Creating Account..."
              : "Signing In..."
            : isSignUp
            ? "Create Account"
            : "Sign In"}
        </button>

        <p className="p">
          {isSignUp ? (
            <>
              Already have an account?
              <span
                className="span"
                onClick={() => {
                  setIsSignUp(false);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                 Sign In
              </span>
            </>
          ) : (
            <>
              Don’t have an account? 
              <span
                className="span"
                onClick={() => {
                  setIsSignUp(true);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Sign Up
              </span>
            </>
          )}
        </p>

        <p className="p line">Or With</p>

        <div className="flex-row">
          <button
            type="button"
            className="btn google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg
              version="1.1"
              width={20}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="#FBBB00"
                d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"
              />
            </svg>
            Google
          </button>

          <button type="button" className="btn apple">
            <svg
              version="1.1"
              width={20}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 22.773 22.773"
            >
              <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675..." />
            </svg>
            Apple
          </button>
        </div>
          </form>
        </div>
      </div>
    </>
  );
};

