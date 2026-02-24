import { useGetRecommendations, useGenerateRecommendations, useDeleteRecommendation } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import RecommendationCard from '../components/RecommendationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Recommendations() {
  const { data: recommendations, isLoading } = useGetRecommendations();
  const generateRecs = useGenerateRecommendations();
  const deleteRec = useDeleteRecommendation();

  const handleGenerate = async () => {
    try {
      await generateRecs.mutateAsync();
      toast.success('New recommendations generated');
    } catch (error) {
      toast.error('Failed to generate recommendations');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await deleteRec.mutateAsync(id);
      toast.success('Recommendation dismissed');
    } catch (error) {
      toast.error('Failed to dismiss recommendation');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations for optimizing campus operations
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generateRecs.isPending}>
          <Sparkles className="h-4 w-4 mr-2" />
          {generateRecs.isPending ? 'Generating...' : 'Generate New'}
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="grid gap-4">
        {recommendations?.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onDismiss={handleDismiss}
            isDismissing={deleteRec.isPending}
          />
        ))}
      </div>

      {recommendations?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No recommendations available. Generate insights based on current data.
          </p>
          <Button onClick={handleGenerate} disabled={generateRecs.isPending}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}
