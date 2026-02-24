import { useGetAllRules, useToggleRule, useDeleteRule } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AutomationRules() {
  const { data: rules, isLoading } = useGetAllRules();
  const navigate = useNavigate();
  const toggleRule = useToggleRule();
  const deleteRule = useDeleteRule();

  const handleToggle = async (ruleId: string, enabled: boolean) => {
    try {
      await toggleRule.mutateAsync({ ruleId, enabled });
      toast.success(`Rule ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle rule');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await deleteRule.mutateAsync(ruleId);
      toast.success('Rule deleted successfully');
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automation Rules</h1>
          <p className="text-muted-foreground">Create and manage automation rules for your devices</p>
        </div>
        <Button onClick={() => navigate({ to: '/automation/new' })}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {rules?.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                    />
                    <h3 className="font-semibold">{rule.id}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Conditions: </span>
                      <span>
                        {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actions: </span>
                      <span>
                        {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created by: </span>
                      <span>{rule.createdBy}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate({ to: '/automation/$id/edit', params: { id: rule.id } })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleteRule.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No automation rules created yet.</p>
          <Button onClick={() => navigate({ to: '/automation/new' })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Rule
          </Button>
        </div>
      )}
    </div>
  );
}
