import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, UserPlus, Crown, Shield, User, Trash, GearSix } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  admin_id: string;
  created_at: string;
  member_count: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'member';
  joined_at: string;
}

interface TeamsManagerProps {
  onSelectTeam?: (teamId: string | null) => void;
}

export function TeamsManager({ onSelectTeam }: TeamsManagerProps = {}) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  // Real-time subscription for teams
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('teams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Get teams where user is admin
      const { data: adminTeams, error: adminError } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('admin_id', user?.id);

      if (adminError) throw adminError;

      // Get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .in('id', 
          await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user?.id)
            .then(({ data }) => data?.map(tm => tm.team_id) || [])
        );

      if (memberError) throw memberError;

      // Combine and deduplicate teams
      const allTeams = [...(adminTeams || []), ...(memberTeams || [])];
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      );
      
      const teamsWithCount = uniqueTeams?.map(team => ({
        ...team,
        member_count: team.team_members?.[0]?.count || 0
      })) || [];
      
      setTeams(teamsWithCount);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: newTeamName,
          admin_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a team member with admin role
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user?.id,
          role: 'admin',
          permissions: {
            can_view: true,
            can_edit: true,
            can_share: true
          },
          added_by: user?.id
        });

      setTeams([...teams, { ...data, member_count: 1 }]);
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateDialog(false);
      toast.success('Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_team_members', { p_team_id: teamId });

      if (error) throw error;
      setTeamMembers((data || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member'
      })));
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const getRoleIcon = (role: string, isOwner: boolean = false) => {
    if (isOwner) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (isOwner: boolean, role: string) => {
    if (isOwner) return 'default';
    return role === 'admin' ? 'secondary' : 'outline';
  };

  const deleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamToDelete.id);

      if (error) throw error;

      toast.success('Team deleted successfully');
      setTeams(teams.filter(t => t.id !== teamToDelete.id));
      setTeamToDelete(null);
      if (selectedTeam?.id === teamToDelete.id) {
        setSelectedTeam(null);
        onSelectTeam?.(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" weight="duotone" />
            Teams
          </h2>
          <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="h-4 w-4" weight="bold" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with others on file sharing and projects.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Team Name</label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <Input
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTeam}>
                  Create Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No teams yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first team to start collaborating with others on projects and file sharing
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 shadow-lg">
              <Plus className="h-4 w-4" weight="bold" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-xl transition-all duration-200 hover:border-primary/50 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                      <span className="text-primary-foreground font-bold text-lg">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{team.name}</CardTitle>
                      <CardDescription className="text-sm flex items-center gap-1">
                        <Users className="h-3 w-3" weight="duotone" />
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  {team.admin_id === user?.id && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setTeamToDelete(team)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" weight="duotone" />
                    </Button>
                  )}
                </div>
                <Badge 
                  variant={getRoleBadgeVariant(team.admin_id === user?.id, team.admin_id === user?.id ? 'admin' : 'member')}
                  className="w-fit"
                >
                  {getRoleIcon(team.admin_id === user?.id ? 'admin' : 'member', team.admin_id === user?.id)}
                  <span className="ml-1">{team.admin_id === user?.id ? 'Owner' : 'Member'}</span>
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectTeam?.(team.id);
                      setSelectedTeam(team);
                      fetchTeamMembers(team.id);
                    }}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <User className="h-4 w-4 mr-1" weight="duotone" />
                    Members
                  </Button>
                  {team.admin_id === user?.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onSelectTeam?.(team.id);
                      }}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <UserPlus className="h-4 w-4" weight="duotone" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTeam && (
        <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTeam.name} Members</DialogTitle>
              <DialogDescription>
                Manage team members and their roles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" weight="duotone" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(member.user_id === selectedTeam.admin_id, member.role)} className="flex items-center gap-1">
                      {getRoleIcon(member.role, member.user_id === selectedTeam.admin_id)}
                      {member.user_id === selectedTeam.admin_id ? 'Owner' : member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Team Confirmation */}
      <AlertDialog open={!!teamToDelete} onOpenChange={() => setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{teamToDelete?.name}"? This action cannot be undone and will remove all team data, including spaces, files, and member information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}