import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Share, 
  Clock, 
  BarChart3, 
  Lock, 
  Zap,
  ArrowRight,
  Upload,
  Download,
  Eye
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

const Index = () => {
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your files are protected with bank-level encryption and security measures."
    },
    {
      icon: Share,
      title: "Flexible Sharing",
      description: "Share via unique codes, email links, or direct downloads with custom permissions."
    },
    {
      icon: Clock,
      title: "Smart Expiry",
      description: "Set automatic expiry dates and download limits for enhanced security."
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track downloads, monitor activity, and get insights on your shared files."
    },
    {
      icon: Lock,
      title: "File Locking",
      description: "Lock files to prevent unauthorized re-sharing or unwanted access."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Upload and share files instantly with our optimized infrastructure."
    }
  ];

  const stats = [
    { label: "Files Shared", value: "1M+", icon: Upload },
    { label: "Downloads", value: "10M+", icon: Download },
    { label: "Active Users", value: "50K+", icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Overlay */}
      <div className="relative z-10">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/Skieshare-removebg-preview.png" 
                alt="SecureShare Logo" 
                className="h-6 w-auto sm:h-8 md:h-10 object-contain"
              />
              <h1 className="text-lg sm:text-xl font-bold">SecureShare</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="/auth">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/auth">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Secure File Sharing
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Share files securely with unique codes, email links, or direct downloads. 
            Track every download, set expiry dates, and maintain complete control over your content.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="/auth">
                Start Sharing
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <a href="/code">
                <Download className="mr-2 h-5 w-5" />
                Download with Code
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for secure file sharing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade features designed for both individual users and teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who trust SecureShare for their file sharing needs.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="/auth">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/Skieshare-removebg-preview.png" 
                alt="SecureShare Logo" 
                className="h-5 w-auto sm:h-6 object-contain"
              />
              <span className="text-sm sm:text-base font-bold">SecureShare</span>
            </div>
            
            <div className="text-muted-foreground text-sm">
              © 2024 SecureShare. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
