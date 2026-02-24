import { SensorReading } from '../backend';
import { format } from 'date-fns';

export function exportToCSV(data: SensorReading[], deviceId: string) {
  const headers = ['Timestamp', 'Device ID', 'Sensor Type', 'Value', 'Unit'];
  const rows = data.map((reading) => [
    format(new Date(Number(reading.timestamp) / 1000000), 'yyyy-MM-dd HH:mm:ss'),
    reading.deviceId,
    reading.sensorType,
    reading.value.toString(),
    reading.unit,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `sensor-data-${deviceId}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: SensorReading[], deviceId: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `sensor-data-${deviceId}-${format(new Date(), 'yyyy-MM-dd')}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
