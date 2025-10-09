import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Lightning } from 'phosphor-react';
interface PriceCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSubscribe: () => void;
}
export const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  onSubscribe
}) => {
  return <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-indigo-400 text-neutral-100 font-heading">
          <span className="material-icons md-18 mr-1">flash_on</span>
          Most Popular
        </Badge>}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-heading">{title}</CardTitle>
        <CardDescription className="font-body">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-heading font-bold">{price}</span>
          <span className="font-body text-muted-foreground">/{period}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => <li key={index} className="flex items-center">
              <span className="material-icons md-18 mr-2 flex-shrink-0 text-base text-green-400">check</span>
              <span className="text-sm font-body">{feature}</span>
            </li>)}
        </ul>
        
        <Button onClick={onSubscribe} className="w-full font-heading icon-text" variant={isPopular ? "default" : "outline"}>
          <span className="material-icons md-18">
            {isPopular ? 'rocket_launch' : 'contact_support'}
          </span>
          Subscribe to {title}
        </Button>
      </CardContent>
    </Card>;
};