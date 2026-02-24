import { useParams } from '@tanstack/react-router';
import { useGetDevice, useGetSensorReadings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeviceStatusBadge from '../components/DeviceStatusBadge';
import DeviceTypeIcon from '../components/DeviceTypeIcon';
import SensorChart from '../components/SensorChart';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DeviceDetail() {
  const { id } = useParams({ from: '/devices/$id' });
  const { data: device, isLoading: deviceLoading } = useGetDevice(id);
  const { data: readings, isLoading: readingsLoading } = useGetSensorReadings(id);

  if (deviceLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Device not found.</p>
      </div>
    );
  }

  const lastSeen = new Date(Number(device.lastReadingTimestamp) / 1000000);

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-4 rounded-lg bg-accent text-primary">
          <DeviceTypeIcon deviceType={device.deviceType} className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{device.id}</h1>
            <DeviceStatusBadge status={device.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {device.location.building} - {device.location.room}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last seen: {format(lastSeen, 'PPpp')}
            </div>
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device ID</span>
              <span className="font-medium">{device.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{device.deviceType.__kind__}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <DeviceStatusBadge status={device.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Building</span>
              <span className="font-medium">{device.location.building}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">{device.location.room}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Reading</CardTitle>
          </CardHeader>
          <CardContent>
            {readingsLoading ? (
              <Skeleton className="h-20" />
            ) : readings && readings.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="text-2xl font-bold">
                    {readings[readings.length - 1].value} {readings[readings.length - 1].unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span className="font-medium">
                    {format(new Date(Number(readings[readings.length - 1].timestamp) / 1000000), 'PPpp')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No readings available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reading History */}
      {readings && readings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reading History</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorChart data={readings} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
