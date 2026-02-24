import { useGetAllDevices, useGetUnacknowledgedAlerts } from '../hooks/useQueries';
import MetricCard from '../components/MetricCard';
import { Cpu, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Variant_maintenance_offline_online } from '../backend';

export default function Dashboard() {
  const { data: devices, isLoading: devicesLoading } = useGetAllDevices();
  const { data: alerts, isLoading: alertsLoading } = useGetUnacknowledgedAlerts();

  if (devicesLoading || alertsLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="relative h-48 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const onlineDevices = devices?.filter(d => d.status === Variant_maintenance_offline_online.online).length || 0;
  const offlineDevices = devices?.filter(d => d.status === Variant_maintenance_offline_online.offline).length || 0;
  const maintenanceDevices = devices?.filter(d => d.status === Variant_maintenance_offline_online.maintenance).length || 0;
  const totalDevices = devices?.length || 0;
  const activeAlerts = alerts?.length || 0;

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative h-48 rounded-lg overflow-hidden shadow-soft">
        <img 
          src="/assets/generated/hero-campus.dim_1200x400.png" 
          alt="Smart Campus" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
          <div className="px-8">
            <h1 className="text-4xl font-bold mb-2">Campus Operations Dashboard</h1>
            <p className="text-lg text-muted-foreground">Real-time monitoring and control</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Cpu}
          label="Total Devices"
          value={totalDevices}
          trend={`${onlineDevices} online`}
          variant="default"
        />
        <MetricCard
          icon={Activity}
          label="Online Devices"
          value={onlineDevices}
          trend={`${Math.round((onlineDevices / totalDevices) * 100)}% uptime`}
          variant="success"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={activeAlerts}
          trend={activeAlerts > 0 ? 'Requires attention' : 'All clear'}
          variant={activeAlerts > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          icon={TrendingUp}
          label="System Health"
          value={`${Math.round(((totalDevices - offlineDevices) / totalDevices) * 100)}%`}
          trend={maintenanceDevices > 0 ? `${maintenanceDevices} in maintenance` : 'Optimal'}
          variant="default"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Device Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Online</span>
              <span className="font-semibold text-success">{onlineDevices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Offline</span>
              <span className="font-semibold text-secondary">{offlineDevices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Maintenance</span>
              <span className="font-semibold text-warning">{maintenanceDevices}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Activity</h3>
          <p className="text-2xl font-bold">{devices?.length || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Devices registered</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Alert Summary</h3>
          <p className="text-2xl font-bold">{activeAlerts}</p>
          <p className="text-sm text-muted-foreground mt-1">Unacknowledged alerts</p>
        </div>
      </div>
    </div>
  );
}
