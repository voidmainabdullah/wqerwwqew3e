import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { X } from "phosphor-react";
import { useNavigate } from "react-router-dom";

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
}) => (
  <div
    className={`relative flex flex-col rounded-2xl p-6 border transition-all ${
      isPopular
        ? "bg-gradient-to-br from-purple-600/20 via-purple-600/20 to-purple-500/20 text-white shadow-xl border-transparent"
        : "bg-zinc-800 border text-gray-100 hover:bg-zinc-800/75"
    }`}
  >
    {isPopular && (
      <span className="absolute top-4 right-4 bg-white/85 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
        25% OFF
      </span>
    )}

    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold mb-1">
      $ {price} <span className="text-base font-normal">/{period}</span>
    </p>
    <p className="text-gray-300 mb-4">{description}</p>

    <ul className="flex-1 space-y-2 mb-6">
      {features.map((feat, idx) => (
        <li key={idx} className="flex items-center space-x-2 text-sm">
          <span className="text-neutral-400">★</span>
          <span>{feat}</span>
        </li>
      ))}
    </ul>

    {isCurrent ? (
      <button
        className="w-full py-2 mt-auto rounded-lg border cursor-not-allowed text-neutral-600"
        disabled
      >
        Your current plan
      </button>
    ) : (
      <button
        onClick={onSubscribe}
        className={`w-full py-2 mt-auto rounded-lg font-semibold transition-colors ${
          isPopular
            ? "bg-white text-gray-700 hover:brightness-110"
            : "bg-white text-gray-700 hover:brightness-95"
        }`}
      >
        {isPopular ? `Upgrade to ${title}` : `Get ${title}`}
      </button>
    )}
  </div>
);

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------
  // Paddle URLs
  // -------------------------------
  const SANDBOX_CHECKOUT_URL =
    "https://sandbox-payadd.ple.io/hsc_01kbnh9xfbrrjdshk5ppmcff4k_652dx1e709v3e33edy8d8w7rwh1e9hez";
  const PRODUCTION_CHECKOUT_URL = "https://checkout.paddle.com/YOUR_PRODUCT_LINK";

  const PADDLE_CHECKOUT_URL =
    process.env.NODE_ENV === "production"
      ? PRODUCTION_CHECKOUT_URL
      : SANDBOX_CHECKOUT_URL;

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
      "Make realistic images",
      "Store more context for smarter replies",
      "Plan tasks with assistance",
    ],
    plus: [
      "Solve complex problems",
      "Long chats over sessions",
      "Create more images, faster",
      "Remember goals & past conversations",
      "Travel & tasks planning",
    ],
    pro: [
      "Handle advanced tasks",
      "Unlimited messages & projects",
      "High-quality image generation",
      "Full memory context",
      "Run research & agent workflows",
    ],
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f] flex flex-col items-center py-12 px-4 relative">
      {/* CROSS ICON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition"
      >
        <X size={30} weight="bold" />
      </button>

      <h1 className="text-4xl font-bold text-white mb-6">Upgrade your plan</h1>

      {/* Plan toggle */}
      <div className="mb-12 flex space-x-4">
        <button className="px-4 py-2 rounded-full bg-gray-800 text-white">
          Personal
        </button>
        <button className="px-4 py-2 rounded-full bg-gray-700 text-gray-300">
          Business
        </button>
      </div>

      {/* Pricing Cards */}
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
          price="6.99"
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
