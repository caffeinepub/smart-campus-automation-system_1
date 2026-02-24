import { useState } from 'react';
import { useGetAllDevices } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DeviceStatusBadge from '../components/DeviceStatusBadge';
import DeviceTypeIcon from '../components/DeviceTypeIcon';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Variant_maintenance_offline_online } from '../backend';

export default function Devices() {
  const { data: devices, isLoading } = useGetAllDevices();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDevices = devices?.filter((device) => {
    const matchesSearch = 
      device.id.toLowerCase().includes(search.toLowerCase()) ||
      device.location.building.toLowerCase().includes(search.toLowerCase()) ||
      device.location.room.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Device Management</h1>
        <p className="text-muted-foreground">Monitor and manage all IoT devices across campus</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by device ID or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={Variant_maintenance_offline_online.online}>Online</SelectItem>
            <SelectItem value={Variant_maintenance_offline_online.offline}>Offline</SelectItem>
            <SelectItem value={Variant_maintenance_offline_online.maintenance}>Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Device List */}
      <div className="grid gap-4">
        {filteredDevices?.map((device) => {
          const lastSeen = new Date(Number(device.lastReadingTimestamp) / 1000000);
          
          return (
            <Card 
              key={device.id} 
              className="hover:shadow-soft transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/devices/$id', params: { id: device.id } })}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent text-primary">
                    <DeviceTypeIcon deviceType={device.deviceType} className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{device.id}</h3>
                      <DeviceStatusBadge status={device.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {device.location.building} - {device.location.room}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Last seen</p>
                    <p>{formatDistanceToNow(lastSeen, { addSuffix: true })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDevices?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No devices found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
