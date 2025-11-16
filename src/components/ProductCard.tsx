import React, { useState } from 'react';
import { StripeProduct } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';
import { Check, Loader as Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: StripeProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession({
        price_id: product.priceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: window.location.href,
        mode: product.mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">${product.price}</span>
          <span className="text-gray-500 ml-1">
            /{product.mode === 'subscription' ? 'month' : 'one-time'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          All advanced features
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          Enhanced security
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          Monthly timeline updates
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Processing...
          </>
        ) : (
          `Get ${product.name}`
        )}
      </button>
    </div>
  );
}