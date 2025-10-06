import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Envelope, UserPlus, Crown, Shield, User, Eye, CheckCircle, XCircle, Clock, Copy } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest' | 'readonly';
  invited_by: string;
  invite_token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

interface TeamInvitesManagerProps {
  teamId: string;
}

export function TeamInvitesManager({ teamId }: TeamInvitesManagerProps) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'guest' | 'readonly'>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, [teamId]);

  // Real-time subscription for invites
  useEffect(() => {
    const channel = supabase
      .channel('team-invites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invites',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites((data || []).map(d => ({ ...d, status: d.status as any })));
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setInviting(true);
      
      // Check if user exists
      const { data: userExists, error: userError } = await supabase
        .rpc('get_user_by_email', { email_input: inviteEmail });

      if (userError) throw userError;

      if (!userExists || userExists.length === 0) {
        toast.error('No registered user found with this email');
        return;
      }

      const invitedUserId = userExists[0].user_id;
      const inviteToken = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Get team name
      const { data: teamData } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();

      const { error } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          email: inviteEmail,
          role: inviteRole,
          invited_by: user?.id,
          invite_token: inviteToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          user_id: invitedUserId,
          type: 'team_invite',
          title: 'Team Invitation',
          message: `You've been invited to join ${teamData?.name || 'a team'}`,
          data: {
            team_id: teamId,
            invite_token: inviteToken,
            team_name: teamData?.name,
            role: inviteRole
          }
        });

      await supabase.rpc('log_audit_event', {
        _team_id: teamId,
        _user_id: user?.id,
        _action: 'invite_sent',
        _entity_type: 'team_invite',
        _metadata: { email: inviteEmail, role: inviteRole }
      });

      toast.success(`Invite sent to ${inviteEmail}`);

      setInviteEmail('');
      setShowInviteDialog(false);
      fetchInvites();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success('Invite revoked successfully');
      fetchInvites();
    } catch (error) {
      console.error('Error revoking invite:', error);
      toast.error('Failed to revoke invite');
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteLink = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'guest': return <User className="h-4 w-4 text-purple-500" />;
      case 'readonly': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle className="h-3 w-3 mr-1" /> Accepted
        </Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'expired':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Expired
        </Badge>;
      case 'revoked':
        return <Badge variant="outline" className="text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" /> Revoked
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Envelope className="h-6 w-6 text-primary" weight="duotone" />
            Team Invites
          </h2>
          <p className="text-muted-foreground">Manage team member invitations</p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <UserPlus className="h-4 w-4" weight="bold" />
              Send Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Team Invite</DialogTitle>
              <DialogDescription>
                Invite a new member to join your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="readonly">Read-only - View files only</SelectItem>
                    <SelectItem value="guest">Guest - Limited access</SelectItem>
                    <SelectItem value="member">Member - Full collaboration</SelectItem>
                    <SelectItem value="admin">Admin - Manage team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvite} disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invites.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Envelope className="h-10 w-10 text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No invites yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Start inviting members to collaborate on your team
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <Card key={invite.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                      <Envelope className="h-6 w-6 text-primary-foreground" weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-foreground truncate">{invite.email}</p>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(invite.role)}
                          <Badge variant="outline" className="capitalize">{invite.role}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span>Sent {new Date(invite.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invite.status)}
                    {invite.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.invite_token)}
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Copy className="h-4 w-4" weight="duotone" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeInvite(invite.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4" weight="duotone" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}