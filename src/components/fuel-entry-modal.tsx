'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Plus, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/utils/currency';

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
  parentEntry?: string;
  odometerExtraKm?: number;
}

interface FuelEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntrySaved: () => void;
  editingEntry?: FuelEntry | null;
  settings?: any;
  selectedVehicleId?: string | null;
}

export default function FuelEntryModal({ isOpen, onClose, onEntrySaved, editingEntry, settings, selectedVehicleId }: FuelEntryModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date(),
    odometer: '',
    odometerExtraKm: '',
    totalCost: '',
    costPerLiter: '',
    liters: '',
    fuelType: 'FULL' as 'FULL' | 'PARTIAL',
    parentEntry: '',
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [availableFullEntries, setAvailableFullEntries] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          date: new Date(editingEntry.date),
          odometer: editingEntry.odometer.toString(),
          odometerExtraKm: '',
          totalCost: editingEntry.totalCost.toString(),
          costPerLiter: editingEntry.costPerLiter.toString(),
          liters: editingEntry.liters.toString(),
          fuelType: editingEntry.fuelType,
          parentEntry: editingEntry.parentEntry || '',
          location: editingEntry.location || '',
          notes: editingEntry.notes || ''
        });
      } else {
        // Reset form for new entry with current date and time
        setFormData({
          date: new Date(),
          odometer: '',
          odometerExtraKm: '',
          totalCost: '',
          costPerLiter: '',
          liters: '',
          fuelType: 'FULL',
          parentEntry: '',
          location: '',
          notes: ''
        });
      }
    }
  }, [isOpen, editingEntry]);

  useEffect(() => {
    // Fetch available full entries for partial fuel selection
    const fetchFullEntries = async () => {
      try {
        const url = selectedVehicleId 
          ? `/api/fuel/full-entries?vehicleId=${selectedVehicleId}`
          : '/api/fuel/full-entries';
        const response = await fetch(url);
        if (response.ok) {
          const entries = await response.json();
          // Filter out the current editing entry if it's a full entry
          const filteredEntries = editingEntry && editingEntry.fuelType === 'FULL' 
            ? entries.filter((entry: any) => entry.id !== editingEntry.id)
            : entries;
          setAvailableFullEntries(filteredEntries);
        }
      } catch (error) {
        console.error('Error fetching full entries:', error);
      }
    };
    
    if (isOpen) {
      fetchFullEntries();
    }
  }, [isOpen, editingEntry, selectedVehicleId]);

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate liters if totalCost and costPerLiter are provided
      if (autoCalculate && (field === 'totalCost' || field === 'costPerLiter')) {
        const totalCost = parseFloat(newData.totalCost);
        const costPerLiter = parseFloat(newData.costPerLiter);
        
        if (!isNaN(totalCost) && !isNaN(costPerLiter) && costPerLiter > 0) {
          newData.liters = (totalCost / costPerLiter).toFixed(2);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.odometer || !formData.totalCost || !formData.costPerLiter || !formData.liters) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.fuelType === 'PARTIAL' && availableFullEntries.length === 0) {
      alert('No full tank entries found. Please create a full tank entry first.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Auto-select the most recent full entry for partial fuel entries
      let parentEntry = null;
      if (formData.fuelType === 'PARTIAL' && availableFullEntries.length > 0) {
        parentEntry = availableFullEntries[0].id;
      }
      
      const url = editingEntry ? `/api/fuel/update?id=${editingEntry.id}` : '/api/fuel/add';
      const method = editingEntry ? 'PUT' : 'POST';
      
      // Format date as ISO string for the API (preserves time)
      const formattedDate = formData.date instanceof Date 
        ? formData.date.toISOString()
        : new Date(formData.date).toISOString();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formattedDate,
          parentEntry: parentEntry,
          vehicleId: selectedVehicleId,
          odometerExtraKm: formData.odometerExtraKm ? parseFloat(formData.odometerExtraKm) : null
        }),
      });

      if (response.ok) {
        // Show success toast
        toast({
          title: "Success!",
          description: editingEntry ? "Fuel entry updated successfully." : "Fuel entry added successfully.",
          action: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          ),
        });
        
        onEntrySaved();
        onClose();
      } else {
        // Show error toast
        toast({
          title: "Error!",
          description: "Failed to save fuel entry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      // Show error toast
      toast({
        title: "Error!",
        description: "An error occurred while saving the fuel entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {editingEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
            {editingEntry && (
              <Badge variant="outline" className="text-xs">Editing</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-3">
            <div className="space-y-1">
              <Label htmlFor="datetime" className="text-[11px] sm:text-xs font-medium">
               Entry Date *
              </Label>
              <DateTimePicker
                value={formData.date}
                onChange={(date) => handleInputChange('date', date || new Date())}
                timezone={settings?.timezone}
                autoTime={true}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="odometer" className="text-[11px] sm:text-xs font-medium">
                Current Odometer ({settings?.distanceUnit || 'km'}) *
              </Label>
              <Input
                id="odometer"
                type="number"
                step="0.1"
                placeholder="2050.00"
                value={formData.odometer}
                onChange={(e) => handleInputChange('odometer', e.target.value)}
                required
                className="h-10 sm:h-10 border focus:border-primary/30"
              />
            </div>
            
            {formData.fuelType === 'PARTIAL' && (
              <div className="space-y-1 hidden">
                <Label htmlFor="odometerExtraKm" className="text-[11px] sm:text-xs font-medium">
                  Extra km to Add to Last Full Entry ({settings?.distanceUnit || 'km'})
                </Label>
                <Input
                  id="odometerExtraKm"
                  type="number"
                  step="0.1"
                  placeholder="200"
                  value={formData.odometerExtraKm}
                  onChange={(e) => handleInputChange('odometerExtraKm', e.target.value)}
                  className="h-10 sm:h-10 border focus:border-primary/30"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, this distance will be added to the last full entry's odometer to calculate accurate mileage.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="totalCost" className="text-[11px] sm:text-xs font-medium">
                  Total Fuel Cost ({getCurrencySymbol(settings?.currency || 'BDT')}) *
                </Label>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={formData.totalCost}
                  onChange={(e) => handleInputChange('totalCost', e.target.value)}
                  required
                  className="h-10 sm:h-10 border focus:border-primary/30"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="costPerLiter" className="text-[11px] sm:text-xs font-medium">
                  Price Per {settings?.volumeUnit || 'L'} ({getCurrencySymbol(settings?.currency || 'BDT')}) *
                </Label>
                <Input
                  id="costPerLiter"
                  type="number"
                  step="0.01"
                  placeholder="122.85"
                  value={formData.costPerLiter}
                  onChange={(e) => handleInputChange('costPerLiter', e.target.value)}
                  required
                  className="h-10 sm:h-10 border focus:border-primary/30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="liters" className="text-[11px] sm:text-xs font-medium">
                    Total {settings?.volumeUnit || 'L'} *
                  </Label>
                  <Badge variant="outline" className="text-[10px]">
                    {autoCalculate ? 'Auto' : 'Manual'}
                  </Badge>
                </div>
                <Input
                  id="liters"
                  type="number"
                  step="0.01"
                  placeholder="50.50"
                  value={formData.liters}
                  onChange={(e) => handleInputChange('liters', e.target.value)}
                  required
                  className="h-10 sm:h-10 border focus:border-primary/30"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="location" className="text-[11px] sm:text-xs font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Fuel Station"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="h-10 sm:h-10 border focus:border-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Fuel Type Selection */}
          <div className="space-y-2 sm:space-y-3 pl-3 p-2 sm:p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex flex-row sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <Checkbox
                id="fuelType"
                checked={formData.fuelType === 'PARTIAL'}
                onCheckedChange={(checked) => {
                  handleInputChange('fuelType', checked ? 'PARTIAL' : 'FULL');
                }}
                className="mt-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5 sm:h-5 sm:w-5"
              />
              <Label htmlFor="fuelType" className="flex items-center gap-1 sm:gap-2 cursor-pointer text-sm sm:text-base font-medium">
                <span className="text-primary font-bold pl-1">Partial</span>
                {formData.fuelType === 'PARTIAL' && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Linked to most recent entry
                  </Badge>
                )}
              </Label>
            </div>

          </div>
          
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-[11px] sm:text-xs font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="resize-none border focus:border-primary/30"
            />
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAutoCalculate(!autoCalculate)}
              className="flex items-center gap-1 sm:gap-2 h-10 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              {autoCalculate ? 'Disable Auto-Calc' : 'Enable Auto-Calc'}
            </Button>
            
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 sm:gap-2 h-10 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                {isSubmitting ? 'Saving...' : (editingEntry ? 'Update' : 'Add')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
