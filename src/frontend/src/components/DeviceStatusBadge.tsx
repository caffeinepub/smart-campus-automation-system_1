import { Badge } from '@/components/ui/badge';
import { Variant_maintenance_offline_online } from '../backend';

interface DeviceStatusBadgeProps {
  status: Variant_maintenance_offline_online;
}

export default function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  const variants = {
    [Variant_maintenance_offline_online.online]: { label: 'Online', className: 'bg-success text-white' },
    [Variant_maintenance_offline_online.offline]: { label: 'Offline', className: 'bg-secondary text-white' },
    [Variant_maintenance_offline_online.maintenance]: { label: 'Maintenance', className: 'bg-warning text-white' },
  };

  const config = variants[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
