import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionFeatures {
  maxStorageGB: number | null; // null = unlimited
  maxFileUploadGB: number;
  autoDeleteDays: number | null; // null = no auto-delete
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
    maxStorageGB: 5,
    maxFileUploadGB: 2,
    autoDeleteDays: 2, // 2 days
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
    autoDeleteDays: null, // no auto-delete while subscription active
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
    const userTier = profile?.subscription_tier;
    // Only 'pro' is considered pro, everything else is free
    return userTier === 'pro' ? 'pro' : 'free';
  }, [profile?.subscription_tier]);

  const features = useMemo(() => {
    return SUBSCRIPTION_FEATURES[tier];
  }, [tier]);

  // Simple boolean flags for easy access
  const isPro = tier === 'pro';
  const isFree = tier === 'free';
  // isBasic is an alias for isFree (for backward compatibility)
  const isBasic = isFree;

  const canAccess = (featureName: keyof SubscriptionFeatures): boolean => {
    const value = features[featureName];
    // For boolean features, return the value directly
    if (typeof value === 'boolean') {
      return value;
    }
    // For numeric features (like storage), return true if they have any allocation
    return value !== null && value > 0;
  };

  // Get subscription dates from profile (cast to any to access properties)
  const profileAny = profile as any;
  const subscriptionStatus = profileAny?.subscription_status || 'active';
  const subscriptionEndDate = profileAny?.subscription_end_date 
    ? new Date(profileAny.subscription_end_date) 
    : null;

  return {
    tier,
    features,
    isPro,
    isFree,
    isBasic, // Alias for isFree
    canAccess,
    subscriptionStatus,
    subscriptionEndDate,
  };
};
