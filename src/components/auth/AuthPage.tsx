import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { actualTheme } = useTheme();
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
    <div className={`min-h-screen flex flex-col relative ${
      actualTheme === 'light' 
        ? 'bg-white' 
        : 'bg-white'
    }`}>
      {/* Simple gradient background - no animations */}
      <div className={`absolute inset-0 ${
        actualTheme === 'light'
          ? 'bg-gradient-to-br from-white via-blue-50/30 to-white'
          : 'bg-gradient-to-br from-white via-gray-50 to-white'
      }`} />
      
      {/* Content Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
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
              className={`flex items-center gap-2 group transition-all duration-300 hover:scale-105 ${
                actualTheme === 'light'
                  ? 'text-gray-600 hover:text-black hover:bg-blue-50'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
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
            <Card className="bg-white border border-gray-200 shadow-xl relative">
              
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
                    
                    {/* Simple border ring */}
                    <div className={`absolute inset-0 rounded-xl border-2 ${
                      actualTheme === 'light' ? 'border-blue-200' : 'border-gray-200'
                    }`} />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <CardTitle className="text-3xl font-bold text-black">
                    {isSignUp ? 'Join SkieShare' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-lg mt-3 text-gray-600">
                    {isSignUp 
                      ? 'Create your account and start sharing files securely' 
                      : 'Sign in to access your secure file sharing dashboard'
                    }
                  </CardDescription>
                </motion.div>
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
                    className={`w-full h-14 text-base font-medium border-2 transition-all duration-300 relative group ${
                      actualTheme === 'light' 
                        ? 'border-blue-200 hover:bg-blue-50 hover:border-blue-400 text-black' 
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-400 text-black bg-white'
                    }`}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
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
                      <Envelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                        actualTheme === 'light'
                          ? 'text-gray-500 group-focus-within:text-blue-600'
                          : 'text-gray-500 group-focus-within:text-black'
                      }`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-11 h-14 text-base transition-all duration-300 focus:ring-2 hover:border-opacity-70 text-black bg-white border-gray-200 ${
                          actualTheme === 'light'
                            ? 'focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400'
                            : 'focus:ring-gray-500/20 focus:border-gray-500 hover:border-gray-400'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                        actualTheme === 'light'
                          ? 'text-gray-500 group-focus-within:text-blue-600'
                          : 'text-gray-500 group-focus-within:text-black'
                      }`} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-11 pr-11 h-14 text-base transition-all duration-300 focus:ring-2 hover:border-opacity-70 text-black bg-white border-gray-200 ${
                          actualTheme === 'light'
                            ? 'focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400'
                            : 'focus:ring-gray-500/20 focus:border-gray-500 hover:border-gray-400'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-all duration-300 hover:scale-110"
                      >
                        <Shield className="h-6 w-6 flex-shrink-0 mt-1 text-gray-500" />
                      </button>
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
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                          actualTheme === 'light'
                            ? 'text-gray-500 group-focus-within:text-blue-600'
                            : 'text-gray-500 group-focus-within:text-black'
                        }`} />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`pl-11 pr-11 h-14 text-base transition-all duration-300 focus:ring-2 hover:border-opacity-70 text-black bg-white border-gray-200 ${
                            actualTheme === 'light'
                              ? 'focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400'
                              : 'focus:ring-gray-500/20 focus:border-gray-500 hover:border-gray-400'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-all duration-300 hover:scale-110"
                        >
                          {showConfirmPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className={`w-full h-14 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative group ${
                        actualTheme === 'light' 
                          ? 'bg-black hover:bg-gray-800 text-white hover:shadow-black/20' 
                          : 'bg-white hover:bg-gray-100 text-black hover:shadow-gray/20 border border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-5 h-5 border-2 border-t-transparent rounded-full border-current"
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
                    className={`text-sm transition-all duration-300 group relative ${
                      actualTheme === 'light'
                        ? 'text-gray-600 hover:text-blue-600'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {isSignUp ? (
                      <>
                        Already have an account?{' '}
                        <span className={`font-medium relative ${
                          actualTheme === 'light'
                            ? 'text-blue-600 group-hover:text-blue-700'
                            : 'text-black group-hover:text-gray-800'
                        }`}>
                          Sign in
                          <span className={`absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
                            actualTheme === 'light' ? 'bg-blue-600' : 'bg-black'
                          }`}></span>
                        </span>
                      </>
                    ) : (
                      <>
                        Don't have an account?{' '}
                        <span className={`font-medium relative ${
                          actualTheme === 'light'
                            ? 'text-blue-600 group-hover:text-blue-700'
                            : 'text-black group-hover:text-gray-800'
                        }`}>
                          Sign up
                          <span className={`absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300 ${
                            actualTheme === 'light' ? 'bg-blue-600' : 'bg-black'
                          }`}></span>
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Enhanced Security Notice */}
                <motion.div 
                  className={`p-6 rounded-xl border relative ${
                    actualTheme === 'light' 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <div className="flex items-start gap-4">
                    <Shield className={`h-6 w-6 flex-shrink-0 mt-1 ${
                      actualTheme === 'light' ? 'text-blue-600' : 'text-black'
                    }`} />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-black">Your data is secure</p>
                      <p className="text-gray-600 leading-relaxed">
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
                            className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${
                              actualTheme === 'light' 
                                ? 'bg-blue-50 text-gray-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                          >
                            <feature.icon className={`w-3 h-3 ${
                              actualTheme === 'light' 
                                ? 'text-blue-600' 
                                : 'text-black'
                            }`} />
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
    </div>
  );
};