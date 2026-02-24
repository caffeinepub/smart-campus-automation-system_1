import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRule, useCreateOrUpdateRule, useGetAllDevices } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConditionBuilder from '../components/ConditionBuilder';
import ActionBuilder from '../components/ActionBuilder';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AutomationRule, BooleanRuleCondition } from '../backend';

// Define the action type to match the backend interface exactly
type RuleAction = {
  deviceId: string;
  command: 
    | { __kind__: 'turnOn'; turnOn: null }
    | { __kind__: 'turnOff'; turnOff: null }
    | { __kind__: 'setTemperature'; setTemperature: number };
};

export default function RuleEditor() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const ruleId = params.id;
  const isEditing = !!ruleId;

  const { data: rule, isLoading: ruleLoading } = useGetRule(ruleId || '');
  const { data: devices } = useGetAllDevices();
  const createOrUpdate = useCreateOrUpdateRule();

  const [ruleData, setRuleData] = useState<{
    id: string;
    conditions: BooleanRuleCondition[];
    actions: RuleAction[];
    enabled: boolean;
    createdBy: string;
    lastModified: bigint;
  }>({
    id: '',
    conditions: [],
    actions: [],
    enabled: true,
    createdBy: 'current-user',
    lastModified: BigInt(Date.now() * 1000000),
  });

  useEffect(() => {
    if (rule && isEditing) {
      setRuleData({
        id: rule.id,
        conditions: rule.conditions,
        actions: rule.actions,
        enabled: rule.enabled,
        createdBy: rule.createdBy,
        lastModified: rule.lastModified,
      });
    }
  }, [rule, isEditing]);

  const deviceIds = devices?.map(d => d.id) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleData.id?.trim()) {
      toast.error('Please enter a rule ID');
      return;
    }

    if (ruleData.conditions?.length === 0) {
      toast.error('Please add at least one condition');
      return;
    }

    if (ruleData.actions?.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    try {
      await createOrUpdate.mutateAsync({
        id: ruleData.id,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        enabled: ruleData.enabled,
        createdBy: ruleData.createdBy,
        lastModified: BigInt(Date.now() * 1000000),
      });
      
      toast.success(`Rule ${isEditing ? 'updated' : 'created'} successfully`);
      navigate({ to: '/automation' });
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} rule`);
    }
  };

  if (ruleLoading && isEditing) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/automation' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Rule' : 'Create New Rule'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleId">Rule ID *</Label>
              <Input
                id="ruleId"
                value={ruleData.id}
                onChange={(e) => setRuleData({ ...ruleData, id: e.target.value })}
                placeholder="e.g., temp-control-lab-1"
                disabled={isEditing}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ConditionBuilder
              conditions={ruleData.conditions}
              onChange={(conditions) => setRuleData({ ...ruleData, conditions })}
              deviceIds={deviceIds}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionBuilder
              actions={ruleData.actions}
              onChange={(actions) => setRuleData({ ...ruleData, actions })}
              deviceIds={deviceIds}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={createOrUpdate.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createOrUpdate.isPending ? 'Saving...' : 'Save Rule'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/automation' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
