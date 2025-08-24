import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({ isSignUp, onToggle }) => {
  return (
    <div className="text-center">
      <button
        onClick={onToggle}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isSignUp ? (
          <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
        ) : (
          <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
        )}
      </button>
    </div>
  );
};