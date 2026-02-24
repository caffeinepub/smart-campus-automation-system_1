import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

// Define the action type to match the backend interface exactly
type RuleAction = {
  deviceId: string;
  command: 
    | { __kind__: 'turnOn'; turnOn: null }
    | { __kind__: 'turnOff'; turnOff: null }
    | { __kind__: 'setTemperature'; setTemperature: number };
};

interface ActionBuilderProps {
  actions: RuleAction[];
  onChange: (actions: RuleAction[]) => void;
  deviceIds: string[];
}

export default function ActionBuilder({ actions, onChange, deviceIds }: ActionBuilderProps) {
  const addAction = () => {
    onChange([
      ...actions,
      {
        deviceId: deviceIds[0] || '',
        command: { __kind__: 'turnOn', turnOn: null },
      },
    ]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<RuleAction>) => {
    onChange(
      actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      )
    );
  };

  const updateCommand = (index: number, commandType: string, value?: number) => {
    const action = actions[index];
    let command: RuleAction['command'];
    
    if (commandType === 'turnOn') {
      command = { __kind__: 'turnOn', turnOn: null };
    } else if (commandType === 'turnOff') {
      command = { __kind__: 'turnOff', turnOff: null };
    } else {
      command = { __kind__: 'setTemperature', setTemperature: value || 20 };
    }
    
    updateAction(index, { command });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Actions</Label>
        <Button type="button" size="sm" onClick={addAction}>
          Add Action
        </Button>
      </div>
      
      {actions.map((action, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Action {index + 1}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeAction(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Device</Label>
              <Select
                value={action.deviceId}
                onValueChange={(value) => updateAction(index, { deviceId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deviceIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Command</Label>
              <Select
                value={action.command.__kind__}
                onValueChange={(value) => updateCommand(index, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turnOn">Turn On</SelectItem>
                  <SelectItem value="turnOff">Turn Off</SelectItem>
                  <SelectItem value="setTemperature">Set Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {action.command.__kind__ === 'setTemperature' && (
              <div className="space-y-2 col-span-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  value={action.command.setTemperature || 20}
                  onChange={(e) => updateCommand(index, 'setTemperature', parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
      ))}
      
      {actions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No actions added. Click "Add Action" to get started.
        </p>
      )}
    </div>
  );
}
