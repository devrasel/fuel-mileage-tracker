'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Calculator, AlertTriangle } from 'lucide-react';

interface FuelEntryFormProps {
  onEntryAdded: () => void;
  editingEntry?: any;
  onCancelEdit?: () => void;
}

export default function FuelEntryForm({ onEntryAdded, editingEntry, onCancelEdit }: FuelEntryFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
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
    if (editingEntry) {
      setFormData({
        date: new Date(editingEntry.date).toISOString().split('T')[0],
        odometer: editingEntry.odometer.toString(),
        totalCost: editingEntry.totalCost.toString(),
        costPerLiter: editingEntry.costPerLiter.toString(),
        liters: editingEntry.liters.toString(),
        fuelType: editingEntry.fuelType,
        parentEntry: editingEntry.parentEntry || '',
        location: editingEntry.location || '',
        notes: editingEntry.notes || ''
      });
    }
  }, [editingEntry]);

  useEffect(() => {
    // Fetch available full entries for partial fuel selection
    const fetchFullEntries = async () => {
      try {
        const response = await fetch('/api/fuel/full-entries');
        if (response.ok) {
          const entries = await response.json();
          setAvailableFullEntries(entries);
        }
      } catch (error) {
        console.error('Error fetching full entries:', error);
      }
    };
    
    if (formData.fuelType === 'PARTIAL') {
      fetchFullEntries();
    }
  }, [formData.fuelType]);

  const handleInputChange = (field: string, value: string) => {
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

    if (formData.fuelType === 'PARTIAL' && !formData.parentEntry) {
      alert('Please select a full tank entry for this partial fuel entry');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = editingEntry ? `/api/fuel/update?id=${editingEntry.id}` : '/api/fuel/add';
      const method = editingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentEntry: formData.fuelType === 'PARTIAL' ? formData.parentEntry : null
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          odometer: '',
          totalCost: '',
          costPerLiter: '',
          liters: '',
          fuelType: 'FULL',
          parentEntry: '',
          location: '',
          notes: ''
        });
        onEntryAdded();
        if (onCancelEdit) onCancelEdit();
      } else {
        alert('Failed to save fuel entry');
      }
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      alert('Error saving fuel entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {editingEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
          {editingEntry && (
            <Badge variant="outline">Editing</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer ({formData.distanceUnit || 'km'}) *</Label>
              <Input
                id="odometer"
                type="number"
                step="0.1"
                placeholder="123456.7"
                value={formData.odometer}
                onChange={(e) => handleInputChange('odometer', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost ($) *</Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                placeholder="65.98"
                value={formData.totalCost}
                onChange={(e) => handleInputChange('totalCost', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPerLiter">Cost per Liter ($) *</Label>
              <Input
                id="costPerLiter"
                type="number"
                step="0.01"
                placeholder="1.45"
                value={formData.costPerLiter}
                onChange={(e) => handleInputChange('costPerLiter', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="liters">Total Liters *</Label>
                <Badge variant="outline" className="text-xs">
                  {autoCalculate ? 'Auto' : 'Manual'}
                </Badge>
              </div>
              <Input
                id="liters"
                type="number"
                step="0.01"
                placeholder="45.50"
                value={formData.liters}
                onChange={(e) => handleInputChange('liters', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Shell Station"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fuelType"
                checked={formData.fuelType === 'PARTIAL'}
                onCheckedChange={(checked) => {
                  handleInputChange('fuelType', checked ? 'PARTIAL' : 'FULL');
                }}
              />
              <Label htmlFor="fuelType" className="flex items-center gap-2">
                Partial Fuel Entry
                {formData.fuelType === 'PARTIAL' && (
                  <Badge variant="secondary" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Requires parent entry
                  </Badge>
                )}
              </Label>
            </div>

            {formData.fuelType === 'PARTIAL' && (
              <div className="space-y-2">
                <Label htmlFor="parentEntry">Parent Full Tank Entry *</Label>
                <select
                  id="parentEntry"
                  value={formData.parentEntry}
                  onChange={(e) => handleInputChange('parentEntry', e.target.value)}
                  className="w-full p-2 border border-input rounded-md"
                  required
                >
                  <option value="">Select a full tank entry</option>
                  {availableFullEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {new Date(entry.date).toLocaleDateString()} - {entry.liters}L at ${entry.costPerLiter}/L
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAutoCalculate(!autoCalculate)}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              {autoCalculate ? 'Disable Auto-Calc' : 'Enable Auto-Calc'}
            </Button>
            
            <div className="flex gap-2">
              {onCancelEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Add Entry')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}