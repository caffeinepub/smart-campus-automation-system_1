import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BooleanRuleCondition, SensorType, Variant_notEqualTo_equalTo_greaterThan_lessThan } from '../backend';
import { X } from 'lucide-react';

interface ConditionBuilderProps {
  conditions: BooleanRuleCondition[];
  onChange: (conditions: BooleanRuleCondition[]) => void;
  deviceIds: string[];
}

export default function ConditionBuilder({ conditions, onChange, deviceIds }: ConditionBuilderProps) {
  const addCondition = () => {
    onChange([
      ...conditions,
      {
        deviceId: deviceIds[0] || '',
        sensorType: SensorType.temperature,
        comparison: Variant_notEqualTo_equalTo_greaterThan_lessThan.greaterThan,
        threshold: 0,
      },
    ]);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<BooleanRuleCondition>) => {
    onChange(
      conditions.map((condition, i) =>
        i === index ? { ...condition, ...updates } : condition
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Conditions</Label>
        <Button type="button" size="sm" onClick={addCondition}>
          Add Condition
        </Button>
      </div>
      
      {conditions.map((condition, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Condition {index + 1}</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeCondition(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Device</Label>
              <Select
                value={condition.deviceId}
                onValueChange={(value) => updateCondition(index, { deviceId: value })}
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
              <Label>Sensor Type</Label>
              <Select
                value={condition.sensorType}
                onValueChange={(value) => updateCondition(index, { sensorType: value as SensorType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SensorType.temperature}>Temperature</SelectItem>
                  <SelectItem value={SensorType.humidity}>Humidity</SelectItem>
                  <SelectItem value={SensorType.occupancy}>Occupancy</SelectItem>
                  <SelectItem value={SensorType.energyConsumption}>Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Comparison</Label>
              <Select
                value={condition.comparison}
                onValueChange={(value) => 
                  updateCondition(index, { 
                    comparison: value as Variant_notEqualTo_equalTo_greaterThan_lessThan 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_notEqualTo_equalTo_greaterThan_lessThan.greaterThan}>
                    Greater Than
                  </SelectItem>
                  <SelectItem value={Variant_notEqualTo_equalTo_greaterThan_lessThan.lessThan}>
                    Less Than
                  </SelectItem>
                  <SelectItem value={Variant_notEqualTo_equalTo_greaterThan_lessThan.equalTo}>
                    Equal To
                  </SelectItem>
                  <SelectItem value={Variant_notEqualTo_equalTo_greaterThan_lessThan.notEqualTo}>
                    Not Equal To
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                value={condition.threshold}
                onChange={(e) => updateCondition(index, { threshold: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}
      
      {conditions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No conditions added. Click "Add Condition" to get started.
        </p>
      )}
    </div>
  );
}
