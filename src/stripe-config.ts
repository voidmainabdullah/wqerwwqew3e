export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_TQvR7DLaVpEtha',
    priceId: 'price_1SU3aKQuVyBbjcoUlqNlSKfi',
    name: 'Skieshare Premium +',
    description: 'All advanced features & Security | Monthly Time-Line',
    price: 6.99,
    currency: 'USD',
    mode: 'subscription',
  },
];