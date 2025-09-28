import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
const Pricing = () => {
  const {
    ref,
    inView
  } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  const plans = [{
    name: "Personal",
    price: "Free",
    description: "Perfect for individuals and small teams getting started",
    features: ["5GB storage", "Basic file sharing", "Standard security", "Email support", "File version history (7 days)"],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false
  }, {
    name: "Professional",
    price: "$6.99",
    period: "per user/month",
    description: "Ideal for growing teams with advanced collaboration needs",
    features: ["100GB storage per user", "Advanced file sharing", "Real-time collaboration", "Team management tools", "Advanced security controls", "API access", "Priority support"],
    buttonText: "Start 14-day trial",
    buttonVariant: "default",
    popular: true
  }, {
    name: "Professional +",
    price: "69.99$",
    period: "per user/year",
    description: "For large organizations with complex file management needs",
    features: ["Unlimited storage", "Custom workflows", "Advanced compliance tools", "Dedicated infrastructure", "White-label solutions", "Dedicated account manager", "24/7 premium support"],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    popular: false
  }];
  return <section id="pricing" className="w-full py-20 px-6 md:px-12 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div className="text-center space-y-4 max-w-3xl mx-auto" initial={{
        opacity: 0,
        y: 30
      }} animate={inView ? {
        opacity: 1,
        y: 0
      } : {
        opacity: 0,
        y: 30
      }} transition={{
        duration: 0.6
      }}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tighter text-foreground">
            Simple pricing that scales
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            Choose the perfect plan for your team's file sharing and collaboration needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => <motion.div key={index} className={`p-6 rounded-xl border flex flex-col h-full ${plan.popular ? "border-primary/50 cosmic-glow bg-card hover:shadow-xl" : "border-border cosmic-gradient bg-card hover:border-primary/30 hover:shadow-lg"} transition-all duration-300 relative`} initial={{
          opacity: 0,
          y: 30
        }} animate={inView ? {
          opacity: 1,
          y: 0
        } : {
          opacity: 0,
          y: 30
        }} transition={{
          duration: 0.6,
          delay: index * 0.2
        }}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-neutral-100 text-sm rounded-full font-medium bg-zinc-700">
                  <span className="material-icons md-18 mr-1">star</span>
                  Most Popular
                </div>}
              
              <div className="mb-auto">
                <h3 className="text-2xl font-heading font-bold tracking-tighter mb-1 text-foreground">{plan.name}</h3>
                
                <div className="mb-4">
                  <div className="text-3xl font-heading font-bold tracking-tighter text-foreground">{plan.price}</div>
                  {plan.period && <div className="text-sm font-body text-muted-foreground">{plan.period}</div>}
                </div>
                
                <p className="font-body text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center text-primary bg-neutral-700">
                        <span className="material-icons md-18 text-green-300">check</span>
                      </div>
                      <span className="text-sm font-body text-foreground">{feature}</span>
                    </div>)}
                </div>
              </div>
              
              <div className="mt-6">
                <Button className={`${plan.buttonVariant === "default" ? "w-full" : "w-full border-neutral-300 text-foreground hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"} font-heading font-semibold icon-text`} variant={plan.buttonVariant as "default" | "outline"}>
                  <span className="material-icons md-18">
                    {plan.buttonVariant === "default" ? "rocket_launch" : "contact_support"}
                  </span>
                  {plan.buttonText}
                </Button>
              </div>
            </motion.div>)}
        </div>
        
        <div className="text-center font-body text-muted-foreground">
          Have questions? <a href="#" className="text-primary hover:underline icon-text">
            <span className="material-icons md-18">contact_support</span>
            Contact our sales team
          </a>
        </div>
      </div>
    </section>;
};
export default Pricing;