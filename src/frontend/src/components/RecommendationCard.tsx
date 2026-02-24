import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recommendation, Variant_operationalEfficiency_energySavings_spaceUtilization } from '../backend';
import { Lightbulb, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
  isDismissing?: boolean;
}

export default function RecommendationCard({ 
  recommendation, 
  onDismiss, 
  isDismissing 
}: RecommendationCardProps) {
  const timestamp = new Date(Number(recommendation.timestamp) / 1000000);
  
  const categoryLabels: Record<Variant_operationalEfficiency_energySavings_spaceUtilization, string> = {
    [Variant_operationalEfficiency_energySavings_spaceUtilization.energySavings]: 'Energy Savings',
    [Variant_operationalEfficiency_energySavings_spaceUtilization.spaceUtilization]: 'Space Utilization',
    [Variant_operationalEfficiency_energySavings_spaceUtilization.operationalEfficiency]: 'Operational Efficiency',
  };

  const categoryColors: Record<Variant_operationalEfficiency_energySavings_spaceUtilization, string> = {
    [Variant_operationalEfficiency_energySavings_spaceUtilization.energySavings]: 'bg-success text-white',
    [Variant_operationalEfficiency_energySavings_spaceUtilization.spaceUtilization]: 'bg-info text-white',
    [Variant_operationalEfficiency_energySavings_spaceUtilization.operationalEfficiency]: 'bg-warning text-white',
  };

  // The category field is an enum value, not an object with __kind__
  const categoryValue = recommendation.category as unknown as Variant_operationalEfficiency_energySavings_spaceUtilization;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent text-primary">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className={categoryColors[categoryValue]}>
                  {categoryLabels[categoryValue]}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(timestamp, { addSuffix: true })}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(recommendation.id)}
                disabled={isDismissing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-base">{recommendation.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-primary">Estimated Impact:</span>
              <span className="text-muted-foreground">{recommendation.estimatedImpact}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
