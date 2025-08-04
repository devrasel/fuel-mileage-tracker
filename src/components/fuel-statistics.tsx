'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fuel, DollarSign, Route, Gauge, TrendingUp, Zap, Target, Award, TrendingDown, BarChart3 } from 'lucide-react';

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

interface FuelStatisticsProps {
  stats: FuelStats;
}

export default function FuelStatistics({ stats }: FuelStatisticsProps) {
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

  const formatNumber = (num: number | null | undefined, decimals: number = 1) => {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    return num.toFixed(decimals);
  };

  const formatConsumption = (consumption: number | null | undefined) => {
    if (consumption === null || consumption === undefined || isNaN(consumption) || !isFinite(consumption) || consumption <= 0) {
      return 'N/A';
    }
    return `${formatNumber(consumption, 1)} L/100km`;
  };

  const formatMileage = (mileage: number | null | undefined) => {
    if (mileage === null || mileage === undefined || isNaN(mileage) || !isFinite(mileage) || mileage <= 0) {
      return 'N/A';
    }
    return `${formatNumber(mileage, 2)} km/L`;
  };

  const getConsumptionColor = (consumption: number | null | undefined) => {
    if (consumption === null || consumption === undefined || isNaN(consumption) || !isFinite(consumption)) {
      return 'text-muted-foreground';
    }
    if (consumption < 6) return 'text-green-600';
    if (consumption < 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMileageColor = (mileage: number | null | undefined) => {
    if (mileage === null || mileage === undefined || isNaN(mileage) || !isFinite(mileage)) {
      return 'text-muted-foreground';
    }
    if (mileage >= 40) return 'text-green-600';
    if (mileage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (stats.totalEntries === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Add fuel entries to see statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Entries</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold">{stats.totalEntries}</div>
          <p className="text-[11px] text-muted-foreground">
            Fuel entries recorded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold">{formatCurrency(stats.totalCost)}</div>
          <p className="text-[11px] text-muted-foreground">
            Total fuel expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Distance</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold">{formatNumber(stats.totalDistance, 0)} km</div>
          <p className="text-[11px] text-muted-foreground">
            Distance traveled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Fuel</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold">{formatNumber(stats.totalLiters, 1)} L</div>
          <p className="text-[11px] text-muted-foreground">
            Total fuel consumed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Avg Cost/Liter</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold">{formatCurrency(stats.averageCostPerLiter)}</div>
          <p className="text-[11px] text-muted-foreground">
            Average fuel price
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Avg Consumption</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg font-bold ${getConsumptionColor(stats.averageConsumption)}`}>
            {formatConsumption(stats.averageConsumption)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Average fuel consumption
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Mileage per Liter</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-lg font-bold ${getMileageColor(stats.mileagePerLiter)}`}>
            {formatMileage(stats.mileagePerLiter)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Distance covered per liter
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Best Consumption</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold text-green-600">
            {formatConsumption(stats.bestConsumption)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Most efficient
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Worst Consumption</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold text-red-600">
            {formatConsumption(stats.worstConsumption)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Least efficient
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Efficiency</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={stats.mileagePerLiter >= 40 ? "default" : stats.mileagePerLiter >= 30 ? "secondary" : "destructive"}>
              {stats.mileagePerLiter >= 40 ? "Excellent" : 
               stats.mileagePerLiter >= 30 ? "Medium" : "Low"}
            </Badge>
          </div>
          <div className="text-xs">
            {stats.mileagePerLiter >= 40 && "Excellent mileage efficiency!"}
            {stats.mileagePerLiter >= 30 && stats.mileagePerLiter < 40 && "Medium mileage efficiency"}
            {stats.mileagePerLiter < 30 && "Low mileage efficiency - consider improving"}
            {stats.mileagePerLiter === 0 && "Add more fuel entries to see efficiency analysis"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}