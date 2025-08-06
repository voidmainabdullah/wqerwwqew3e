import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Crown, Shield, UserCheck, UserX, Settings } from 'lucide-react';
interface Team {
  id: string;
  name: string;
  admin_id: string;
  created_at: string;
  is_admin: boolean;
  role: string;
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_share: boolean;
  };
}
interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  permissions: {
    can_view: boolean;
    can_edit: boolean;
    can_share: boolean;
  };
  joined_at: string;
}
export const TeamsManager: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchTeams();
      setupRealtimeSubscriptions();
    }
  }, [user]);
  const setupRealtimeSubscriptions = () => {
    const teamChannel = supabase.channel('teams-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'teams'
    }, () => {
      fetchTeams();
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'team_members'
    }, () => {
      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(teamChannel);
    };
  };
  const fetchTeams = async () => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('get_user_teams', {
        p_user_id: user!.id
      });
      if (error) throw error;
      const mappedTeams = data?.map(team => ({
        id: team.team_id,
        name: team.team_name,
        admin_id: '',
        created_at: '',
        is_admin: team.is_admin,
        role: team.role,
        permissions: team.permissions as any
      })) || [];
      setTeams(mappedTeams);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast({
        variant: "destructive",
        title: "Error fetching teams",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_team_members', {
        p_team_id: teamId
      });
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        variant: "destructive",
        title: "Error fetching team members",
        description: error.message
      });
    }
  };
  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const {
        data: teamData,
        error: teamError
      } = await supabase.from('teams').insert({
        name: newTeamName,
        admin_id: user!.id
      }).select().single();
      if (teamError) throw teamError;

      // Add creator as admin member
      const {
        error: memberError
      } = await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: user!.id,
        role: 'admin',
        permissions: {
          can_view: true,
          can_edit: true,
          can_share: true
        },
        added_by: user!.id
      });
      if (memberError) throw memberError;
      toast({
        title: "Team created successfully",
        description: `${newTeamName} is ready for collaboration`
      });
      setCreateTeamDialogOpen(false);
      setNewTeamName('');
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating team",
        description: error.message
      });
    }
  };
  const addTeamMember = async () => {
    if (!newMemberEmail.trim() || !selectedTeam) return;
    try {
      // Check if user exists
      const {
        data: userData,
      // Check if user exists using the fixed function
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', {
          email_input: newMemberEmail.trim()
        });

      if (userError) {
        console.error('Error checking user:', userError);
        throw new Error(`Failed to find user: ${userError.message}`);
      }

      if (!userData || userData.length === 0) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user found with this email address. They need to create an account first."
        });
        return;
      }

      const targetUser = userData[0];

      // Check if user is already a team member
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', selectedTeam.id)
        .eq('user_id', targetUser.user_id)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking existing membership: ${checkError.message}`);
      }

      if (existingMember) {
        toast({
          variant: "destructive",
          title: "User already in team",
          description: "This user is already a member of this team"
        });
        return;
      }

      // Define permissions based on role
      const permissions = {
        can_view: true,
        can_edit: newMemberRole === 'admin' || newMemberRole === 'member',
        can_share: newMemberRole === 'admin' || newMemberRole === 'member'
      };

      // Add the team member
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam.id,
          user_id: targetUser.user_id,
          role: newMemberRole,
          permissions,
          added_by: user!.id
        });

      if (insertError) {
        console.error('Error inserting team member:', insertError);

      setAddMemberDialogOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('member');
      
      // Refresh both teams and team members
      await fetchTeams();
      await fetchTeamMembers(selectedTeam.id);
      
    } catch (error: any) {
      console.error('Add member error:', error);
      toast({
        variant: "destructive",
        title: "Error adding member",
        description: error.message
      });
    }
  };
  const updateMemberRole = async (memberId: string, newRole: string) => {
    const permissions = {
      can_view: true,
      can_edit: newRole === 'admin' || newRole === 'member',
      can_share: newRole === 'admin' || newRole === 'member'
    };
    try {
      const {
        error
      } = await supabase.from('team_members').update({
        role: newRole,
        permissions
      }).eq('id', memberId);
      if (error) throw error;
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully"
      });
      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message
      });
    }
  };
  const removeMember = async (memberId: string, email: string) => {
    try {
      const {
        error
      } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
      toast({
        title: "Member removed",
        description: `${email} has been removed from the team`
      });
      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing member",
        description: error.message
      });
    }
  };
  const deleteTeam = async (teamId: string, teamName: string) => {
    try {
      const {
        error
      } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;
      toast({
        title: "Team deleted",
        description: `${teamName} has been deleted successfully`
      });
      setSelectedTeam(null);
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting team",
        description: error.message
      });
    }
  };
  if (loading) {
    return <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Collaborate and share files with your team members</p>
        </div>
        <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a team to collaborate and share files with other users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" placeholder="Enter team name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTeam} disabled={!newTeamName.trim()}>
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Teams
            </CardTitle>
            <CardDescription>Teams you're part of</CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams yet</h3>
                <p className="text-muted-foreground">Create a team to start collaborating</p>
              </div> : <div className="space-y-3">
                {teams.map(team => <div key={team.id} className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${selectedTeam?.id === team.id ? 'border-primary bg-accent/30' : 'border-border'}`} onClick={() => {
              setSelectedTeam(team);
              fetchTeamMembers(team.id);
            }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={team.is_admin ? 'default' : 'secondary'} className="text-xs">
                            {team.is_admin ? 'Admin' : team.role}
                          </Badge>
                        </div>
                      </div>
                      {team.is_admin && <div className="flex items-center space-x-1">
                          <Crown className="w-4 h-4 text-yellow-500 bg-transparent" />
                          <Button variant="ghost" size="sm" onClick={e => {
                    e.stopPropagation();
                    deleteTeam(team.id, team.name);
                  }} className="hover:bg-functions-delete/10 hover:text-functions-delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>}
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  {selectedTeam ? `Members of ${selectedTeam.name}` : 'Select a team to view members'}
                </CardDescription>
              </div>
              {selectedTeam?.is_admin && <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to {selectedTeam.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="member-email">Email Address</Label>
                        <Input id="member-email" type="email" placeholder="member@example.com" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="member-role">Role</Label>
                        <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer (Can only view files)</SelectItem>
                            <SelectItem value="member">Member (Can view, edit & share files)</SelectItem>
                            <SelectItem value="admin">Admin (Full access)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addTeamMember} disabled={!newMemberEmail.trim()}>
                        Add Member
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedTeam ? <div className="text-center py-6">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a team to view its members</p>
              </div> : teamMembers.length === 0 ? <div className="text-center py-6">
                <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No members</h3>
                <p className="text-muted-foreground">Add members to start collaborating</p>
              </div> : <div className="space-y-3">
                {teamMembers.map(member => <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {member.role === 'admin' ? <Crown className="w-4 h-4 text-yellow-500" /> : <Users className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium">{member.email}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {member.role}
                          </Badge>
                          <div className="flex space-x-1">
                            {member.permissions?.can_view && <Badge variant="outline" className="text-xs">View</Badge>}
                            {member.permissions?.can_edit && <Badge variant="outline" className="text-xs">Edit</Badge>}
                            {member.permissions?.can_share && <Badge variant="outline" className="text-xs">Share</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedTeam?.is_admin && member.user_id !== user?.id && <div className="flex items-center space-x-2">
                        <Select value={member.role} onValueChange={newRole => updateMemberRole(member.id, newRole)}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => removeMember(member.id, member.email)} className="hover:bg-functions-delete/10 hover:text-functions-delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>}
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};