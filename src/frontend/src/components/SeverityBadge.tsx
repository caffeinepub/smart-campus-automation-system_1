import { Badge } from '@/components/ui/badge';
import { Variant_warning_info_critical } from '../backend';

interface SeverityBadgeProps {
  severity: Variant_warning_info_critical;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const variants = {
    [Variant_warning_info_critical.critical]: { label: 'Critical', className: 'bg-destructive text-white' },
    [Variant_warning_info_critical.warning]: { label: 'Warning', className: 'bg-warning text-white' },
    [Variant_warning_info_critical.info]: { label: 'Info', className: 'bg-info text-white' },
  };

  const config = variants[severity];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
