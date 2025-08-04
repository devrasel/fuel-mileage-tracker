'use client';

import { useState, useEffect } from 'react';
import { formatDate as formatDateUtil } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Car, FileText } from 'lucide-react';

interface MaintenanceCostEntry {
  id: string;
  date: string;
  description: string;
  cost: number;
  category: string;
  odometer?: number;
  location?: string;
  notes?: string;
  createdAt: string;
  vehicleId: string;
}

interface Settings {
  currency: string;
  dateFormat: string;
  distanceUnit: string;
  volumeUnit: string;
  entriesPerPage: number;
}

interface MaintenanceCostHistoryProps {
  entries: MaintenanceCostEntry[];
  onEntryDeleted: () => void;
  onEntryEdited: (entry: MaintenanceCostEntry) => void;
  settings: Settings;
}

export default function MaintenanceCostHistory({
  entries,
  onEntryDeleted,
  onEntryEdited,
  settings
}: MaintenanceCostHistoryProps) {
  // Add isClient state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const entriesPerPage = settings?.entriesPerPage || 10;
  const totalPages = Math.ceil(entries?.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, entries?.length || 0);
  const paginatedEntries = entries?.slice(startIndex, endIndex) || [];

  const formatDate = (dateString: string) => {
    if (!isClient) return ''; // Don't format dates during SSR
    
    return formatDateUtil(dateString, {
      formatStr: 'MM/dd/yyyy'
    });
  };

  const formatCurrency = (amount: number) => {
    if (!isClient) return ''; // Don't format currency during SSR
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD'
    }).format(amount);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance cost entry?')) {
      return;
    }
    setDeletingId(id);
    try {
      const response = await fetch(`/api/maintenance-cost?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onEntryDeleted();
      } else {
        console.error('Error deleting maintenance cost');
      }
    } catch (error) {
      console.error('Error deleting maintenance cost:', error);
    } finally {
      setDeletingId(null);
    }
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

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-pulse space-y-2 w-full">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No maintenance costs recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs">Maintenance History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {paginatedEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{entry.description}</h3>
                    <Badge variant="secondary" className={`text-[10px] px-2 py-0 h-5 ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(entry.date)}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(entry.cost)}
                    </span>
                    {entry.odometer && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {entry.odometer.toLocaleString()} {settings.distanceUnit}
                      </span>
                    )}
                  </div>

                  {entry.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {entry.location}
                    </div>
                  )}

                  {entry.notes && (
                    <div className="flex items-start gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">{entry.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEntryEdited(entry)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    disabled={deletingId === entry.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {entries?.length || 0} entries
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-6 px-2 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-6 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}