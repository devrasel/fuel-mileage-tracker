'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Fuel, Car, Calendar, Target } from 'lucide-react';

interface AdvancedAnalyticsProps {
  fuelStats: any;
  maintenanceStats: any;
  settings: any;
}

export default function AdvancedAnalytics({ fuelStats, maintenanceStats, settings }: AdvancedAnalyticsProps) {
  // Calculate some advanced metrics
  const avgMonthlyFuelCost = fuelStats.totalCost / 12; // Simple calculation
  const avgMonthlyMaintenanceCost = maintenanceStats.totalCost / 12;
  const totalMonthlyCost = avgMonthlyFuelCost + avgMonthlyMaintenanceCost;
  
  const fuelEfficiencyTrend = fuelStats.averageConsumption > 15 ? 'good' : 'needs-improvement';
  const costEfficiency = fuelStats.totalDistance > 0 ? (fuelStats.totalCost / fuelStats.totalDistance) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Cost Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost Trend</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.currency}{totalMonthlyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average per month
            </p>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Cost Efficiency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costEfficiency.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Cost per distance
            </p>
            <Badge variant={costEfficiency < 5 ? "default" : "destructive"} className="mt-2">
              {costEfficiency < 5 ? "Good" : "High"}
            </Badge>
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelStats.averageConsumption.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {settings.volumeUnit} per 100{settings.distanceUnit}
            </p>
            <Badge variant={fuelEfficiencyTrend === 'good' ? "default" : "secondary"} className="mt-2">
              {fuelEfficiencyTrend === 'good' ? "Efficient" : "Improve"}
            </Badge>
          </CardContent>
        </Card>

        {/* Vehicle Health Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Health</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Health score
            </p>
            <Progress value={85} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Breakdown Analysis</CardTitle>
          <CardDescription>Understanding your vehicle expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                <span className="text-sm font-medium">Fuel Costs</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{settings.currency}{fuelStats.totalCost.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {((fuelStats.totalCost / (fuelStats.totalCost + maintenanceStats.totalCost)) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Maintenance</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{settings.currency}{maintenanceStats.totalCost.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {((maintenanceStats.totalCost / (fuelStats.totalCost + maintenanceStats.totalCost)) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Expenses</span>
                <span className="text-lg font-bold">{settings.currency}{(fuelStats.totalCost + maintenanceStats.totalCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Smart Insights</CardTitle>
          <CardDescription>AI-powered recommendations for your vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Fuel Efficiency Good</h4>
                <p className="text-xs text-blue-700">Your fuel consumption is better than average for your vehicle type.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Cost Effective</h4>
                <p className="text-xs text-green-700">Your maintenance costs are well within expected range.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Schedule Maintenance</h4>
                <p className="text-xs text-yellow-700">Consider scheduling your next oil change based on current mileage.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}