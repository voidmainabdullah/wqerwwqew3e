import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Crown, Shield, User, Envelope, Calendar, Trash, Gear } from 'phosphor-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'member';
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_share: boolean;
  };
  joined_at: string;
}

interface Team {
  id: string;
  name: string;
  admin_id: string;
}

interface MemberManagementProps {
  team: Team;
  onClose: () => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ team, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviting, setInviting] = useState(false);

  const isTeamAdmin = team.admin_id === user?.id;

  useEffect(() => {
    fetchMembers();
  }, [team.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_team_members', { p_team_id: team.id });

      if (error) throw error;
      setMembers((data || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member',
        permissions: typeof member.permissions === 'object' ? member.permissions as any : {
          can_view: true,
          can_edit: false,
          can_share: false
        }
      })));
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        variant: "destructive",
        title: "Failed to load members",
        description: "Could not fetch team members."
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address."
      });
      return;
    }

    try {
      setInviting(true);
      
      // First, check if user exists
      const { data: userExists, error: userError } = await supabase
        .rpc('get_user_by_email', { email_input: inviteEmail });

      if (userError) throw userError;

      if (!userExists || userExists.length === 0) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user found with this email address."
        });
        return;
      }

      const userId = userExists[0].user_id;

      // Check if already a member
      const existingMember = members.find(m => m.user_id === userId);
      if (existingMember) {
        toast({
          variant: "destructive",
          title: "Already a member",
          description: "This user is already a team member."
        });
        return;
      }

      // Add to team
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: inviteRole,
          permissions: {
            can_view: true,
            can_edit: inviteRole === 'admin',
            can_share: inviteRole === 'admin'
          },
          added_by: user?.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Member invited",
        description: "Team member has been successfully added."
      });

      setInviteEmail('');
      setShowInviteDialog(false);
      fetchMembers();
      
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        variant: "destructive",
        title: "Failed to invite member",
        description: "Could not add the team member."
      });
    } finally {
      setInviting(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          role: newRole,
          permissions: {
            can_view: true,
            can_edit: newRole === 'admin',
            can_share: newRole === 'admin'
          }
        })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully."
      });

      fetchMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: "Could not update member role."
      });
    }
  };

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === team.admin_id) {
      toast({
        variant: "destructive",
        title: "Cannot remove team admin",
        description: "Team admin cannot be removed from the team."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Team member has been removed successfully."
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        variant: "destructive",
        title: "Failed to remove member",
        description: "Could not remove team member."
      });
    }
  };

  const getRoleIcon = (role: string, userId: string) => {
    if (userId === team.admin_id) {
      return <Crown className="h-4 w-4 text-amber-500" />;
    }
    return role === 'admin' ? 
      <Shield className="h-4 w-4 text-blue-500" /> : 
      <User className="h-4 w-4 text-gray-500" />;
  };

  const getRoleBadge = (role: string, userId: string) => {
    if (userId === team.admin_id) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Owner</Badge>;
    }
    return (
      <Badge variant={role === 'admin' ? 'secondary' : 'outline'}>
        {role === 'admin' ? 'Admin' : 'Member'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{team.name} Members</h3>
          <p className="text-muted-foreground">{members.length} total member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {isTeamAdmin && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your team by their email address.
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
                  <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={inviteMember}
                    disabled={inviting}
                  >
                    {inviting ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {member.display_name || member.email}
                    </p>
                    {getRoleIcon(member.role, member.user_id)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Envelope className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {getRoleBadge(member.role, member.user_id)}
                
                {isTeamAdmin && member.user_id !== team.admin_id && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(value: 'admin' | 'member') => updateMemberRole(member.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id, member.user_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No team members yet</p>
        </div>
      )}
    </div>
  );
};