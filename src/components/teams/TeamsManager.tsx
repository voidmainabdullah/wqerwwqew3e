import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Settings, UserPlus, Crown, Shield, User } from 'lucide-react';
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

export function TeamsManager() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
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
          <h2 className="text-2xl font-bold text-gray-200">Teams</h2>
          <p className="text-gray-400">Manage your teams and collaborate with others</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
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
                <label className="text-sm font-medium text-gray-700">Team Name</label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first team to start collaborating with others
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                      <span className="text-black dark:text-neutral-200 font-medium text-sm">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  {team.admin_id === user?.id && (
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getRoleBadgeVariant(team.admin_id === user?.id, team.admin_id === user?.id ? 'admin' : 'member')}>
                    {team.admin_id === user?.id ? 'Owner' : 'Member'}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        fetchTeamMembers(team.id);
                      }}
                    >
                      View Members
                    </Button>
                    {team.admin_id === user?.id && (
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(member.role, member.user_id === selectedTeam.admin_id)}
                    <Badge variant={getRoleBadgeVariant(member.user_id === selectedTeam.admin_id, member.role)}>
                      {member.user_id === selectedTeam.admin_id ? 'Owner' : member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}