'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Calendar, Fuel, Wrench, Target, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency as formatCurrencyUtil } from '@/utils/currency';

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

interface MaintenanceCostStats {
  totalEntries: number;
  totalCost: number;
  averageCost: number;
  categories: { [key: string]: number };
  monthlyCosts: { [key: string]: number };
}

interface CombinedAnalyticsProps {
  fuelStats: FuelStats;
  maintenanceStats: MaintenanceCostStats;
  settings?: any;
}

export default function CombinedAnalytics({ fuelStats, maintenanceStats, settings }: CombinedAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, settings);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const getEfficiencyRating = (mileage: number) => {
    if (mileage >= 40) return { rating: 'Excellent', color: 'text-green-600', icon: '🏆' };
    if (mileage >= 30) return { rating: 'Good', color: 'text-blue-600', icon: '👍' };
    if (mileage >= 20) return { rating: 'Average', color: 'text-yellow-600', icon: '👌' };
    return { rating: 'Needs Improvement', color: 'text-red-600', icon: '⚠️' };
  };

  const getCostEfficiency = () => {
    if (fuelStats.totalDistance > 0 && fuelStats.totalCost > 0) {
      const costPerKm = fuelStats.totalCost / fuelStats.totalDistance;
      return costPerKm;
    }
    return 0;
  };

  const getTotalVehicleCost = () => {
    return fuelStats.totalCost + maintenanceStats.totalCost;
  };

  const getMaintenanceCostPercentage = () => {
    const totalCost = getTotalVehicleCost();
    if (totalCost > 0) {
      return (maintenanceStats.totalCost / totalCost) * 100;
    }
    return 0;
  };

  const efficiencyRating = getEfficiencyRating(fuelStats.mileagePerLiter);
  const costEfficiency = getCostEfficiency();
  const totalVehicleCost = getTotalVehicleCost();
  const maintenancePercentage = getMaintenanceCostPercentage();

  // Get top maintenance categories
  const topCategories = Object.entries(maintenanceStats.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Comprehensive Analytics
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Complete overview of your vehicle's performance and costs
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-black">Total Distance</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {formatNumber(fuelStats.totalDistance, 0)} {settings?.distanceUnit || 'km'}
                </p>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-black">Total Cost</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {formatCurrency(totalVehicleCost)}
                </p>
              </div>
              <Fuel className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-black">Average Mileage</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600">
                  {formatNumber(fuelStats.mileagePerLiter, 2)} km/L
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-black">Cost per km</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600">
                  {formatCurrency(costEfficiency)}
                </p>
              </div>
              <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Fuel className="h-4 w-4 sm:h-5 sm:w-5" />
            Fuel Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fuel Entries</span>
                <Badge variant="outline">{fuelStats.totalEntries}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Fuel Cost</span>
                <span className="font-medium">{formatCurrency(fuelStats.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Liters</span>
                <span className="font-medium">{formatNumber(fuelStats.totalLiters, 2)} L</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Cost/L</span>
                <span className="font-medium">{formatCurrency(fuelStats.averageCostPerLiter)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Consumption</span>
                <span className="font-medium text-green-600">{formatNumber(fuelStats.bestConsumption, 1)} L/100km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Worst Consumption</span>
                <span className="font-medium text-red-600">{formatNumber(fuelStats.worstConsumption, 1)} L/100km</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Efficiency Rating</span>
                <span className={`font-medium ${efficiencyRating.color}`}>
                  {efficiencyRating.icon} {efficiencyRating.rating}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Consumption</span>
                <span className="font-medium">{formatNumber(fuelStats.averageConsumption, 1)} L/100km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fuel Efficiency</span>
                <span className="font-medium">{formatNumber(fuelStats.mileagePerLiter, 2)} km/L</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fuel Costs</span>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(fuelStats.totalCost)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((fuelStats.totalCost / totalVehicleCost) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance Costs</span>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(maintenanceStats.totalCost)}</div>
                    <div className="text-xs text-muted-foreground">
                      {maintenancePercentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-sm">Total Vehicle Cost</span>
                    <span>{formatCurrency(totalVehicleCost)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Top Maintenance Categories</h4>
              <div className="space-y-2">
                {topCategories.map(([category, cost]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <div className="text-right">
                      <div className="font-medium text-sm">{formatCurrency(cost)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((cost / maintenanceStats.totalCost) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {topCategories.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No maintenance records yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Efficiency Indicators
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Your vehicle achieves {formatNumber(fuelStats.mileagePerLiter, 2)} km/L on average
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    Best efficiency: {formatNumber(fuelStats.bestConsumption, 1)} L/100km
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Cost per km: {formatCurrency(costEfficiency)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm sm:text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Cost Management
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Maintenance represents {maintenancePercentage.toFixed(1)}% of total costs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">
                    Average maintenance cost: {formatCurrency(maintenanceStats.averageCost)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Total {maintenanceStats.totalEntries} maintenance entries
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
