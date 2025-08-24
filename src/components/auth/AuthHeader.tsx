import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Shield, Lightning } from 'phosphor-react';
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  isSignUp: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  return (
    <CardHeader className="text-center space-y-4">
      <motion.div 
        className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {isSignUp ? (
          <User className="h-8 w-8 text-primary" />
        ) : (
          <Shield className="h-8 w-8 text-primary" />
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
          <Lightning className="h-5 w-5 text-primary" />
        </CardTitle>
        <CardDescription className="text-base mt-2">
          {isSignUp 
            ? 'Join thousands of users sharing files securely' 
            : 'Sign in to your SecureShare account'
          }
        </CardDescription>
      </motion.div>
    </CardHeader>
  );
};