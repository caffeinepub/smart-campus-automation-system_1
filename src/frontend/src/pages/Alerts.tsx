import { useState } from 'react';
import { useGetAllAlerts, useAcknowledgeAlert, useDeleteAlert } from '../hooks/useQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AlertCard from '../components/AlertCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Variant_warning_info_critical } from '../backend';

export default function Alerts() {
  const { data: alerts, isLoading } = useGetAllAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const deleteAlert = useDeleteAlert();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAlerts = alerts?.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'acknowledged' && alert.acknowledged) ||
      (statusFilter === 'unacknowledged' && !alert.acknowledged);
    
    return matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert.mutateAsync(id);
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert.mutateAsync(id);
      toast.success('Alert deleted');
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alerts</h1>
        <p className="text-muted-foreground">Monitor and manage system alerts</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value={Variant_warning_info_critical.critical}>Critical</SelectItem>
            <SelectItem value={Variant_warning_info_critical.warning}>Warning</SelectItem>
            <SelectItem value={Variant_warning_info_critical.info}>Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="grid gap-4">
        {filteredAlerts?.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onDelete={handleDelete}
            isAcknowledging={acknowledgeAlert.isPending}
            isDeleting={deleteAlert.isPending}
          />
        ))}
      </div>

      {filteredAlerts?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No alerts found matching your criteria.
        </div>
      )}
    </div>
  );
}
