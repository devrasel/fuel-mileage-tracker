'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Car, FileText } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

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

interface MaintenanceCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMaintenanceCostSaved: () => void;
  editingEntry: MaintenanceCostEntry | null;
  settings: Settings;
  selectedVehicleId: string | null;
}

const MAINTENANCE_CATEGORIES = [
  'Oil Change',
  'Tires',
  'Brakes',
  'Battery',
  'Engine',
  'Transmission',
  'Suspension',
  'Exhaust',
  'Air Conditioning',
  'Electrical',
  'Body Work',
  'Windows',
  'Lights',
  'Other'
];

export default function MaintenanceCostModal({
  isOpen,
  onClose,
  onMaintenanceCostSaved,
  editingEntry,
  settings,
  selectedVehicleId
}: MaintenanceCostModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    description: '',
    cost: '',
    category: '',
    odometer: '',
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        date: editingEntry.date,
        description: editingEntry.description,
        cost: editingEntry.cost.toString(),
        category: editingEntry.category,
        odometer: editingEntry.odometer?.toString() || '',
        location: editingEntry.location || '',
        notes: editingEntry.notes || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString(),
        description: '',
        cost: '',
        category: '',
        odometer: '',
        location: '',
        notes: ''
      });
    }
  }, [editingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    setIsSubmitting(true);
    try {
      const url = editingEntry ? '/api/maintenance-cost' : '/api/maintenance-cost';
      const method = editingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: parseFloat(formData.cost),
          odometer: formData.odometer ? parseInt(formData.odometer) : undefined,
          vehicleId: selectedVehicleId,
          id: editingEntry?.id
        }),
      });

      if (response.ok) {
        onMaintenanceCostSaved();
        onClose();
      } else {
        console.error('Error saving maintenance cost');
      }
    } catch (error) {
      console.error('Error saving maintenance cost:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingEntry ? 'Edit Maintenance Cost' : 'Add Maintenance Cost'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[11px] sm:text-xs">Date</Label>
                <DateTimePicker
                  value={new Date(formData.date)}
                  onChange={(date) => setFormData(prev => ({ ...prev, date: date?.toISOString() || new Date().toISOString() }))}
                  autoTime
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="odometer" className="text-[11px] sm:text-xs">Odometer ({settings.distanceUnit})</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="odometer"
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                    className="pl-10 h-8"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[11px] sm:text-xs">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="h-8"
                placeholder="What was serviced?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[11px] sm:text-xs">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-[11px] sm:text-xs">Cost ({settings.currency})</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="h-8"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-[11px] sm:text-xs">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10 h-8"
                  placeholder="Where was it done?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[11px] sm:text-xs">Notes</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="pl-10 min-h-[60px]"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-8"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-8"
                disabled={isSubmitting || !formData.description || !formData.cost || !formData.category}
              >
                {isSubmitting ? 'Saving...' : (editingEntry ? 'Update' : 'Add')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}