import { Thermometer, Droplets, Users, Zap, Lightbulb, Wind } from 'lucide-react';
import { DeviceType, SensorType, Variant_toggle_thermostat } from '../backend';

interface DeviceTypeIconProps {
  deviceType: DeviceType;
  className?: string;
}

export default function DeviceTypeIcon({ deviceType, className = 'h-5 w-5' }: DeviceTypeIconProps) {
  if (deviceType.__kind__ === 'sensor') {
    const sensorType = deviceType.sensor;
    
    switch (sensorType) {
      case SensorType.temperature:
        return <Thermometer className={className} />;
      case SensorType.humidity:
        return <Droplets className={className} />;
      case SensorType.occupancy:
        return <Users className={className} />;
      case SensorType.energyConsumption:
        return <Zap className={className} />;
      default:
        return <Thermometer className={className} />;
    }
  } else {
    // Actuator - the actuator field is an enum value, not an object with __kind__
    const actuatorType = deviceType.actuator;
    if (actuatorType === Variant_toggle_thermostat.toggle) {
      return <Lightbulb className={className} />;
    } else {
      return <Wind className={className} />;
    }
  }
}
