// src/components/ui/animated-icons.tsx
import React from "react";

interface AnimatedIconProps {
  show: boolean;
  type: "files" | "shares" | "downloads" | "storage";
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  show,
  className = "",
}) => {
  if (!show) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in ${className}`}
    >
      {/* Foggy glowing blob */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200/40 to-gray-400/20 blur-2xl animate-fog opacity-40" />
    </div>
  );
};

interface EmptyStateIconProps {
  type: "files" | "shares" | "downloads" | "storage";
  className?: string;
}

export const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({
  type,
  className = "",
}) => {
  const getEmptyStateText = () => {
    switch (type) {
      case "files":
        return { text: "No files yet", color: "text-yellow-400" };
      case "shares":
        return { text: "No shares yet", color: "text-green-400" };
      case "downloads":
        return { text: "No downloads yet", color: "text-blue-400" };
      case "storage":
        return { text: "Storage empty", color: "text-red-400" };
      default:
        return null;
    }
  };

  const content = getEmptyStateText();
  if (!content) return null;

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in ${className}`}
    >
      {/* Small fog blob */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300/40 to-gray-500/20 blur-xl animate-fog opacity-50 mb-2" />
      <span className={`text-xs ${content.color}`}>{content.text}</span>
    </div>
  );
};
