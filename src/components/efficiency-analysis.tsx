'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, TrendingDown, Target, Zap, Award, AlertTriangle } from 'lucide-react';

interface FuelStats {
  totalEntries: number;
  totalCost: number;
  totalLiters: number;
  totalDistance: number;
  averageCostPerLiter: number;
  averageConsumption: number;
  bestConsumption: number;
  worstConsumption: number;
  mileagePerLiter: number;
  totalMileage: number;
}

interface EfficiencyAnalysisProps {
  fuelStats: FuelStats;
  settings?: any;
}

export default function EfficiencyAnalysis({ fuelStats, settings }: EfficiencyAnalysisProps) {
  const formatNumber = (num: number | null | undefined, decimals: number = 1) => {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    return num.toFixed(decimals);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
      return '৳0.00';
    }
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getEfficiencyRating = (mileage: number) => {
    if (mileage >= 15) return { rating: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', progress: 90 };
    if (mileage >= 12) return { rating: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50', progress: 70 };
    if (mileage >= 8) return { rating: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-50', progress: 50 };
    return { rating: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50', progress: 30 };
  };

  const getConsumptionTrend = () => {
    if (fuelStats.bestConsumption === 0 || fuelStats.worstConsumption === 0) return null;
    const improvement = ((fuelStats.worstConsumption - fuelStats.bestConsumption) / fuelStats.worstConsumption) * 100;
    return improvement;
  };

  const getCostEfficiency = () => {
    if (fuelStats.totalDistance === 0 || fuelStats.totalCost === 0) return 0;
    return fuelStats.totalDistance / fuelStats.totalCost; // km per taka
  };

  const efficiency = getEfficiencyRating(fuelStats.mileagePerLiter);
  const trend = getConsumptionTrend();
  const costEfficiency = getCostEfficiency();

  if (fuelStats.totalEntries === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fuel Efficiency Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Add fuel entries to see efficiency analysis</p>
              <p className="text-sm">Track your vehicle's performance over time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Performance metrics will appear here</p>
              <p className="text-sm">Detailed mileage analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Efficiency Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Overall Efficiency Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="outline" className={`${efficiency.color} ${efficiency.bgColor} border-current`}>
                {efficiency.rating}
              </Badge>
              <p className="text-2xl font-bold mt-2">{formatNumber(fuelStats.mileagePerLiter, 2)} km/L</p>
              <p className="text-sm text-muted-foreground">Average mileage</p>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 relative">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${efficiency.progress}, 100`}
                    className={efficiency.color}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold">{efficiency.progress}%</span>
                </div>
              </div>
            </div>
          </div>
          <Progress value={efficiency.progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fuel Efficiency Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Efficiency Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Performance</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatNumber(100 / fuelStats.bestConsumption, 2)} km/L
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Worst Performance</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatNumber(100 / fuelStats.worstConsumption, 2)} km/L
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>

            {trend && trend > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {formatNumber(trend, 1)}% improvement potential
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your best vs worst performance shows room for improvement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost Efficiency</span>
                <span className="font-medium">
                  {formatNumber(costEfficiency, 2)} km/৳
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Distance</span>
                <span className="font-medium">
                  {formatNumber(fuelStats.totalDistance, 0)} km
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fuel Used</span>
                <span className="font-medium">
                  {formatNumber(fuelStats.totalLiters, 1)} L
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Cost/Liter</span>
                <span className="font-medium">
                  {formatCurrency(fuelStats.averageCostPerLiter)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Efficiency Score: {Math.round((fuelStats.mileagePerLiter / 20) * 100)}%
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Based on average vehicle performance standards
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Efficiency Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">To Improve Mileage:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maintain steady speeds (50-80 km/h)</li>
                <li>• Keep tires properly inflated</li>
                <li>• Regular engine maintenance</li>
                <li>• Remove excess weight from vehicle</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Cost Optimization:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Plan routes to avoid traffic</li>
                <li>• Compare fuel prices at different stations</li>
                <li>• Consider carpooling for regular trips</li>
                <li>• Use air conditioning efficiently</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}