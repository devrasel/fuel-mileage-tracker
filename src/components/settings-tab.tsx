'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RotateCcw, User, Phone, Mail, Code, Globe, HelpCircle, Fuel, Wrench } from 'lucide-react';

interface SettingsData {
  currency: string;
  dateFormat: string;
  distanceUnit: string;
  volumeUnit: string;
  entriesPerPage: number;
  timezone: string;
}

interface SettingsTabProps {
  settings?: any;
  onSettingsUpdated?: () => void;
}

export default function SettingsTab({ settings, onSettingsUpdated }: SettingsTabProps) {
  const [currentSettings, setCurrentSettings] = useState<SettingsData>({
    currency: 'BDT',
    dateFormat: 'MM/DD/YYYY',
    distanceUnit: 'km',
    volumeUnit: 'L',
    entriesPerPage: 10,
    timezone: 'Asia/Dhaka'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setCurrentSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentSettings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        if (onSettingsUpdated) {
          onSettingsUpdated();
        }
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setCurrentSettings({
      currency: 'BDT',
      dateFormat: 'MM/DD/YYYY',
      distanceUnit: 'km',
      volumeUnit: 'L',
      entriesPerPage: 10,
      timezone: 'Asia/Dhaka'
    });
  };

  const currencyOptions = [
    { value: 'BDT', label: 'Bangladeshi Taka (৳)', symbol: '৳' },
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (German)' },
  ];

  const distanceUnitOptions = [
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'mi', label: 'Miles (mi)' },
  ];

  const volumeUnitOptions = [
    { value: 'L', label: 'Liters (L)' },
    { value: 'gal', label: 'Gallons (gal)' },
    { value: 'galUS', label: 'US Gallons (gal US)' },
    { value: 'galUK', label: 'UK Gallons (gal UK)' },
  ];

  const entriesPerPageOptions = [
    { value: 5, label: '5 entries per page' },
    { value: 10, label: '10 entries per page' },
    { value: 20, label: '20 entries per page' },
    { value: 50, label: '50 entries per page' },
    { value: 100, label: '100 entries per page' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST)' },
    { value: 'Asia/Kolkata', label: 'Indian Standard Time (IST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Settings
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Customize your application preferences and view app information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currentSettings.currency} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Currency used for displaying costs and prices
              </p>
            </div>

            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={currentSettings.dateFormat} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, dateFormat: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Format for displaying dates throughout the application
              </p>
            </div>

            <div>
              <Label htmlFor="distanceUnit">Distance Unit</Label>
              <Select value={currentSettings.distanceUnit} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, distanceUnit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select distance unit" />
                </SelectTrigger>
                <SelectContent>
                  {distanceUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Unit for displaying odometer readings and distances
              </p>
            </div>

            <div>
              <Label htmlFor="volumeUnit">Volume Unit</Label>
              <Select value={currentSettings.volumeUnit} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, volumeUnit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select volume unit" />
                </SelectTrigger>
                <SelectContent>
                  {volumeUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Unit for displaying fuel volume amounts
              </p>
            </div>

            <div>
              <Label htmlFor="entriesPerPage">Fuel History Entries Per Page</Label>
              <Select value={currentSettings.entriesPerPage.toString()} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, entriesPerPage: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entries per page" />
                </SelectTrigger>
                <SelectContent>
                  {entriesPerPageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Number of fuel entries to display per page in the fuel history
              </p>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={currentSettings.timezone} onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Timezone used for displaying dates and times throughout the application
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview & Developer Info */}
        <div className="space-y-6">
          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/set-security-questions'}>
                Update Security Questions
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Set up security questions to recover your account if you forget your password.
              </p>
            </CardContent>
          </Card>

          {/* Settings Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                Settings Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Currency:</span>
                  <Badge variant="outline">
                    {currencyOptions.find(c => c.value === currentSettings.currency)?.symbol}25.50
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Date:</span>
                  <Badge variant="outline">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      timeZone: currentSettings.timezone
                    })}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Distance:</span>
                  <Badge variant="outline">
                    123,456.7 {currentSettings.distanceUnit}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Volume:</span>
                  <Badge variant="outline">
                    45.50 {currentSettings.volumeUnit}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Timezone:</span>
                  <Badge variant="outline" className="text-xs">
                    {timezoneOptions.find(t => t.value === currentSettings.timezone)?.label || currentSettings.timezone}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Current Time:</span>
                  <Badge variant="outline">
                    {new Date().toLocaleTimeString('en-US', {
                      timeZone: currentSettings.timezone,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Developer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Developer</div>
                    <div className="text-sm text-muted-foreground">Rasel Ahmed</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Contact</div>
                    <div className="text-sm text-muted-foreground">+8801744779727</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">Email</div>
                    <div className="text-sm text-muted-foreground">bdmixbd@gmail.com</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {message && (
                <span className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </span>
              )}
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* "How to Use" Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            How to Use This App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">1. Manage Your Vehicles</h4>
            <p className="text-muted-foreground">
              Use the vehicle selector at the top to switch between your vehicles or click "Manage" to add, edit, or reorder them. All data you enter is tied to the currently selected vehicle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Log Fuel & Maintenance</h4>
            <p className="text-muted-foreground">
              Use the <Button variant="ghost" size="icon" className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full"><Fuel className="h-4 w-4" /></Button> and <Button variant="ghost" size="icon" className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full"><Wrench className="h-4 w-4" /></Button> buttons at the bottom right to quickly add fuel and maintenance entries.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Analyze Your Data</h4>
            <p className="text-muted-foreground">
              The "Analytics" tab provides a comprehensive overview of your fuel consumption, costs, and efficiency. Explore the sub-tabs for monthly breakdowns and detailed analysis.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Vehicle-Specific Information</h4>
            <p className="text-muted-foreground">
              The "Vehicle" tab contains maintenance logs, service reminders, and this informational guide.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}