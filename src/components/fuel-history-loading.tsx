'use client';

import { Fuel, Route, BarChart3 } from 'lucide-react';

export default function FuelHistoryLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 sm:space-y-6">
        {/* Animated Fuel Icon */}
        <div className="relative inline-block">
          <div className="animate-pulse">
            <Fuel className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto" />
          </div>
          {/* Animated drops */}
          <div className="absolute -top-1 -right-1">
            <div className="animate-bounce">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="absolute -bottom-1 -left-1">
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading Text with Animation */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground animate-pulse">
            Loading Fuel History...
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please wait while we fetch your fuel entries
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="max-w-xs sm:max-w-sm mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-blue-500 to-green-500 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Animated Stats Preview */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-sm mx-auto mt-6 sm:mt-8">
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg animate-pulse">
            <Route className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mx-auto mb-1" />
            <div className="h-2 w-8 bg-muted-foreground/20 rounded mx-auto mb-1"></div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }}>
            <Fuel className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto mb-1" />
            <div className="h-2 w-6 bg-muted-foreground/20 rounded mx-auto mb-1"></div>
            <div className="text-xs text-muted-foreground">Fuel</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}>
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mx-auto mb-1" />
            <div className="h-2 w-10 bg-muted-foreground/20 rounded mx-auto mb-1"></div>
            <div className="text-xs text-muted-foreground">Stats</div>
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
