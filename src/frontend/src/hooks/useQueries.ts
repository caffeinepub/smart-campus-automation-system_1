import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Device, SensorReading, AutomationRule, Alert, Recommendation } from '../backend';

// Device queries
export function useGetAllDevices() {
  const { actor, isFetching } = useActor();

  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDevices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDevice(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Device | null>({
    queryKey: ['device', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDevice(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetSensorReadings(deviceId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SensorReading[]>({
    queryKey: ['sensorReadings', deviceId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSensorReadings(deviceId);
    },
    enabled: !!actor && !isFetching && !!deviceId,
  });
}

export function useGetLatestSensorReading(deviceId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<SensorReading | null>({
    queryKey: ['latestSensorReading', deviceId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestSensorReading(deviceId);
    },
    enabled: !!actor && !isFetching && !!deviceId,
  });
}

// Automation rules queries
export function useGetAllRules() {
  const { actor, isFetching } = useActor();

  return useQuery<AutomationRule[]>({
    queryKey: ['automationRules'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRule(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AutomationRule | null>({
    queryKey: ['automationRule', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRule(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateOrUpdateRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: AutomationRule) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });
}

export function useToggleRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleRule(ruleId, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });
}

export function useDeleteRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteRule(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
    },
  });
}

// Alert queries
export function useGetAllAlerts() {
  const { actor, isFetching } = useActor();

  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUnacknowledgedAlerts() {
  const { actor, isFetching } = useActor();

  return useQuery<Alert[]>({
    queryKey: ['unacknowledgedAlerts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnacknowledgedAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAcknowledgeAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acknowledgeAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['unacknowledgedAlerts'] });
    },
  });
}

export function useDeleteAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['unacknowledgedAlerts'] });
    },
  });
}

// Recommendation queries
export function useGetRecommendations() {
  const { actor, isFetching } = useActor();

  return useQuery<Recommendation[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecommendations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateRecommendations() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateRecommendations();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useDeleteRecommendation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteRecommendation(recId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
