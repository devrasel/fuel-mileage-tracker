'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, Settings, ChevronDown } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface VehicleSelectorProps {
  selectedVehicleId: string | null;
  onVehicleChange: (vehicleId: string | null) => void;
  onManageVehicles: () => void;
}

export default function VehicleSelector({
  selectedVehicleId,
  onVehicleChange,
  onManageVehicles
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical' | 'custom'>('custom');

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vehicle');
      if (response.ok) {
        const data = await response.json();
        
        // Sort vehicles based on sortOrder
        const sortedVehicles = sortVehicles(data, sortOrder);
        setVehicles(sortedVehicles);
        
        // Auto-select first vehicle if none is selected
        if (!selectedVehicleId && sortedVehicles.length > 0) {
          onVehicleChange(sortedVehicles[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort vehicles based on the selected sort order
  const sortVehicles = (vehiclesToSort: Vehicle[], order: 'newest' | 'oldest' | 'alphabetical' | 'custom') => {
    const sorted = [...vehiclesToSort];
    
    switch (order) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'custom':
        return sorted.sort((a, b) => a.displayOrder - b.displayOrder);
      default:
        return sorted;
    }
  };
  
  // Re-sort vehicles when sort order changes
  useEffect(() => {
    if (vehicles.length > 0) {
      setVehicles(sortVehicles([...vehicles], sortOrder));
    }
  }, [sortOrder]);
  
  useEffect(() => {
    fetchVehicles();
  }, []);

  const getVehicleDisplayInfo = (vehicle: Vehicle) => {
    const nameParts = [vehicle.name];
    if (vehicle.make) nameParts.push(vehicle.make);
    if (vehicle.model) nameParts.push(vehicle.model);
    
    // Only include color for extra info, removing license and year
    const extraInfo: string[] = [];
    if (vehicle.color) extraInfo.push(vehicle.color);
    
    return {
      name: nameParts.join(' '),
      extra: extraInfo.length > 0 ? extraInfo.join(' • ') : null,
      color: vehicle.color
    };
  };

  const getSelectedVehicleDisplay = () => {
    if (!selectedVehicleId) return null;
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return null;
    
    const displayInfo = getVehicleDisplayInfo(vehicle);
    return displayInfo;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Loading vehicles...</span>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Car className="h-4 w-4" />
          <span className="text-sm font-medium">No vehicles added</span>
        </div>
        <Button 
          onClick={onManageVehicles}
          className="flex items-center gap-1 h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          size="sm"
        >
          <Plus className="h-3 w-3" />
          <span className="text-xs font-medium">Add Vehicle</span>
        </Button>
      </div>
    );
  }

  const selectedDisplay = getSelectedVehicleDisplay();

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Car className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        
        <div className="flex-1 min-w-0">
          <Select 
            value={selectedVehicleId || ''} 
            onValueChange={onVehicleChange}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger className="w-full h-9 border-0 bg-transparent shadow-none px-2 py-1 focus:ring-0 hover:bg-transparent">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  {selectedDisplay ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {selectedDisplay.name}
                      </span>
                      {selectedDisplay.color && (
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: selectedDisplay.color }}
                          title={selectedDisplay.color}
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Select vehicle</span>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </SelectTrigger>
            <SelectContent className="min-w-[280px] max-w-[400px]">
              {vehicles.map(vehicle => {
                const displayInfo = getVehicleDisplayInfo(vehicle);
                const isSelected = vehicle.id === selectedVehicleId;
                return (
                  <SelectItem 
                    key={vehicle.id} 
                    value={vehicle.id}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-medium text-sm truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {displayInfo.name}
                        </span>
                        {displayInfo.color && (
                          <div 
                            className="w-2 h-2 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                            style={{ backgroundColor: displayInfo.color }}
                            title={displayInfo.color}
                          />
                        )}
                        {!vehicle.isActive && (
                          <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nextOrder = sortOrder === 'newest'
                ? 'oldest'
                : sortOrder === 'oldest'
                  ? 'alphabetical'
                  : sortOrder === 'alphabetical'
                    ? 'custom'
                    : 'newest';
              setSortOrder(nextOrder);
            }}
            className="flex items-center gap-2 h-8 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            title={`Current order: ${sortOrder}. Click to change.`}
          >
            {sortOrder === 'newest' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
                <path d="M12 12v6"></path>
                <path d="m15 15-3-3-3 3"></path>
              </svg>
            )}
            {sortOrder === 'oldest' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
                <path d="M12 12v6"></path>
                <path d="m9 15 3 3 3-3"></path>
              </svg>
            )}
            {sortOrder === 'alphabetical' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 18h18"></path>
                <path d="M3 12h18"></path>
                <path d="M3 6h18"></path>
              </svg>
            )}
            {sortOrder === 'custom' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M4 10h16"></path>
                <path d="M4 14h16"></path>
                <path d="M9 18l3 3 3-3"></path>
                <path d="M9 6l3-3 3 3"></path>
              </svg>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageVehicles}
            className="flex items-center gap-2 h-8 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Manage</span>
          </Button>
        </div>
      </div>
    </div>
  );
}