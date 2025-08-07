import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Settings, Trash2, UserPlus, Crown, Shield } from 'lucide-react';

interface Team {
  team_id: string;
  team_name: string;
  is_admin: boolean;
  role: string;
  permissions: any;
}

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  permissions: any;
  joined_at: string;
}

export const TeamsManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  useEffect(() => {
    if (user) {
      fetchTeams();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        console.log('Teams table changed, refreshing...');
        fetchTeams();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        console.log('Team members changed, refreshing...');
        if (selectedTeam) {
          fetchTeamMembers(selectedTeam.team_id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTeams = async () => {
    try {
      console.log('Fetching teams for user:', user?.id);
      const { data, error } = await supabase.rpc('get_user_teams', {
        p_user_id: user!.id
      });

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      console.log('Teams fetched successfully:', data?.length || 0);
      setTeams(data || []);
    } catch (error: any) {
      console.error('Failed to fetch teams:', error);
      toast({
        variant: "destructive",
        title: "Error loading teams",
        description: error.message || "Failed to load your teams. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      console.log('Fetching team members for team:', teamId);
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          permissions,
          joined_at,
          profiles!team_members_user_id_fkey(email, display_name)
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        // Fallback to RPC function if direct query fails
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_team_members', {
          p_team_id: teamId
        });

        if (rpcError) {
          console.error('RPC fallback also failed:', rpcError);
          throw rpcError;
        }
        
        setTeamMembers(Array.isArray(rpcData) ? rpcData : []);
      } else {
        // Transform the data to match expected format
        const transformedData = data.map(member => ({
          id: member.id,
          user_id: member.user_id,
          email: (member.profiles as any)?.email || 'Unknown',
          display_name: (member.profiles as any)?.display_name || 'Unknown',
          role: member.role,
          permissions: member.permissions,
          joined_at: member.joined_at
        }));
        setTeamMembers(transformedData);
      }

      console.log('Team members fetched successfully:', teamMembers.length);
    } catch (error: any) {
      console.error('Failed to fetch team members:', error);
      toast({
        variant: "destructive",
        title: "Error loading team members",
        description: error.message || "Failed to load team members.",
      });
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Team name required",
        description: "Please enter a team name.",
      });
      return;
    }

    try {
      console.log('Creating team:', newTeamName);
      
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeamName.trim(),
          admin_id: user!.id
        })
        .select()
        .single();

      if (teamError) {
        console.error('Team creation error:', teamError);
        throw teamError;
      }

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user!.id,
          role: 'admin',
          added_by: user!.id,
          permissions: {
            can_view: true,
            can_edit: true,
            can_share: true,
            can_manage_members: true
          }
        });

      if (memberError) {
        console.error('Member addition error:', memberError);
        // Don't throw here, team was created successfully
      }

      console.log('Team created successfully:', teamData.name);
      toast({
        title: "Team created",
        description: `Team "${newTeamName}" has been created successfully.`,
      });

      setNewTeamName('');
      setCreateTeamOpen(false);
      fetchTeams();
    } catch (error: any) {
      console.error('Team creation failed:', error);
      toast({
        variant: "destructive",
        title: "Team creation failed",
        description: error.message || "Failed to create team. Please try again.",
      });
    }
  };

  const addTeamMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a valid email address.",
      });
      return;
    }

    try {
      console.log('Adding team member:', newMemberEmail, 'to team:', selectedTeam.team_id);

      // First, find the user by email
      const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', {
        email_input: newMemberEmail.trim()
      });

      if (userError) {
        console.error('User lookup error:', userError);
        throw userError;
      }

      if (!userData || userData.length === 0) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user found with this email address. They need to create an account first.",
        });
        return;
      }

      const targetUser = userData[0];

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', selectedTeam.team_id)
        .eq('user_id', targetUser.user_id)
        .single();

      if (existingMember) {
        toast({
          variant: "destructive",
          title: "User already a member",
          description: "This user is already a member of the team.",
        });
        return;
      }

      // Add the member
      const permissions = {
        can_view: true,
        can_edit: newMemberRole === 'admin' || newMemberRole === 'editor',
        can_share: newMemberRole === 'admin' || newMemberRole === 'editor',
        can_manage_members: newMemberRole === 'admin'
      };

      const { error: addError } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam.team_id,
          user_id: targetUser.user_id,
          role: newMemberRole,
          added_by: user!.id,
          permissions: permissions
        });

      if (addError) {
        console.error('Member addition error:', addError);
        throw addError;
      }

      console.log('Team member added successfully:', newMemberEmail);
      toast({
        title: "Member added",
        description: `${newMemberEmail} has been added to the team.`,
      });

      setNewMemberEmail('');
      setNewMemberRole('member');
      setAddMemberOpen(false);
      fetchTeamMembers(selectedTeam.team_id);
    } catch (error: any) {
      console.error('Add member failed:', error);
      toast({
        variant: "destructive",
        title: "Add member failed",
        description: error.message || "Failed to add team member. Please try again.",
      });
    }
  };

  const removeTeamMember = async (memberId: string, memberEmail: string) => {
    if (!selectedTeam) return;

    const confirmed = window.confirm(`Are you sure you want to remove ${memberEmail} from the team?`);
    if (!confirmed) return;

    try {
      console.log('Removing team member:', memberId);

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Member removal error:', error);
        throw error;
      }

      console.log('Team member removed successfully:', memberEmail);
      toast({
        title: "Member removed",
        description: `${memberEmail} has been removed from the team.`,
      });

      fetchTeamMembers(selectedTeam.team_id);
    } catch (error: any) {
      console.error('Remove member failed:', error);
      toast({
        variant: "destructive",
        title: "Remove member failed",
        description: error.message || "Failed to remove team member.",
      });
    }
  };

  const deleteTeam = async (team: Team) => {
    const confirmed = window.confirm(`Are you sure you want to delete the team "${team.team_name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      console.log('Deleting team:', team.team_id);

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.team_id);

      if (error) {
        console.error('Team deletion error:', error);
        throw error;
      }

      console.log('Team deleted successfully:', team.team_name);
      toast({
        title: "Team deleted",
        description: `Team "${team.team_name}" has been deleted.`,
      });

      if (selectedTeam?.team_id === team.team_id) {
        setSelectedTeam(null);
        setTeamMembers([]);
      }
      fetchTeams();
    } catch (error: any) {
      console.error('Team deletion failed:', error);
      toast({
        variant: "destructive",
        title: "Team deletion failed",
        description: error.message || "Failed to delete team.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teams</h2>
          <p className="text-muted-foreground">Collaborate and share files with your team members</p>
        </div>
        
        <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
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
                Create a team to collaborate and share files with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to start collaborating with others.
              </p>
              <Button onClick={() => setCreateTeamOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Team
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Teams</h3>
            {teams.map((team, index) => (
              <Card 
                key={team.team_id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-md animate-fade-in ${
                  selectedTeam?.team_id === team.team_id ? 'ring-2 ring-primary' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setSelectedTeam(team);
                  fetchTeamMembers(team.team_id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{team.team_name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={team.is_admin ? 'default' : 'secondary'} className="text-xs">
                            {team.is_admin ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              team.role
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {team.is_admin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTeam(team);
                        }}
                        className="hover:text-functions-delete hover:bg-functions-delete/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {selectedTeam ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  {selectedTeam.is_admin && (
                    <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="hover:scale-105 transition-transform">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Team Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to "{selectedTeam.team_name}"
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="memberEmail">Email Address</Label>
                            <Input
                              id="memberEmail"
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="Enter member's email"
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addTeamMember}>Add Member</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <Card 
                      key={member.id} 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {member.display_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {member.display_name || member.email}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {member.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                              {member.role}
                            </Badge>
                            {selectedTeam.is_admin && member.user_id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeamMember(member.id, member.email)}
                                className="hover:text-functions-delete hover:bg-functions-delete/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-muted-foreground">
                    <Shield className="mx-auto h-8 w-8 mb-2" />
                    <p>Select a team to view its members</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};