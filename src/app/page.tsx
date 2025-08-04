'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FuelHistory from '@/components/fuel-history';
import FuelHistoryLoading from '@/components/fuel-history-loading';
import FuelStatistics from '@/components/fuel-statistics';
import FuelMonthlyStats from '@/components/fuel-monthly-stats';
import FuelEntryModal from '@/components/fuel-entry-modal';
import VehicleSelector from '@/components/vehicle-selector';
import VehicleManagementModal from '@/components/vehicle-management-modal';
import MaintenanceCostHistory from '@/components/maintenance-cost-history';
import MaintenanceCostStatistics from '@/components/maintenance-cost-statistics';
import MaintenanceCostModal from '@/components/maintenance-cost-modal';
import GeneralLoading from '@/components/general-loading';
import CombinedAnalytics from '@/components/combined-analytics';
import SettingsTab from '@/components/settings-tab';
//import Reminders from '@/components/reminders';
import EfficiencyAnalysis from '@/components/efficiency-analysis';
import VehicleInfo from '@/components/vehicle-info';
import { Fuel, BarChart3, Settings, Wrench, Calendar, LogOut, TrendingUp, Bell, Car, PieChart, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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

interface FuelStats {
  totalEntries: number;
  totalCost: number;
  totalLiters: number;
  totalDistance: number;
  averageCostPerLiter: number;
  averageConsumption: number;
  bestConsumption: number;
  worstConsumption: number;
  mileagePerLiter: number;
  totalMileage: number;
}

interface MaintenanceCostStats {
  totalEntries: number;
  totalCost: number;
  averageCost: number;
  categories: { [key: string]: number };
  monthlyCosts: { [key: string]: number };
}

interface Settings {
  currency: string;
  dateFormat: string;
  distanceUnit: string;
  volumeUnit: string;
  entriesPerPage: number;
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Track when component is mounted to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelStats>({
    totalEntries: 0,
    totalCost: 0,
    totalLiters: 0,
    totalDistance: 0,
    averageCostPerLiter: 0,
    averageConsumption: 0,
    bestConsumption: 0,
    worstConsumption: 0,
    mileagePerLiter: 0,
    totalMileage: 0
  });
  const [maintenanceCostEntries, setMaintenanceCostEntries] = useState<MaintenanceCostEntry[]>([]);
  const [maintenanceCostStats, setMaintenanceCostStats] = useState<MaintenanceCostStats>({
    totalEntries: 0,
    totalCost: 0,
    averageCost: 0,
    categories: {},
    monthlyCosts: {}
  });
  const [settings, setSettings] = useState<Settings>({
    currency: 'BDT',
    dateFormat: 'DD/MM/YYYY',
    distanceUnit: 'km',
    volumeUnit: 'L',
    entriesPerPage: 5
  });
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [editingMaintenanceCost, setEditingMaintenanceCost] = useState<MaintenanceCostEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Modal states
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isVehicleManagementModalOpen, setIsVehicleManagementModalOpen] = useState(false);
  const [isMaintenanceCostModalOpen, setIsMaintenanceCostModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchFuelData = async () => {
    try {
      setIsLoading(true);
      const url = selectedVehicleId ? `/api/fuel?vehicleId=${selectedVehicleId}` : '/api/fuel';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFuelEntries(data.entries);
        setFuelStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching fuel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenanceCostData = async () => {
    try {
      const url = selectedVehicleId ? `/api/maintenance-cost?vehicleId=${selectedVehicleId}` : '/api/maintenance-cost';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMaintenanceCostEntries(data.entries);
        setMaintenanceCostStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching maintenance cost data:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    if (user && isClient) {
      fetchFuelData();
      fetchMaintenanceCostData();
      fetchSettings();
    }
  }, [selectedVehicleId, user, isClient]);

  const handleEntrySaved = () => {
    fetchFuelData();
    setEditingEntry(null);
  };

  const handleEntryDeleted = () => {
    fetchFuelData();
  };

  const handleEntryEdited = (entry: FuelEntry) => {
    setEditingEntry(entry);
    setIsAddEntryModalOpen(true);
  };

  const handleMaintenanceCostSaved = () => {
    fetchMaintenanceCostData();
    setEditingMaintenanceCost(null);
  };

  const handleMaintenanceCostDeleted = () => {
    fetchMaintenanceCostData();
  };

  const handleMaintenanceCostEdited = (entry: MaintenanceCostEntry) => {
    setEditingMaintenanceCost(entry);
    setIsMaintenanceCostModalOpen(true);
  };

  const openAddEntryModal = () => {
    setEditingEntry(null);
    setIsAddEntryModalOpen(true);
  };

  const openMaintenanceCostModal = () => {
    setEditingMaintenanceCost(null);
    setIsMaintenanceCostModalOpen(true);
  };

  const openVehicleManagementModal = () => {
    setIsVehicleManagementModalOpen(true);
  };

  const handleVehicleChange = (vehicleId: string | null) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleVehiclesUpdated = () => {
    fetchFuelData();
    fetchMaintenanceCostData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Don't render anything until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-2 sm:p-4 space-y-2 sm:space-y-4 max-w-[960px]">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo on the left */}
          <div className="flex items-center flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12">
              <img
                src="/logo.svg"
                alt="Rasel Ahmed Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Centered title and tagline */}
          <div className="text-center space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <h1 className="text-sm sm:text-sm md:text-base font-bold truncate">Mileage Tracker</h1>
            <p className="text-xs sm:text-xs text-muted-foreground truncate hidden sm:block">Track your fuel consumption and expenses</p>
          </div>
          
          {/* User Info and Logout on the right */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="text-right min-w-0">
              <div className="text-xs sm:text-xs font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">
                {user?.name || user?.email}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1 h-8 sm:h-6 px-2 sm:px-2 min-w-0"
            >
              <LogOut className="h-3 w-3 sm:h-3 sm:w-3 flex-shrink-0" />
            </Button>
          </div>
        </div>

        {/* Vehicle Selector */}
        <VehicleSelector
          selectedVehicleId={selectedVehicleId}
          onVehicleChange={handleVehicleChange}
          onManageVehicles={openVehicleManagementModal}
        />

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="space-y-2 sm:space-y-4 py-4 sm:py-6 modern-tabs-list border-b border-gray-200 dark:border-gray-700 grid w-full grid-cols-4  ">
            <TabsTrigger value="history" className="modern-tab-trigger flex flex-col items-center gap-1 px-3 sm:px-4 md:px-6 md:py-[28px]">
              <Fuel className="tab-icon h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-colors duration-300" />
              <span className="text-xs sm:text-sm md:text-sm font-medium">Fuel Log</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="modern-tab-trigger flex flex-col items-center gap-1 px-3 sm:px-4 md:px-6">
              <BarChart3 className="tab-icon h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-colors duration-300" />
              <span className="text-xs sm:text-sm md:text-sm font-medium">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="modern-tab-trigger flex flex-col items-center gap-1 px-3 sm:px-4 md:px-6">
              <Car className="tab-icon h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-colors duration-300" />
              <span className="text-xs sm:text-sm md:text-sm font-medium">Vehicle</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="modern-tab-trigger flex flex-col items-center gap-1 px-3 sm:px-4 md:px-6">
              <Settings className="tab-icon h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 transition-colors duration-300" />
              <span className="text-xs sm:text-sm md:text-sm font-medium">Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-2 sm:space-y-4 py-4 sm:py-6">
            {isLoading ? (
              <FuelHistoryLoading />
            ) : (
              <FuelHistory 
                entries={fuelEntries} 
                onEntryDeleted={handleEntryDeleted}
                onEntryEdited={handleEntryEdited}
                settings={settings}
              />
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-none">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="modern-sub-tabs-list flex w-full justify-center mb-2">
                <TabsTrigger value="overview" className="modern-sub-tab-trigger flex items-center gap-2">
                  <PieChart className="tab-icon h-4 w-4 transition-colors duration-200" />
                  <span className="text-sm font-medium">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="monthly" className="modern-sub-tab-trigger flex items-center gap-2">
                  <Calendar className="tab-icon h-4 w-4 transition-colors duration-200" />
                  <span className="text-sm font-medium">Monthly</span>
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="modern-sub-tab-trigger flex items-center gap-2">
                  <Activity className="tab-icon h-4 w-4 transition-colors duration-200" />
                  <span className="text-sm font-medium">Efficiency</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-2 sm:space-y-4">
                {isLoading ? (
                  <GeneralLoading message="Loading Analytics..." submessage="Please wait while we analyze your data" />
                ) : (
                  <CombinedAnalytics 
                    fuelStats={fuelStats} 
                    maintenanceStats={maintenanceCostStats} 
                    settings={settings} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-2 sm:space-y-4">
                {isLoading ? (
                  <GeneralLoading message="Loading Monthly Stats..." submessage="Please wait while we prepare your monthly analysis" />
                ) : (
                  <FuelMonthlyStats entries={fuelEntries} settings={settings} />
                )}
              </TabsContent>
              
              <TabsContent value="efficiency" className="space-y-2 sm:space-y-4">
                {isLoading ? (
                  <GeneralLoading message="Loading Efficiency Analysis..." submessage="Please wait while we prepare your efficiency report" />
                ) : (
                  <EfficiencyAnalysis fuelStats={fuelStats} settings={settings} />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="vehicle" className="space-none">
            <Tabs defaultValue="maintenance" className="w-full">
              <TabsList className="modern-sub-tabs-list flex w-full justify-center mb-2">
                <TabsTrigger value="maintenance" className="modern-sub-tab-trigger flex items-center gap-2">
                  <Wrench className="tab-icon h-4 w-4 transition-colors duration-200" />
                  <span className="text-sm font-medium">Maintenance</span>
                </TabsTrigger>
                <TabsTrigger value="info" className="modern-sub-tab-trigger flex items-center gap-2">
                  <Car className="tab-icon h-4 w-4 transition-colors duration-200" />
                  <span className="text-sm font-medium">Vehicle Info</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="maintenance" className="space-y-2 sm:space-y-4">
                {isLoading ? (
                  <GeneralLoading message="Loading Maintenance..." submessage="Please wait while we fetch your maintenance records" />
                ) : (
                  <div className="space-y-2 sm:space-y-4">
                    <MaintenanceCostStatistics stats={maintenanceCostStats} settings={settings} />
                    <MaintenanceCostHistory 
                      entries={maintenanceCostEntries} 
                      onEntryDeleted={handleMaintenanceCostDeleted}
                      onEntryEdited={handleMaintenanceCostEdited}
                      settings={settings}
                    />
                  </div>
                )}
              </TabsContent>
              
              
              <TabsContent value="info" className="space-y-2 sm:space-y-4">
                <VehicleInfo selectedVehicleId={selectedVehicleId} settings={settings} />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-2 sm:space-y-4 py-4 sm:py-6">
            <SettingsTab settings={settings} onSettingsUpdated={fetchSettings} />
          </TabsContent>
        </Tabs>

        {/* Fixed Bottom Right Buttons */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-3 sm:gap-3 z-50">
          <Button
            onClick={openAddEntryModal}
            className="flex items-center justify-center gap-1 sm:gap-2 h-14 w-14 sm:h-12 sm:w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={!selectedVehicleId}
          >
            <Fuel className="h-5 w-5 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            onClick={openMaintenanceCostModal}
            className="flex items-center justify-center gap-1 sm:gap-2 h-14 w-14 sm:h-12 sm:w-12 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
            size="lg"
            disabled={!selectedVehicleId}
          >
            <Wrench className="h-5 w-5 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Add/Edit Entry Modal */}
        <FuelEntryModal
          isOpen={isAddEntryModalOpen}
          onClose={() => {
            setIsAddEntryModalOpen(false);
            setEditingEntry(null);
          }}
          onEntrySaved={handleEntrySaved}
          editingEntry={editingEntry}
          settings={settings}
          selectedVehicleId={selectedVehicleId}
        />

        {/* Vehicle Management Modal */}
        <VehicleManagementModal
          isOpen={isVehicleManagementModalOpen}
          onClose={() => setIsVehicleManagementModalOpen(false)}
          onVehiclesUpdated={handleVehiclesUpdated}
        />

        {/* Maintenance Cost Modal */}
        <MaintenanceCostModal
          isOpen={isMaintenanceCostModalOpen}
          onClose={() => {
            setIsMaintenanceCostModalOpen(false);
            setEditingMaintenanceCost(null);
          }}
          onMaintenanceCostSaved={handleMaintenanceCostSaved}
          editingEntry={editingMaintenanceCost}
          settings={settings}
          selectedVehicleId={selectedVehicleId}
        />
      </div>
    </div>
  );
}
