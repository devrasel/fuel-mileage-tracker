'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Wrench, Calendar, Target } from 'lucide-react';

interface MaintenanceCostStats {
  totalEntries: number;
  totalCost: number;
  averageCost: number;
  categories: { [key: string]: number };
  monthlyCosts: { [key: string]: number };
}

interface Settings {
  currency: string;
  dateFormat: string;
  distanceUnit: string;
  volumeUnit: string;
  entriesPerPage: number;
}

interface MaintenanceCostStatisticsProps {
  stats: MaintenanceCostStats;
  settings: Settings;
}

export default function MaintenanceCostStatistics({
  stats,
  settings
}: MaintenanceCostStatisticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  };

  const getTopCategories = () => {
    return Object.entries(stats.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getRecentMonthlyCosts = () => {
    const months = Object.keys(stats.monthlyCosts).sort().reverse().slice(0, 6);
    return months.map(month => ({
      month,
      cost: stats.monthlyCosts[month]
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Oil Change': 'bg-blue-100 text-blue-800',
      'Tires': 'bg-gray-100 text-gray-800',
      'Brakes': 'bg-red-100 text-red-800',
      'Battery': 'bg-yellow-100 text-yellow-800',
      'Engine': 'bg-purple-100 text-purple-800',
      'Transmission': 'bg-indigo-100 text-indigo-800',
      'Suspension': 'bg-green-100 text-green-800',
      'Exhaust': 'bg-orange-100 text-orange-800',
      'Air Conditioning': 'bg-cyan-100 text-cyan-800',
      'Electrical': 'bg-pink-100 text-pink-800',
      'Body Work': 'bg-rose-100 text-rose-800',
      'Windows': 'bg-sky-100 text-sky-800',
      'Lights': 'bg-amber-100 text-amber-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getMonthlyTrend = () => {
    const months = Object.keys(stats.monthlyCosts).sort();
    if (months.length < 2) return 0;
    
    const recent = stats.monthlyCosts[months[months.length - 1]] || 0;
    const previous = stats.monthlyCosts[months[months.length - 2]] || 0;
    
    if (previous === 0) return 0;
    return ((recent - previous) / previous) * 100;
  };

  const monthlyTrend = getMonthlyTrend();
  const isTrendingUp = monthlyTrend > 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Cost Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-green-800" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{formatCurrency(stats.totalCost)}</div>
          <p className="text-[11px] text-muted-foreground">
            Across all maintenance
          </p>
        </CardContent>
      </Card>

      {/* Average Cost Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs">Average Cost</CardTitle>
          <Target className="h-4 w-4 text-red-800" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{formatCurrency(stats.averageCost)}</div>
          <p className="text-[11px] text-muted-foreground">
            Per maintenance entry
          </p>
        </CardContent>
      </Card>

      {/* Total Entries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs">Total Entries</CardTitle>
          <Wrench className="h-4 w-4 text-orange-800" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{stats.totalEntries}</div>
          <p className="text-[11px] text-muted-foreground">
            Maintenance records
          </p>
        </CardContent>
      </Card>

      {/* Monthly Trend Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs">Monthly Trend</CardTitle>
          <Calendar className="h-4 w-4 text-black-800" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            <div className="text-lg font-bold">
              {monthlyTrend === 0 ? '0%' : `${Math.abs(monthlyTrend).toFixed(1)}%`}
            </div>
            {monthlyTrend !== 0 && (
              isTrendingUp ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isTrendingUp ? 'Increasing' : monthlyTrend < 0 ? 'Decreasing' : 'Stable'}
          </p>
        </CardContent>
      </Card>

      {/* Top Categories Card */}
      {getTopCategories().length > 0 && (
        <Card className="sm:col-span-2 lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs">Top Categories by Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {getTopCategories().map(([category, cost]) => (
                <div key={category} className="space-y-1">
                  <Badge variant="secondary" className={`text-[10px] w-full justify-center ${getCategoryColor(category)}`}>
                    {category}
                  </Badge>
                  <div className="text-center">
                    <div className="text-sm font-medium">{formatCurrency(cost)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {stats.totalCost > 0 ? ((cost / stats.totalCost) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
