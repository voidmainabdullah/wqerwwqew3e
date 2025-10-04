import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Clock, HardDrive, FileText, Globe } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamPolicy {
  id: string;
  team_id: string;
  allow_external_sharing: boolean;
  require_password_for_shares: boolean;
  default_share_expiry_days: number | null;
  max_file_size_mb: number | null;
  allowed_file_types: string[] | null;
  require_2fa: boolean;
  auto_join_domain: string | null;
  retention_days: number | null;
}

interface TeamPoliciesManagerProps {
  teamId: string;
}

export function TeamPoliciesManager({ teamId }: TeamPoliciesManagerProps) {
  const { user } = useAuth();
  const [policy, setPolicy] = useState<TeamPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, [teamId]);

  // Real-time subscription for policy changes
  useEffect(() => {
    const channel = supabase
      .channel('team-policies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_policies',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchPolicy();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_policies')
        .select('*')
        .eq('team_id', teamId)
        .maybeSingle();

      if (error) throw error;
      setPolicy(data);
    } catch (error) {
      console.error('Error fetching policy:', error);
      toast.error('Failed to load team policies');
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (updates: Partial<TeamPolicy>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('team_policies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('team_id', teamId);

      if (error) throw error;

      await supabase.rpc('log_audit_event', {
        _team_id: teamId,
        _user_id: user?.id,
        _action: 'policy_updated',
        _entity_type: 'team_policy',
        _entity_id: policy?.id,
        _metadata: updates
      });

      setPolicy(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Policy updated successfully');
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary" weight="duotone" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No policies configured</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" weight="duotone" />
          Team Policies
        </h2>
        <p className="text-muted-foreground">
          Configure security and compliance settings for your team
        </p>
      </div>

      <div className="grid gap-6">
        {/* Sharing Policies */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div>
                <CardTitle>Sharing Policies</CardTitle>
                <CardDescription>Control how files can be shared</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow External Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow team members to share files outside the team
                </p>
              </div>
              <Switch
                checked={policy.allow_external_sharing}
                onCheckedChange={(checked) => updatePolicy({ allow_external_sharing: checked })}
                disabled={saving}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Password for Shares</Label>
                <p className="text-sm text-muted-foreground">
                  Force password protection on all shared links
                </p>
              </div>
              <Switch
                checked={policy.require_password_for_shares}
                onCheckedChange={(checked) => updatePolicy({ require_password_for_shares: checked })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Share Expiry (days)</Label>
              <Input
                type="number"
                value={policy.default_share_expiry_days || ''}
                onChange={(e) => updatePolicy({ default_share_expiry_days: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="No expiry"
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Policies */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div>
                <CardTitle>Security Policies</CardTitle>
                <CardDescription>Enhance team security settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enforce 2FA for all team members
                </p>
              </div>
              <Switch
                checked={policy.require_2fa}
                onCheckedChange={(checked) => updatePolicy({ require_2fa: checked })}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Auto-join Domain</Label>
              <Input
                type="text"
                value={policy.auto_join_domain || ''}
                onChange={(e) => updatePolicy({ auto_join_domain: e.target.value || null })}
                placeholder="example.com"
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Users with this email domain can auto-join the team
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File Policies */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div>
                <CardTitle>File Policies</CardTitle>
                <CardDescription>Control file uploads and storage</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum File Size (MB)</Label>
              <Input
                type="number"
                value={policy.max_file_size_mb || ''}
                onChange={(e) => updatePolicy({ max_file_size_mb: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="No limit"
                className="max-w-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Retention (days)</Label>
              <Input
                type="number"
                value={policy.retention_days || ''}
                onChange={(e) => updatePolicy({ retention_days: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Keep forever"
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Automatically delete files after this many days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}