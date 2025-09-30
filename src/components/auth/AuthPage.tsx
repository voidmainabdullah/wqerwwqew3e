import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeSlash, Envelope, Lock, User, ArrowRight, Shield, Lightning, ArrowLeft } from 'phosphor-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
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
            title: "Account created successfully!",
            description: "Please check your email to verify your account."
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
  return <div className="min-h-screen flex items-center justify-center relative bg-background">

      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      
      {/* Content Container */}
      <div className="relative z-20 w-full max-w-md mx-auto p-4">
          {/* Back to Home Button */}
          <div className="mb-8">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground group transition-all duration-300 hover:scale-105" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-4 w-4" />
              <span className="relative">
                Back to Home
              </span>
            </Button>
          </div>

          <Card className="backdrop-blur-md bg-card/90 border border-border/60 shadow-xl">
              
              <CardHeader className="text-center space-y-4">
                {/* Logo with enhanced effects */}
                <div className="mx-auto relative">
                  <div className="relative w-20 h-20 mx-auto group">
                    <img 
                      src="/sky.png" 
                      alt="SkieShare Logo" 
                      className="w-20 h-20 object-contain transition-all duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 blur-md opacity-0 group-hover:opacity-40 transition-all duration-500">
                      <img src="/sky.png" alt="SkieShare Logo Glow" className="w-20 h-20 object-contain" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                
                <div>
                  <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {isSignUp ? 'Join SkieShare' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-lg font-body mt-3 text-muted-foreground">
                    {isSignUp ? 'Create your account and start sharing files securely' : 'Sign in to access your secure file sharing dashboard'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Google Sign In with enhanced styling */}
                <div>
                  <Button variant="outline" className={`w-full h-14 text-base font-medium border-2 transition-all duration-300 relative overflow-hidden group ${actualTheme === 'light' ? 'border-slate-300 hover:bg-slate-50 hover:border-indigo-400' : 'hover:bg-accent/50'} font-heading icon-text`} onClick={handleGoogleSignIn} disabled={loading}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 py-1 font-body text-muted-foreground rounded-full border border-border/50">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Enhanced Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-heading font-medium">
                        Display Name
                      </Label>
                      <div className="relative group">
                        <span className="material-icons md-18 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">person</span>
                        <Input id="displayName" type="text" placeholder="Enter your name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-11 h-14 text-base font-body" />
                      </div>
                    </div>}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-heading font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <span className="material-icons md-18 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">email</span>
                      <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="pl-11 h-14 text-base font-body" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-heading font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <span className="material-icons md-18 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">lock</span>
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-11 pr-11 h-14 text-base font-body" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <span className={`material-icons md-24 ${actualTheme === 'light' ? 'text-black' : 'text-primary'}`}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {isSignUp && <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-heading font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative group">
                        <span className="material-icons md-18 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">lock</span>
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-11 pr-11 h-14 text-base font-body" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <span className="material-icons md-18">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>}

                  <div>
                    <Button type="submit" className={`w-full h-14 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group ${actualTheme === 'light' ? 'bg-black hover:bg-neutral-800 text-white hover:shadow-black/20' : 'bg-white hover:bg-neutral-200 text-black hover:shadow-white/20'} font-heading icon-text`} disabled={loading}>
                      {loading ? <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${actualTheme === 'light' ? 'border-white' : 'border-primary-foreground'}`} />
                          <span>
                            {isSignUp ? 'Creating Account...' : 'Signing In...'}
                          </span>
                        </div> : <div className="flex items-center gap-3">
                          <span className="material-icons md-18">arrow_forward</span>
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        </div>}
                    </Button>
                  </div>
                </form>

                {/* Toggle between Sign In and Sign Up */}
                <div className="text-center">
                  <button onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setDisplayName('');
            }} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                    {isSignUp ? <>
                        Already have an account?{' '}
                        <span className="text-primary font-heading font-medium">
                          Sign in
                        </span>
                      </> : <>
                        Don't have an account?{' '}
                        <span className="text-primary font-heading font-medium">
                          Sign up
                        </span>
                      </>}
                  </button>
                </div>

                {/* Enhanced Security Notice */}
                
              </CardContent>
          </Card>
      </div>

    </div>;
};