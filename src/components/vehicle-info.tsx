'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Calendar, MapPin, Fuel, Wrench, FileText, Edit, Plus, AlertTriangle } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleInfoProps {
  selectedVehicleId: string | null;
  settings?: any;
}

export default function VehicleInfo({ selectedVehicleId, settings }: VehicleInfoProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleStats, setVehicleStats] = useState({
    totalFuelEntries: 0,
    totalMaintenanceEntries: 0,
    totalDistance: 0,
    totalFuelCost: 0,
    totalMaintenanceCost: 0,
    averageMileage: 0,
    daysSinceAdded: 0
  });

  useEffect(() => {
    const fetchAllVehicleData = async () => {
      if (!selectedVehicleId) {
        setVehicle(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [
          vehicleResponse,
          fuelResponse,
          maintenanceResponse
        ] = await Promise.all([
          fetch(`/api/vehicle/${selectedVehicleId}`),
          fetch(`/api/fuel?vehicleId=${selectedVehicleId}`),
          fetch(`/api/maintenance-cost?vehicleId=${selectedVehicleId}`)
        ]);

        if (!vehicleResponse.ok) {
          const errorData = await vehicleResponse.text();
          console.error("Vehicle fetch error:", errorData);
          throw new Error('Failed to fetch vehicle information. Please try refreshing the page.');
        }
        const vehicleData = await vehicleResponse.json();
        setVehicle(vehicleData);

        let fuelStats = { stats: { totalEntries: 0, totalCost: 0, totalDistance: 0, mileagePerLiter: 0 } };
        if (fuelResponse.ok) {
          fuelStats = await fuelResponse.json();
        }

        let maintenanceStats = { stats: { totalEntries: 0, totalCost: 0 } };
        if (maintenanceResponse.ok) {
          maintenanceStats = await maintenanceResponse.json();
        }
        
        setVehicleStats({
          totalFuelEntries: fuelStats.stats.totalEntries,
          totalMaintenanceEntries: maintenanceStats.stats.totalEntries,
          totalDistance: fuelStats.stats.totalDistance,
          totalFuelCost: fuelStats.stats.totalCost,
          totalMaintenanceCost: maintenanceStats.stats.totalCost,
          averageMileage: fuelStats.stats.mileagePerLiter,
          daysSinceAdded: Math.floor((new Date().getTime() - new Date(vehicleData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        });

      } catch (err: any) {
        console.error('Error fetching vehicle data:', err);
        setError(err.message || 'An unexpected error occurred.');
        setVehicle(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVehicleData();
  }, [selectedVehicleId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if(error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              There was an issue fetching the vehicle details. Please try refreshing the page or selecting another vehicle.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Loading vehicle information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!selectedVehicleId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Please select a vehicle to view information</p>
            <p className="text-sm">Choose a vehicle from the selector above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vehicle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Vehicle not found</p>
            <p className="text-sm">The selected vehicle could not be loaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {vehicle.name} Details
            </CardTitle>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {vehicle.color && (
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-border"
                    style={{ backgroundColor: vehicle.color }}
                    title={vehicle.color}
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {vehicle.make && <span className="text-muted-foreground">{vehicle.make}</span>}
                    {vehicle.model && <span className="text-muted-foreground">{vehicle.model}</span>}
                    {vehicle.year && <span className="text-muted-foreground">({vehicle.year})</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {vehicle.licensePlate && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">License Plate:</span>
                    <Badge variant="outline">{vehicle.licensePlate}</Badge>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Added:</span>
                  <span className="text-sm">{formatDate(vehicle.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={vehicle.isActive ? "default" : "secondary"}>
                    {vehicle.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{vehicleStats.totalFuelEntries}</p>
                  <p className="text-xs text-muted-foreground">Fuel Entries</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{vehicleStats.totalMaintenanceEntries}</p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatNumber(vehicleStats.totalDistance, 0)}</p>
                  <p className="text-xs text-muted-foreground">Total KM</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{vehicleStats.daysSinceAdded}</p>
                  <p className="text-xs text-muted-foreground">Days Tracked</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Fuel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-semibold text-blue-800">{formatCurrency(vehicleStats.totalFuelCost)}</p>
              <p className="text-sm text-blue-600">Total Fuel Cost</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-lg font-semibold text-orange-800">{formatCurrency(vehicleStats.totalMaintenanceCost)}</p>
              <p className="text-sm text-orange-600">Total Maintenance</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Car className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-lg font-semibold text-green-800">{formatCurrency(vehicleStats.totalFuelCost + vehicleStats.totalMaintenanceCost)}</p>
              <p className="text-sm text-green-600">Total Expenses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Mileage</span>
              <span className="font-medium">{formatNumber(vehicleStats.averageMileage, 2)} km/L</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost per KM</span>
              <span className="font-medium">
                {vehicleStats.totalDistance > 0 
                  ? formatCurrency((vehicleStats.totalFuelCost + vehicleStats.totalMaintenanceCost) / vehicleStats.totalDistance)
                  : '৳0.00'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Average Distance</span>
              <span className="font-medium">
                {vehicleStats.daysSinceAdded > 0 
                  ? formatNumber(vehicleStats.totalDistance / vehicleStats.daysSinceAdded, 1)
                  : '0'
                } km/day
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Fuel Budget</span>
              <span className="font-medium">
                {vehicleStats.daysSinceAdded > 0 
                  ? formatCurrency((vehicleStats.totalFuelCost / vehicleStats.daysSinceAdded) * 30)
                  : '৳0.00'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents & Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents & Notes
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Add insurance papers, registration, or maintenance records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}