import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionFeatures {
  maxStorageGB: number | null; // null = unlimited
  maxFileUploadGB: number;
  autoDeleteHours: number | null; // null = no auto-delete
  customExpiry: boolean;
  downloadLimits: boolean;
  passwordProtection: boolean;
  analytics: boolean;
  virusScan: boolean;
  teamSharing: boolean;
  aiOrganizer: boolean;
  prioritySupport: boolean;
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxStorageGB: 2,
    maxFileUploadGB: 0.5, // 500MB
    autoDeleteHours: 48, // 2 days
    customExpiry: false,
    downloadLimits: false,
    passwordProtection: false,
    analytics: false,
    virusScan: false,
    teamSharing: false,
    aiOrganizer: false,
    prioritySupport: false,
  },
  basic: {
    maxStorageGB: 5,
    maxFileUploadGB: 2,
    autoDeleteHours: 48, // 2 days
    customExpiry: false,
    downloadLimits: false,
    passwordProtection: false,
    analytics: false,
    virusScan: false,
    teamSharing: false,
    aiOrganizer: false,
    prioritySupport: false,
  },
  pro: {
    maxStorageGB: null, // unlimited
    maxFileUploadGB: 10,
    autoDeleteHours: null,
    customExpiry: true,
    downloadLimits: true,
    passwordProtection: true,
    analytics: true,
    virusScan: true,
    teamSharing: true,
    aiOrganizer: true,
    prioritySupport: true,
  },
};

export const useSubscription = () => {
  const { profile } = useAuth();

  const tier: SubscriptionTier = useMemo(() => {
    const userTier = profile?.subscription_tier as SubscriptionTier;
    return userTier || 'free';
  }, [profile?.subscription_tier]);

  const features = useMemo(() => {
    return SUBSCRIPTION_FEATURES[tier];
  }, [tier]);

  const isPro = tier === 'pro';
  const isBasic = tier === 'basic';
  const isFree = tier === 'free';

  const canAccess = (featureName: keyof SubscriptionFeatures): boolean => {
    return features[featureName] === true;
  };

  return {
    tier,
    features,
    isPro,
    isBasic,
    isFree,
    canAccess,
  };
};