import { useState } from 'react';
import { useGetAllDevices, useGetSensorReadings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import SensorChart from '../components/SensorChart';
import { Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON } from '../utils/exportData';

export default function Analytics() {
  const { data: devices, isLoading: devicesLoading } = useGetAllDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const { data: readings, isLoading: readingsLoading } = useGetSensorReadings(selectedDeviceId);

  const handleExportCSV = () => {
    if (!readings || readings.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(readings, selectedDeviceId);
    toast.success('Data exported to CSV');
  };

  const handleExportJSON = () => {
    if (!readings || readings.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToJSON(readings, selectedDeviceId);
    toast.success('Data exported to JSON');
  };

  if (devicesLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Visualize and analyze historical sensor data</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Data Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.id} - {device.location.building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDeviceId && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      {selectedDeviceId && (
        <Card>
          <CardHeader>
            <CardTitle>Sensor Data Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {readingsLoading ? (
              <Skeleton className="h-80" />
            ) : readings && readings.length > 0 ? (
              <SensorChart data={readings} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No data available for this device
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedDeviceId && (
        <div className="text-center py-12 text-muted-foreground">
          Select a device to view analytics
        </div>
      )}
    </div>
  );
}
