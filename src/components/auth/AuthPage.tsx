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
import { 
  Eye, 
  EyeSlash, 
  Envelope, 
  Lock, 
  User, 
  Shield,
  Lightning,
  ArrowLeft
} from 'phosphor-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Transform effects for curved lines
  const topLineWidth = useTransform(scrollY, [0, 300], ["0%", "100%"]);
  const topLineOpacity = useTransform(scrollY, [0, 300], [0, 1]);
  const bottomLineWidth = useTransform(scrollY, [100, 400], ["0%", "100%"]);
  const bottomLineOpacity = useTransform(scrollY, [100, 400], [0, 1]);

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
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Top Animated Curved Line */}
      <motion.div 
        className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-white to-transparent z-10"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)"
        }}
      />

      {/* Curved decorative lines */}
      <motion.svg 
        className="absolute top-0 left-0 w-full h-32 z-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 3, delay: 0.5 }}
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,100 Q250,50 500,100 T1000,100"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,120 Q300,70 600,120 T1000,120"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, delay: 1, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      
      {/* Content Container */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground group transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="relative">
                Back to Home
                <span className="absolute bottom-0 left-0 w-0 h-px bg-current group-hover:w-full transition-all duration-300"></span>
              </span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <Card className="backdrop-blur-md bg-card/90 border border-border/60 shadow-2xl relative overflow-hidden">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-gradient-shift"></div>
              
              {/* Floating decorative elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-accent/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <CardHeader className="text-center space-y-6 relative z-10">
                {/* Logo with enhanced effects */}
                <motion.div 
                  className="mx-auto relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.6 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <img 
                      src="/sky.png" 
                      alt="SkieShare Logo" 
                      className="w-20 h-20 object-contain transition-all duration-500 filter hover:brightness-110"
                    />
                    
                    {/* Rotating glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-primary/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Pulsing glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/10"
                      animate={{ scale: [1, 1.3, 1], opacity: [0, 0, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {isSignUp ? 'Join SkieShare' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-lg mt-3 text-muted-foreground">
                    {isSignUp 
                      ? 'Create your account and start sharing files securely' 
                      : 'Sign in to access your secure file sharing dashboard'
                    }
                  </CardDescription>
                </motion.div>

                {/* Floating sparkles */}
                <div className="absolute top-8 left-8">
                  <motion.div
                    className="w-1 h-1 bg-primary rounded-full"
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
                <div className="absolute top-12 right-12">
                  <motion.div
                    className="w-1.5 h-1.5 bg-accent rounded-full"
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [360, 180, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                {/* Google Sign In with enhanced styling */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-medium border-2 hover:bg-accent/50 transition-all duration-300 relative overflow-hidden group"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <svg className="w-6 h-6 mr-3 relative z-10" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="relative z-10">Continue with Google</span>
                  </Button>
                </motion.div>

                <motion.div 
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 py-1 text-muted-foreground rounded-full border border-border/50">
                      Or continue with email
                    </span>
                  </div>
                </motion.div>

                {/* Enhanced Email/Password Form */}
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {isSignUp && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="displayName" className="text-sm font-medium">
                        Display Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                          id="displayName"
                          type="text"
                          placeholder="Enter your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="pl-11 h-14 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Envelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-14 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                        required
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-14 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                      >
                        {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {isSignUp && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 pr-11 h-14 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                        >
                          {showConfirmPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20 relative overflow-hidden group"
                      disabled={loading}
                    >
                      {/* Button shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="animate-pulse">
                            {isSignUp ? 'Creating Account...' : 'Signing In...'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 relative z-10">
                          <Lightning className="h-5 w-5" />
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>

                {/* Toggle between Sign In and Sign Up */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setDisplayName('');
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 group relative"
                  >
                    {isSignUp ? (
                      <>
                        Already have an account?{' '}
                        <span className="text-primary font-medium group-hover:text-primary/80 relative">
                          Sign in
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </>
                    ) : (
                      <>
                        Don't have an account?{' '}
                        <span className="text-primary font-medium group-hover:text-primary/80 relative">
                          Sign up
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"></span>
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Enhanced Security Notice */}
                <motion.div 
                  className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 p-6 rounded-xl border border-border/50 relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  {/* Security badge animation */}
                  <div className="absolute top-2 right-2">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    </motion.div>
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-foreground">Your data is secure</p>
                      <p className="text-muted-foreground leading-relaxed">
                        We use industry-standard encryption to protect your account and files. 
                        All transfers are secured with end-to-end encryption.
                      </p>
                      
                      {/* Security features */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {[
                          { icon: Shield, text: "Encrypted" },
                          { icon: Lock, text: "Secure" },
                          { icon: Lightning, text: "Fast" },
                          { icon: User, text: "Private" }
                        ].map((feature, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                          >
                            <feature.icon className="w-3 h-3 text-primary" />
                            <span>{feature.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom Curved Lines */}
      <motion.svg 
        className="absolute bottom-0 left-0 w-full h-32 z-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 3, delay: 1 }}
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,100 Q250,150 500,100 T1000,100"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,80 Q400,130 800,80 T1000,80"
          stroke="rgba(59,130,246,0.2)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, delay: 2, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Bottom Animated Glow Line */}
      <motion.div 
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        style={{
          width: bottomLineWidth,
          opacity: bottomLineOpacity,
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.3)"
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i * 5)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};