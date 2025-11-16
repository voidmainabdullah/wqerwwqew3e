import React, { useEffect, useState } from 'react';
import { getUserSubscription } from '../lib/stripe';
import { stripeProducts } from '../stripe-config';
import { Crown, Calendar, CreditCard } from 'lucide-react';

interface Subscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        <Crown className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No active subscription</p>
      </div>
    );
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id);
  const isActive = subscription.subscription_status === 'active';

  return (
    <div className={`rounded-lg shadow p-6 ${isActive ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
      <div className="flex items-center mb-4">
        <Crown className={`h-6 w-6 mr-2 ${isActive ? 'text-green-600' : 'text-yellow-600'}`} />
        <h3 className="text-lg font-semibold text-gray-900">
          {product?.name || 'Premium Subscription'}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscription.subscription_status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {subscription.current_period_end && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {isActive ? 'Renews' : 'Expires'} on{' '}
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>
              {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}