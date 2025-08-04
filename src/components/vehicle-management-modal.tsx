'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Car, Plus, Edit, Trash2, Save, X } from 'lucide-react';

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

interface VehicleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehiclesUpdated: () => void;
}

export default function VehicleManagementModal({ 
  isOpen, 
  onClose, 
  onVehiclesUpdated 
}: VehicleManagementModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    isActive: true
  });

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vehicle?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        // Sort by displayOrder first, then by createdAt
        const sortedData = [...data].sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setVehicles(sortedData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        name: editingVehicle.name,
        make: editingVehicle.make || '',
        model: editingVehicle.model || '',
        year: editingVehicle.year?.toString() || '',
        licensePlate: editingVehicle.licensePlate || '',
        color: editingVehicle.color || '',
        isActive: editingVehicle.isActive
      });
    } else if (isAdding) {
      setFormData({
        name: '',
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        isActive: true
      });
    }
  }, [editingVehicle, isAdding]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Vehicle name is required');
      return;
    }

    try {
      // Ensure all fields are properly formatted
      const payload = {
        name: formData.name.trim(),
        make: formData.make && formData.make.trim() !== '' ? formData.make.trim() : null,
        model: formData.model && formData.model.trim() !== '' ? formData.model.trim() : null,
        year: formData.year && formData.year.trim() !== '' ? parseInt(formData.year.trim()) : null,
        licensePlate: formData.licensePlate && formData.licensePlate.trim() !== '' ? formData.licensePlate.trim() : null,
        color: formData.color && formData.color.trim() !== '' ? formData.color.trim() : null,
        isActive: Boolean(formData.isActive)
      };
      
      console.log('Sending payload:', payload);

      let response;
      if (editingVehicle) {
        response = await fetch(`/api/vehicle/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/vehicle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        await fetchVehicles();
        setEditingVehicle(null);
        setIsAdding(false);
        onVehiclesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save vehicle');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const newVehicles = [...vehicles];
    const temp = newVehicles[index];
    newVehicles[index] = newVehicles[index - 1];
    newVehicles[index - 1] = temp;
    
    setVehicles(newVehicles);
  };
  
  const handleMoveDown = (index: number) => {
    if (index >= vehicles.length - 1) return;
    
    const newVehicles = [...vehicles];
    const temp = newVehicles[index];
    newVehicles[index] = newVehicles[index + 1];
    newVehicles[index + 1] = temp;
    
    setVehicles(newVehicles);
  };
  
  const saveOrder = async () => {
    try {
      setIsSavingOrder(true);
      const vehicleIds = vehicles.map(v => v.id);
      
      const response = await fetch('/api/vehicle/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleIds })
      });
      
      if (response.ok) {
        onVehiclesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save vehicle order');
      }
    } catch (error) {
      console.error('Error saving vehicle order:', error);
      alert('Failed to save vehicle order');
    } finally {
      setIsSavingOrder(false);
    }
  };
  
  const handleDelete = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/vehicle/${vehicleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchVehicles();
        onVehiclesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle');
    }
  };

  const startAdd = () => {
    setEditingVehicle(null);
    setIsAdding(true);
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingVehicle(null);
    setIsAdding(false);
  };

  const getVehicleDisplayName = (vehicle: Vehicle) => {
    const parts = [vehicle.name];
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    if (vehicle.year) parts.push(vehicle.year.toString());
    return parts.join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Manage Vehicles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {(isAdding || editingVehicle) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isAdding ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {isAdding ? 'Add New Vehicle' : 'Edit Vehicle'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Vehicle Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., My Car, Work Truck"
                    />
                  </div>
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      placeholder="e.g., Toyota, Ford"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g., Camry, F-150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      placeholder="e.g., 2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                      placeholder="e.g., ABC-123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="e.g., Blue, Red"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Vehicles</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={saveOrder}
                  className="flex items-center gap-2"
                  size="sm"
                  disabled={isSavingOrder}
                >
                  <Save className="h-4 w-4" />
                  Save Order
                </Button>
                <Button onClick={startAdd} className="flex items-center gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Drag and drop or use the arrow buttons to reorder your vehicles. Click "Save Order" when done.
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No vehicles found. Add your first vehicle to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {vehicles.map((vehicle, index) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{getVehicleDisplayName(vehicle)}</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {vehicle.licensePlate && (
                                  <div>License: {vehicle.licensePlate}</div>
                                )}
                                {vehicle.color && (
                                  <div>Color: {vehicle.color}</div>
                                )}
                                <div>Added: {new Date(vehicle.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {vehicle.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex flex-col mr-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                              title="Move up"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 15-6-6-6 6"/>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === vehicles.length - 1}
                              className="h-6 w-6 p-0"
                              title="Move down"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(vehicle)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{getVehicleDisplayName(vehicle)}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(vehicle.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}