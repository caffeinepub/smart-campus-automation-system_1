import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '../backend';
import SeverityBadge from './SeverityBadge';
import { Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onDelete: (id: string) => void;
  isAcknowledging?: boolean;
  isDeleting?: boolean;
}

export default function AlertCard({ 
  alert, 
  onAcknowledge, 
  onDelete, 
  isAcknowledging, 
  isDeleting 
}: AlertCardProps) {
  const timestamp = new Date(Number(alert.timestamp) / 1000000);

  return (
    <Card className={alert.acknowledged ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={alert.severity} />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="font-medium">{alert.message}</p>
            <p className="text-sm text-muted-foreground">Device: {alert.deviceId}</p>
          </div>
          <div className="flex gap-2">
            {!alert.acknowledged && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alert.id)}
                disabled={isAcknowledging}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(alert.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
