'use client';

import { Loader2 } from 'lucide-react';

interface GeneralLoadingProps {
  message: string;
  submessage?: string;
}

export default function GeneralLoading({ message, submessage }: GeneralLoadingProps) {
  return (
    <div className="w-full py-8 sm:py-12">
      <div className="text-center space-y-4 sm:space-y-6">
        {/* Animated Loader Icon */}
        <div className="relative inline-block">
          <div className="animate-spin">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto" />
          </div>
        </div>

        {/* Loading Text with Animation */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground animate-pulse">
            {message}
          </h3>
          {submessage && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {submessage}
            </p>
          )}
        </div>

        {/* Animated Progress Bar */}
        <div className="max-w-xs sm:max-w-sm mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-blue-500 to-green-500 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 sm:space-x-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}