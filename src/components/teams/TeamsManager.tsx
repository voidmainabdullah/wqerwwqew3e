import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Crown, UserCheck, UserX, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MemberManagement from './MemberManagement';

interface Team {
  id: string;
  name: string;
  admin_id: string;
  created_at: string;
  is_admin: boolean;
  role: string;
  permissions: any;
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

const TeamsManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeams();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    const teamChannel = supabase
      .channel('teams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchTeams();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        if (selectedTeam) {
          fetchTeamMembers(selectedTeam.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(teamChannel);
    };
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_teams', {
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
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          permissions,
          joined_at,
          profiles!team_members_user_id_fkey(email)
        `)
        .eq('team_id', teamId);

      if (error) throw error;

      const membersWithEmails = data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        email: (member.profiles as any)?.email || 'Unknown',
        role: member.role,
        permissions: member.permissions as any,
        joined_at: member.joined_at
      })) || [];

      setTeamMembers(membersWithEmails);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        variant: "destructive",
        title: "Error fetching team members",
        description: error.message,
      });
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        variant: "destructive",
        title: "Team name required",
        description: "Please enter a team name",
      });
      return;
    }

    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          admin_id: user!.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
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
        title: "Team created",
        description: `${newTeamName} has been created successfully`,
      });

      setNewTeamName('');
      setCreateTeamDialogOpen(false);
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating team",
        description: error.message,
      });
    }
  };

  const addTeamMember = async (email: string, role: string) => {
    try {
      // First, check if user exists
      const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', {
        email_input: email
      });

      if (userError) throw userError;
      
      if (!userData || userData.length === 0) {
        throw new Error('User not found with this email address');
      }

      const targetUserId = userData[0].user_id;

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', selectedTeam!.id)
        .eq('user_id', targetUserId)
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this team');
      }

      const permissions = {
        can_view: true,
        can_edit: role === 'member' || role === 'admin',
        can_share: role === 'admin'
      };

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam!.id,
          user_id: targetUserId,
          role,
          permissions,
          added_by: user!.id
        });

      if (error) throw error;

      fetchTeamMembers(selectedTeam!.id);
    } catch (error: any) {
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const permissions = {
        can_view: true,
        can_edit: newRole === 'member' || newRole === 'admin',
        can_share: newRole === 'admin'
      };

      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole, permissions })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully",
      });

      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const removeMember = async (memberId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: `${email} has been removed from the team`,
      });

      if (selectedTeam) {
        fetchTeamMembers(selectedTeam.id);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const deleteTeam = async (teamId: string, teamName: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Team deleted",
        description: `${teamName} has been deleted successfully`,
      });

      setSelectedTeam(null);
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting team",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                Create a new team to collaborate with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              My Teams ({teams.length})
            </CardTitle>
            <CardDescription>
              Teams you are a member of or administering
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams yet</h3>
                <p className="text-muted-foreground">Create your first team to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedTeam?.id === team.id ? 'bg-primary/5 border-primary' : 'bg-card/50'
                    }`}
                    onClick={() => {
                      setSelectedTeam(team);
                      fetchTeamMembers(team.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {team.is_admin ? (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Users className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={team.is_admin ? 'default' : 'secondary'} className="text-xs">
                              {team.is_admin ? 'Admin' : team.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {team.is_admin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{team.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTeam(team.id, team.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Team
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members Management */}
        {selectedTeam ? (
          <MemberManagement
            team={selectedTeam}
            members={teamMembers}
            isAdmin={selectedTeam.is_admin}
            onAddMember={addTeamMember}
            onUpdateMemberRole={updateMemberRole}
            onRemoveMember={removeMember}
            onRefreshMembers={() => fetchTeamMembers(selectedTeam.id)}
          />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <UserCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Team</h3>
                <p className="text-muted-foreground">Choose a team from the left to manage its members</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamsManager;