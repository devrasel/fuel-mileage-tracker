'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Fuel, DollarSign, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface FuelEntry {
  id: string;
  date: string;
  odometer: number;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  fuelType: 'FULL' | 'PARTIAL';
  location?: string;
  notes?: string;
  createdAt: string;
  parentEntry?: string;
  partials?: FuelEntry[];
  odometerExtraKm?: number;
}

interface FuelMonthlyStatsProps {
  entries: FuelEntry[];
  settings?: any;
}

interface MonthlyData {
  month: string;
  year: number;
  totalEntries: number;
  totalCost: number;
  totalLiters: number;
  totalDistance: number;
  averageCostPerLiter: number;
  averageConsumption: number;
  bestMileage: number;
  worstMileage: number;
  averageMileage: number;
}

export default function FuelMonthlyStats({ entries, settings }: FuelMonthlyStatsProps) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 3;

  // Get available years and months from entries
  const { availableYears, availableMonths } = useMemo(() => {
    const years = new Set<string>();
    const monthsByYear: { [key: string]: Set<string> } = {};

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const year = date.getFullYear().toString();
      const month = date.getMonth().toString();
      
      years.add(year);
      if (!monthsByYear[year]) {
        monthsByYear[year] = new Set();
      }
      monthsByYear[year].add(month);
    });

    return {
      availableYears: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
      availableMonths: monthsByYear[selectedYear] ? Array.from(monthsByYear[selectedYear]).sort((a, b) => parseInt(a) - parseInt(b)) : []
    };
  }, [entries, selectedYear]);

  // Calculate monthly statistics
  const monthlyData = useMemo(() => {
    const year = parseInt(selectedYear);

    // Get all entries for the selected year, sorted by date
    const yearEntries = entries
      .filter(entry => new Date(entry.date).getFullYear() === year)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the last full entry from the previous year
    const lastEntryOfPrevYear = entries
      .filter(entry => new Date(entry.date).getFullYear() === year - 1 && entry.fuelType === 'FULL')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      [0];

    const allEntriesForCalc = lastEntryOfPrevYear ? [lastEntryOfPrevYear, ...yearEntries] : yearEntries;

    const data: { [key: string]: MonthlyData } = {};
    let lastFullEntry: FuelEntry | null = null;
    let accumulatedFuel = 0;

    allEntriesForCalc.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (date.getFullYear() === year) {
        if (!data[monthKey]) {
          data[monthKey] = {
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
            totalEntries: 0,
            totalCost: 0,
            totalLiters: 0,
            totalDistance: 0,
            averageCostPerLiter: 0,
            averageConsumption: 0,
            bestMileage: 0,
            worstMileage: 0,
            averageMileage: 0,
          };
        }
        const monthData = data[monthKey];
        monthData.totalEntries++;
        monthData.totalCost += entry.totalCost;
        monthData.totalLiters += entry.liters;
      }

      if (entry.fuelType === 'FULL') {
        if (lastFullEntry) {
          const distance = entry.odometer - lastFullEntry.odometer;
          if (distance > 0) {
            const fuelConsumed = accumulatedFuel + entry.liters;
            const mileage = distance / fuelConsumed;
            
            if (date.getFullYear() === year) {
              const monthData = data[monthKey];
              monthData.totalDistance += distance;
              if (monthData.averageMileage === 0) {
                monthData.averageMileage = mileage;
                monthData.bestMileage = mileage;
                monthData.worstMileage = mileage;
              } else {
                // This is a simplified average, a more accurate one would be weighted
                monthData.averageMileage = (monthData.averageMileage * (monthData.totalEntries - 1) + mileage) / monthData.totalEntries;
                monthData.bestMileage = Math.max(monthData.bestMileage, mileage);
                monthData.worstMileage = Math.min(monthData.worstMileage, mileage);
              }
            }
          }
        }
        lastFullEntry = entry;
        accumulatedFuel = 0;
      } else {
        accumulatedFuel += entry.liters;
      }
    });
    
    Object.values(data).forEach(monthData => {
        monthData.averageConsumption = monthData.totalDistance > 0 && monthData.totalLiters > 0 ? (monthData.totalLiters / monthData.totalDistance) * 100 : 0;
        monthData.averageCostPerLiter = monthData.totalLiters > 0 ? monthData.totalCost / monthData.totalLiters : 0;
    });

    const result = Object.values(data).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const monthA = monthNames.indexOf(a.month);
      const monthB = monthNames.indexOf(b.month);
      return monthB - monthA;
    });

    if (selectedMonth === 'all') {
      return result;
    } else {
      return result.filter(m => m.month === monthNames[parseInt(selectedMonth)]);
    }
  }, [entries, selectedYear, selectedMonth]);

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) return null;
    
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Monthly Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No fuel entries yet. Add your first entry to see monthly statistics!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Filter by Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="space-y-2">
              <label className="text-xs font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {monthNames[parseInt(month)]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics Cards with Pagination */}
      <div className="space-y-4">
        {(() => {
          const totalPages = Math.ceil(monthlyData.length / entriesPerPage);
          const startIndex = (currentPage - 1) * entriesPerPage;
          const paginatedData = monthlyData.slice(startIndex, startIndex + entriesPerPage);

          return (
            <>
              {paginatedData.map((monthData, index) => {
                const originalIndex = startIndex + index;
                const previousMonthData = monthlyData[originalIndex + 1];
                
                return (
                  <Card key={`${monthData.year}-${monthData.month}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{monthData.month} {monthData.year}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {monthData.totalEntries} entries
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Cost Statistics  */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-medium">Cost Analysis</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Total Cost</div>
                              <div className="text-sm font-semibold">
                                {formatCurrency(monthData.totalCost, settings)}
                                {getTrendIcon(monthData.totalCost, previousMonthData?.totalCost || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Avg Cost/Liter</div>
                              <div className="text-xs font-medium">
                                {formatCurrency(monthData.averageCostPerLiter, settings)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fuel Statistics */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Fuel className="h-3 w-3 text-blue-600" />
                            <span className="text-sm font-medium">Fuel Analysis</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Total Fuel</div>
                              <div className="text-sm font-semibold">
                                {formatNumber(monthData.totalLiters, 1)} {settings?.volumeUnit || 'L'}
                                {getTrendIcon(monthData.totalLiters, previousMonthData?.totalLiters || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Avg Consumption</div>
                              <div className="text-xs font-medium">
                                {formatNumber(monthData.averageConsumption, 1)} L/100km
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Distance Statistics */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-3 w-3 text-purple-600" />
                            <span className="text-sm font-medium">Distance Analysis</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Total Distance</div>
                              <div className="text-sm font-semibold">
                                {formatNumber(monthData.totalDistance, 0)} {settings?.distanceUnit || 'km'}
                                {getTrendIcon(monthData.totalDistance, previousMonthData?.totalDistance || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Entries</div>
                              <div className="text-xs font-medium">
                                {monthData.totalEntries}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mileage Statistics */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-orange-600" />
                            <span className="text-sm font-medium">Mileage Analysis</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Average Mileage</div>
                              <div className="text-sm font-semibold">
                                {formatNumber(monthData.averageMileage, 2)} km/L
                                {getTrendIcon(monthData.averageMileage, previousMonthData?.averageMileage || 0)}
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">Best</div>
                                <div className="text-xs font-medium text-green-600">
                                  {formatNumber(monthData.bestMileage, 2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Worst</div>
                                <div className="text-xs font-medium text-red-600">
                                  {formatNumber(monthData.worstMileage, 2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <div className="text-xs text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + entriesPerPage, monthlyData.length)} of {monthlyData.length} months
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Prev</span>
                        </Button>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: totalPages }, (_, i) => {
                            const page = i + 1;
                            // Show current page, first page, last page, and pages adjacent to current page
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs"
                                >
                                  {page}
                                </Button>
                              );
                            }
                            // Show ellipsis for gaps
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="text-muted-foreground px-0.5 text-xs">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {monthlyData.length === 0 && (
                <Card>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      No fuel entries found for the selected period.
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
