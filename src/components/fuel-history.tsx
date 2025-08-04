'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, MapPin, FileText, Edit, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/date';

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

interface FuelHistoryProps {
  entries: FuelEntry[];
  onEntryDeleted: () => void;
  onEntryEdited: (entry: FuelEntry) => void;
  settings?: any;
}

export default function FuelHistory({ entries, onEntryDeleted, onEntryEdited, settings }: FuelHistoryProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const entriesPerPage = settings?.entriesPerPage || 10;

  // Reset to page 1 when entries per page changes or when entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, entries.length]);

  // Filter out partial entries for main listing, they'll be shown as children
  const mainEntries = entries.filter(entry => !entry.parentEntry);
  
  // Find the first entry (by date)
  const firstEntry = mainEntries.length > 0 ? mainEntries.reduce((prev, current) => 
    new Date(prev.date) < new Date(current.date) ? prev : current
  ) : null;
  
  const totalPages = Math.ceil(mainEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = mainEntries.slice(startIndex, startIndex + entriesPerPage);

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry? This will also delete any associated partial entries.')) {
      return;
    }

    try {
      const response = await fetch(`/api/fuel/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Show success toast
        toast({
          title: "Deleted!",
          description: "Fuel entry deleted successfully.",
          action: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Deleted</span>
            </div>
          ),
        });
        
        onEntryDeleted();
      } else {
        // Show error toast
        toast({
          title: "Error!",
          description: "Failed to delete fuel entry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      // Show error toast
      toast({
        title: "Error!",
        description: "An error occurred while deleting the fuel entry.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDateDisplay = (dateString: string) => {
    return formatDate(dateString, {
      formatStr: 'dd MMM yyyy HH:mm',
      timezone: settings?.timezone
    });
  };


  const formatNumber = (num: number | null | undefined, decimals: number = 1) => {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    return num.toFixed(decimals);
  };

  const getPartialEntriesForEntry = (entryId: string) => {
    return entries.filter(e => e.parentEntry === entryId);
  };

  const getCombinedTotals = (entry: FuelEntry) => {
    const partials = getPartialEntriesForEntry(entry.id);
    const combinedCost = entry.totalCost + partials.reduce((sum, p) => sum + p.totalCost, 0);
    const combinedLiters = entry.liters + partials.reduce((sum, p) => sum + p.liters, 0);
    return { combinedCost, combinedLiters };
  };

  const getEffectiveOdometer = (entry: FuelEntry) => {
    const partials = getPartialEntriesForEntry(entry.id);
    const totalExtraKm = partials.reduce((sum, p) => sum + (p.odometerExtraKm || 0), 0);
    return entry.odometer + totalExtraKm;
  };

  const getDistanceContributedByPartial = (partial: FuelEntry, parentEntry: FuelEntry) => {
    // Calculate the actual distance contributed by this partial entry
    // This is the difference between the partial's odometer and the parent's original odometer
    const distanceContributed = partial.odometer - parentEntry.odometer;
    return distanceContributed > 0 ? distanceContributed : 0;
  };

  const getDistanceCovered = (entry: FuelEntry, prevEntry: FuelEntry | null) => {
    if (!prevEntry) return null; // First entry has no distance
    
    // Get the actual odometer reading for the previous entry, including any updates from partial entries
    let prevEntryOdometer = prevEntry.odometer;
    
    // Check if this previous entry has partial entries that updated its odometer
    const prevEntryPartials = getPartialEntriesForEntry(prevEntry.id);
    if (prevEntryPartials.length > 0) {
      // Calculate the total extra km from all partial entries
      const totalExtraKm = prevEntryPartials.reduce((sum, partial) => {
        return sum + (partial.odometerExtraKm || 0);
      }, 0);
      
      // The effective odometer should be the original + all extra km from partials
      prevEntryOdometer = prevEntry.odometer + totalExtraKm;
    }
    
    const distance = entry.odometer - prevEntryOdometer;
    return distance > 0 ? distance : null;
  };

  const getMileageForEntry = (entry: FuelEntry, prevEntry: FuelEntry | null) => {
    if (!prevEntry || entry.fuelType !== 'FULL') return null;
    
    const distance = getDistanceCovered(entry, prevEntry);
    if (!distance) return null;
    
    // For mileage calculation, we use the fuel from the previous full entry (including its partials)
    // because that fuel was used to cover the distance to the current full entry
    const { combinedLiters } = getCombinedTotals(prevEntry);
    
    if (combinedLiters > 0) {
      return distance / combinedLiters; // km per liter
    }
    return null;
  };

  const isFirstEntry = (entry: FuelEntry) => {
    return entry.id === firstEntry?.id;
  };

  if (mainEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fuel Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No fuel entries yet. Add your first entry above!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Fuel Log
          <Badge variant="secondary">{mainEntries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {paginatedEntries.map((entry, index) => {
              const partialEntries = getPartialEntriesForEntry(entry.id);
              const hasPartials = partialEntries.length > 0;
              const isExpanded = expandedEntries.has(entry.id);
              
              // Find the next chronological entry (not just the next in paginated list)
              const nextEntry = mainEntries.find(e => 
                e.id !== entry.id && new Date(e.date) > new Date(entry.date)
              );
              
              // Find the previous chronological entry for distance calculation
              const prevEntry = mainEntries.find(e => 
                e.id !== entry.id && new Date(e.date) < new Date(entry.date)
              );
              
              // Find the previous FULL entry for mileage calculation (this is the correct one for distance/mileage)
              const prevFullEntry = mainEntries
                .filter(e => e.id !== entry.id && e.fuelType === 'FULL' && new Date(e.date) < new Date(entry.date))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              
              return (
                <div key={entry.id} className="space-y-1 sm:space-y-2">
                  <div
                    className={`border rounded-lg p-1.5 sm:p-3 space-y-1.5 sm:space-y-3 hover:bg-muted/50 transition-colors ${
                      entry.fuelType === 'PARTIAL' ? 'ml-1 sm:ml-2 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                          <span className="font-medium text-xs sm:text-sm">{formatDateDisplay(entry.date)}</span>
                          <Badge variant={entry.fuelType === 'FULL' ? 'default' : 'secondary'} className="text-xs">
                            {entry.fuelType}
                          </Badge>
                          {entry.location && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-2 w-2 mr-1" />
                              {entry.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        {hasPartials && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(entry.id)}
                            className="text-blue-500 h-6 w-6 sm:h-8 sm:w-auto p-0.5 sm:p-1 text-xs"
                          >
                            <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'Show'} ({partialEntries.length})</span>
                            <span className="sm:hidden">{isExpanded ? 'H' : 'S'} ({partialEntries.length})</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEntryEdited(entry)}
                          className="text-blue-500 h-6 w-6 sm:h-8 sm:w-auto p-0.5 sm:p-1"
                        >
                          <Edit className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 sm:h-8 sm:w-auto p-0.5 sm:p-1"
                        >
                          <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-xs sm:text-sm">
                      <div className="min-w-0">
                        <div className="text-muted-foreground text-xs">
                          Total Cost
                          {hasPartials && (
                            <span className="text-xs text-blue-600 ml-1">
                              (+{partialEntries.length})
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-xs truncate">
                          {formatCurrency(entry.totalCost, settings)}
                          {hasPartials && (
                            <span className="text-xs text-blue-600 ml-1">
                              → {formatCurrency(getCombinedTotals(entry).combinedCost, settings)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-muted-foreground text-xs">Cost/L</div>
                        <div className="font-medium text-xs truncate">{formatCurrency(entry.costPerLiter, settings)}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-muted-foreground text-xs">
                          Liters
                          {hasPartials && (
                            <span className="text-xs text-blue-600 ml-1">
                              (+{partialEntries.length})
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-xs truncate">
                          {formatNumber(entry.liters, 2)} {settings?.volumeUnit || 'L'}
                          {hasPartials && (
                            <span className="text-xs text-blue-600 ml-1">
                              → {formatNumber(getCombinedTotals(entry).combinedLiters, 2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-muted-foreground text-xs">Odometer</div>
                        <div className="font-medium text-xs truncate font-semibold text-blue-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="inline-block h-4 w-4 mr-1"
                          >
                            <path d="M9 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                            <path d="M21 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                            <path d="M3 17h18M5 7l1 5h12l1-5" />
                          </svg>
                          {formatNumber(entry.odometer, 1)} {settings?.distanceUnit || 'km'}
                          {hasPartials && partialEntries.some(p => p.odometerExtraKm && p.odometerExtraKm > 0) && (
                            <span className="text-xs text-purple-600 ml-1">
                              → {formatNumber(getEffectiveOdometer(entry), 1)} {settings?.distanceUnit || 'km'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Mileage Display with Distance Covered */}
                    {entry.fuelType === 'FULL' && prevFullEntry && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-1.5 sm:p-3 space-y-1.5 sm:space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-purple-600" />
                            <div className="text-sm font-medium text-purple-800">
                              Distance Covered
                            </div>
                            <div className="font-bold text-green-700 text-sm">
                              {getDistanceCovered(entry, prevFullEntry) ? `${formatNumber(getDistanceCovered(entry, prevFullEntry)!, 1)} ${settings?.distanceUnit || 'km'}` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="icons">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-gauge h-4 w-4 text-purple-600">
                                <path d="m12 14 4-4"></path>
                                <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                </svg>
                            </div>
                            <div className="text-sm font-medium text-purple-800">
                              Mileage
                              {hasPartials && (
                                <span className="text-xs text-blue-600 ml-1">
                                  (incl. partials)
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-purple-800 text-sm">
                              
                              {getMileageForEntry(entry, prevFullEntry)
                                ? `${formatNumber(getMileageForEntry(entry, prevFullEntry)!, 2)} km/L`
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                        {getMileageForEntry(entry, prevFullEntry) && (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-purple-600">
                              Efficiency: {getMileageForEntry(entry, prevFullEntry)! >= 40 ? "Excellent!" : 
                                         getMileageForEntry(entry, prevFullEntry)! >= 30 ? "Good" : "Needs Improvement"}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              📊 {getDistanceCovered(entry, prevFullEntry) ? `${formatNumber(getDistanceCovered(entry, prevFullEntry)!, 1)} ${settings?.distanceUnit || 'km'} traveled` : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {entry.fuelType === 'PARTIAL' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-1">
                        <div className="text-center">
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">Partial Fill-up</Badge>
                        </div>
                      </div>
                    )}
                    
                    {entry.notes && (
                      <div className="flex items-start gap-1 text-xs">
                        <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{entry.notes}</span>
                      </div>
                    )}
                    
                    {firstEntry && entry.id === firstEntry.id && (
                      <div className="flex items-start gap-1 text-xs">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          🎯 First Entry
                        </Badge>
                        <span className="text-muted-foreground">Baseline for calculations</span>
                      </div>
                    )}
                  </div>

                  {/* Partial Entries */}
                  {isExpanded && hasPartials && (
                    <div className="ml-2 sm:ml-6 space-y-1">
                      <div className="text-xs font-medium text-blue-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Partial Fuel Entries
                      </div>
                      {partialEntries.map((partial) => (
                        <div
                          key={partial.id}
                          className="border border-blue-200 rounded-lg p-1.5 sm:p-2 bg-blue-50/50 space-y-1"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">{formatDateDisplay(partial.date)}</span>
                                <Badge variant="outline" className="text-xs bg-blue-100">
                                  PARTIAL
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Odometer: {formatNumber(partial.odometer, 1)} {settings?.distanceUnit || 'km'}
                              </div>
                              {partial.odometerExtraKm && partial.odometerExtraKm > 0 && (
                                <div className="text-xs text-purple-600 font-medium">
                                  📏 Extra km Added: {formatNumber(partial.odometerExtraKm, 1)} {settings?.distanceUnit || 'km'}
                                </div>
                              )}
                              <div className="text-xs text-green-600 font-medium">
                                <Route className="h-3 w-3 inline mr-1" />
                                Distance Contributed: {
                                  getDistanceContributedByPartial(partial, entry) > 0 ? 
                                    `${formatNumber(getDistanceContributedByPartial(partial, entry), 1)} ${settings?.distanceUnit || 'km'}` : 
                                    partial.odometerExtraKm && partial.odometerExtraKm > 0 ? 
                                      `${formatNumber(partial.odometerExtraKm, 1)} ${settings?.distanceUnit || 'km'} (manual)` : 
                                      'N/A (No distance specified)'
                                }
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEntryEdited(partial)}
                                className="text-blue-500 h-5 w-5 p-0.5"
                              >
                                <Edit className="h-2 w-2" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEntry(partial.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-5 w-5 p-0.5"
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div>
                              <div className="text-muted-foreground">Cost</div>
                              <div className="font-medium">{formatCurrency(partial.totalCost, settings)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Price/L</div>
                              <div className="font-medium">{formatCurrency(partial.costPerLiter, settings)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Liters</div>
                              <div className="font-medium">{formatNumber(partial.liters, 2)} {settings?.volumeUnit || 'L'}</div>
                            </div>
                          </div>
                          
                          {partial.notes && (
                            <div className="flex items-start gap-1 text-xs">
                              <FileText className="h-2 w-2 text-muted-foreground mt-0.5" />
                              <span className="text-muted-foreground">{partial.notes}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + entriesPerPage, mainEntries.length)} of {mainEntries.length} entries
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
        )}
      </CardContent>
    </Card>
  );
}