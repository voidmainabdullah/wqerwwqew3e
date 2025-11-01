import React, { useState } from "react";
import styled from "styled-components";
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
    <StyledWrapper>
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
          <div>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember"> Remember me </label>
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
                d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
	              c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644..."
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
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #111 0%, #000 100%);

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #1f1f1f;
    padding: 40px;
    width: 420px;
    border-radius: 20px;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
  }

  .logo-area {
    text-align: center;
    margin-bottom: 10px;
  }

  .logo {
    width: 70px;
    height: 70px;
    margin-bottom: 10px;
  }

  h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    color: #aaa;
    font-size: 14px;
  }

  label {
    color: #f1f1f1;
    font-weight: 600;
    font-size: 14px;
  }

  .inputForm {
    border: 1.5px solid #333;
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background-color: #2b2b2b;
    transition: 0.3s ease;
  }

  .inputForm:focus-within {
    border-color: #2d79f3;
  }

  .input {
    width: 100%;
    background: none;
    border: none;
    color: #f1f1f1;
    font-size: 15px;
    height: 100%;
  }

  .input:focus {
    outline: none;
  }

  .button-submit {
    background: linear-gradient(90deg, #2d79f3, #194bd4);
    color: white;
    border: none;
    height: 50px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s ease;
  }

  .button-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 10px #2d79f3;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .span {
    color: #2d79f3;
    cursor: pointer;
  }

  .btn {
    width: 48%;
    height: 45px;
    border-radius: 10px;
    background: #2b2b2b;
    color: #f1f1f1;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    transition: 0.3s ease;
  }

  .btn:hover {
    border-color: #2d79f3;
  }

  @media (max-width: 480px) {
    .form {
      width: 90%;
      padding: 30px;
    }
  }
`;

