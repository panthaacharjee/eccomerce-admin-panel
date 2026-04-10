// components/LoadingAnimation.tsx
import React from "react";

interface LoadingAnimationProps {
  isLoading?: boolean;
  message?: string;
}

const Processing: React.FC<LoadingAnimationProps> = ({
  isLoading = true,
  message = "Loading...",
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Simple Circle Loader */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* Loading Message */}
        {message && (
          <p className="text-white text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Processing;