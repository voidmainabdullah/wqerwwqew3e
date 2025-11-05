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
    features: ["100GB storage per user", "Advanced file sharing", "Real-time collaboration", "Team management tools", "Advanced Controls", "E25 Encryption","Premium Features", "24/7 support"],
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
  return <section id="pricing" className="w-full py-20 px-6 md:px-12 bg-black text-white" ref={ref}>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-white">
            Simple pricing that scales
          </h2>
          <p className="font-body text-white/70 text-base md:text-lg">
            Choose the perfect plan for your team's file sharing and collaboration needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => <motion.div key={index} className={`p-6 md:p-8 rounded-2xl border flex flex-col h-full ${plan.popular ? "border-white/30 bg-white/5 hover:bg-white/10 shadow-2xl shadow-white/10" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"} transition-all duration-300 relative backdrop-blur-sm`} initial={{
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
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs md:text-sm rounded-full font-medium bg-white text-black">
                  <span className="material-icons md-18 mr-1 align-middle">star</span>
                  Most Popular
                </div>}
              
              <div className="mb-auto">
                <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight mb-1 text-white">{plan.name}</h3>
                
                <div className="mb-4">
                  <div className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-white">{plan.price}</div>
                  {plan.period && <div className="text-sm font-body text-white/60">{plan.period}</div>}
                </div>
                
                <p className="font-body text-white/70 text-sm md:text-base mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
                        <span className="material-icons md-18 text-white">check</span>
                      </div>
                      <span className="text-xs md:text-sm font-body text-white/90">{feature}</span>
                    </div>)}
                </div>
              </div>
              
              <div className="mt-6">
                <Button className={`w-full font-heading font-semibold icon-text transition-all ${plan.buttonVariant === "default" ? "bg-white text-black hover:bg-white/90" : "border-white/20 text-white hover:bg-white/10 hover:border-white/30"}`} variant={plan.buttonVariant as "default" | "outline"}>
                  <span className="material-icons md-18">
                    {plan.buttonVariant === "default" ? "rocket_launch" : "contact_support"}
                  </span>
                  {plan.buttonText}
                </Button>
              </div>
            </motion.div>)}
        </div>
        
        <div className="text-center font-body text-white/70 text-sm md:text-base">
          Have questions? <a href="#" className="text-white hover:text-white/80 underline underline-offset-4 icon-text transition-colors">
            <span className="material-icons md-18 align-middle">contact_support</span>
            Contact our sales team
          </a>
        </div>
      </div>
    </section>;
};
export default Pricing;