import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "phosphor-react";

interface PriceCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onSubscribe?: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  isPopular,
  isCurrent,
  onSubscribe,
}) => {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 border transition-all ${
        isPopular
          ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-xl border-transparent"
          : "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
      }`}
    >
      {isPopular && (
        <span className="absolute top-4 right-4 bg-white text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
          NEW
        </span>
      )}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">
        Rs {price} <span className="text-base font-normal">/{period}</span>
      </p>
      <p className="text-gray-300 mb-4">{description}</p>

      <ul className="flex-1 space-y-2 mb-6">
        {features.map((feat, idx) => (
          <li key={idx} className="flex items-center space-x-2 text-sm">
            <span className="text-cyan-400">★</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button
          className="w-full py-2 mt-auto rounded-lg bg-gray-700 cursor-not-allowed text-gray-400"
          disabled
        >
          Your current plan
        </button>
      ) : (
        <button
          onClick={onSubscribe}
          className={`w-full py-2 mt-auto rounded-lg font-semibold transition-colors ${
            isPopular
              ? "bg-white text-purple-700 hover:brightness-95"
              : "bg-cyan-500 text-gray-900 hover:brightness-105"
          }`}
        >
          {isPopular ? `Upgrade to ${title}` : `Get ${title}`}
        </button>
      )}
    </div>
  );
};

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { isPro, subscriptionEndDate } = useSubscription();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const PADDLE_CHECKOUT_URL =
    "https://sandbox-pay.paddle.io/hsc_01kbnh9xfbrrjdshk5ppmcff4k_652dx1e709v3e33edy8d8w7rwh1e9hez";

  const handleSubscribe = (plan: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to subscribe.",
      });
      return;
    }

    setIsLoading(true);

    const passthrough = JSON.stringify({ user_id: user.id, email: user.email });

    const checkoutUrl = new URL(PADDLE_CHECKOUT_URL);
    checkoutUrl.searchParams.set("passthrough", passthrough);
    checkoutUrl.searchParams.set("email", user.email || "");
    checkoutUrl.searchParams.set(
      "success_url",
      `${window.location.origin}/subscription/success`
    );

    window.location.href = checkoutUrl.toString();
  };

  const features = {
    free: [
      "Get simple explanations",
      "Have short chats for common questions",
      "Try out image generation",
      "Save limited memory and context",
    ],
    go: [
      "Go deep on harder questions",
      "Chat longer and upload more content",
      "Make realistic images for your projects",
      "Store more context for smarter replies",
      "Get help with planning and tasks",
    ],
    plus: [
      "Solve complex problems",
      "Have long chats over multiple sessions",
      "Create more images, faster",
      "Remember goals and past conversations",
      "Plan travel and tasks with agent mode",
    ],
    pro: [
      "Master advanced tasks and topics",
      "Tackle big projects with unlimited messages",
      "Create high-quality images at any scale",
      "Keep full context with maximum memory",
      "Run research and plan tasks with agents",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-6">Upgrade your plan</h1>

      {/* Plan toggle (optional) */}
      <div className="mb-12 flex space-x-4">
        <button className="px-4 py-2 rounded-full bg-gray-800 text-white">Personal</button>
        <button className="px-4 py-2 rounded-full bg-gray-700 text-gray-300">Business</button>
      </div>

      {/* Pricing grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full">
        <PriceCard
          title="Free"
          price="0"
          period="month"
          description="See what AI can do"
          features={features.free}
          isCurrent
        />
        <PriceCard
          title="Go"
          price="1,400"
          period="month"
          description="Do more with smarter AI"
          features={features.go}
          isPopular
          onSubscribe={() => handleSubscribe("Go")}
        />
        <PriceCard
          title="Plus"
          price="5,700"
          period="month"
          description="Unlock the full experience"
          features={features.plus}
          onSubscribe={() => handleSubscribe("Plus")}
        />
        <PriceCard
          title="Pro"
          price="49,900"
          period="month"
          description="Maximize your productivity"
          features={features.pro}
          onSubscribe={() => handleSubscribe("Pro")}
        />
      </div>
    </div>
  );
};
