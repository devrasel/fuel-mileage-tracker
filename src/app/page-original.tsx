'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FuelHistory from '@/components/fuel-history';
import FuelHistoryLoading from '@/components/fuel-history-loading';
import FuelStatistics from '@/components/fuel-statistics';
import FuelMonthlyStats from '@/components/fuel-monthly-stats';
import FuelEntryModal from '@/components/fuel-entry-modal';
import SettingsModal from '@/components/settings-modal';
import VehicleSelector from '@/components/vehicle-selector';
import VehicleManagementModal from '@/components/vehicle-management-modal';
import MaintenanceCostHistory from '@/components/maintenance-cost-history';
import MaintenanceCostStatistics from '@/components/maintenance-cost-statistics';
import MaintenanceCostModal from '@/components/maintenance-cost-modal';
import GeneralLoading from '@/components/general-loading';
import { Fuel, BarChart3, Settings, Wrench, Calendar, LogOut } from 'lucide-react';
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
    entriesPerPage: 10
  });
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [editingMaintenanceCost, setEditingMaintenanceCost] = useState<MaintenanceCostEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Modal states
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
      <div className="container mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4 max-w-[960px]">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo on the left */}
          <div className="flex items-center flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
              <img
                src="/logo.svg"
                alt="Z.ai Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Centered title and tagline */}
          <div className="text-center space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-bold truncate">Mileage Tracker</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Track your fuel consumption and expenses</p>
          </div>
          
          {/* User Info and Logout on the right */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="text-right min-w-0">
              <div className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px]">
                {user?.name || user?.email}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1 h-5 sm:h-6 px-1.5 sm:px-2 min-w-0"
            >
              <LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
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
          <TabsList className="grid w-full grid-cols-4 h-8 sm:h-10">
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8">
              <Fuel className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Monthly</span>
              <span className="sm:hidden">Mo</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8">
              <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Costs</span>
              <span className="sm:hidden">Cost</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-3 sm:space-y-4">
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
          
          <TabsContent value="statistics" className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <GeneralLoading message="Loading Statistics..." submessage="Please wait while we calculate your fuel statistics" />
            ) : (
              <FuelStatistics stats={fuelStats} />
            )}
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <GeneralLoading message="Loading Monthly Stats..." submessage="Please wait while we prepare your monthly analysis" />
            ) : (
              <FuelMonthlyStats entries={fuelEntries} settings={settings} />
            )}
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <GeneralLoading message="Loading Maintenance Costs..." submessage="Please wait while we fetch your maintenance records" />
            ) : (
              <div className="space-y-3 sm:space-y-4">
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
        </Tabs>

        {/* Fixed Bottom Right Buttons */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-2 sm:gap-3 z-50">
          <Button
            onClick={openAddEntryModal}
            className="flex items-center gap-1 sm:gap-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={!selectedVehicleId}
          >
            <Fuel className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            onClick={openMaintenanceCostModal}
            className="flex items-center gap-1 sm:gap-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
            size="lg"
            disabled={!selectedVehicleId}
          >
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1 sm:gap-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg border-2"
            size="lg"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
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

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSettingsSaved={fetchSettings}
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