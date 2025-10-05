import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShareNetwork, Users } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';

interface ShareToTeamsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

interface Team {
  team_id: string;
  team_name: string;
  is_admin: boolean;
}

interface Space {
  id: string;
  name: string;
}

export function ShareToTeamsDialog({
  isOpen,
  onClose,
  fileId,
  fileName
}: ShareToTeamsDialogProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserTeams();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamSpaces();
    }
  }, [selectedTeam]);

  const fetchUserTeams = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_teams', {
        p_user_id: user?.id
      });

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    }
  };

  const fetchTeamSpaces = async () => {
    try {
      const { data, error } = await supabase.rpc('get_team_spaces', {
        _team_id: selectedTeam
      });

      if (error) throw error;
      setSpaces(data || []);
    } catch (error: any) {
      console.error('Error fetching spaces:', error);
      setSpaces([]);
    }
  };

  const handleShareToTeam = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('team_file_shares').insert({
        file_id: fileId,
        team_id: selectedTeam,
        shared_by: user?.id,
        space_id: selectedSpace || null
      });

      if (error) throw error;

      toast.success(`File "${fileName}" shared with team successfully!`);
      onClose();
    } catch (error: any) {
      console.error('Error sharing file:', error);
      toast.error('Failed to share file with team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareNetwork className="h-5 w-5 text-primary" weight="duotone" />
            Share to Team
          </DialogTitle>
          <DialogDescription>
            Share "{fileName}" with your team members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="team-select" className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" weight="duotone" />
              Select Team
            </Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team-select">
                <SelectValue placeholder="Choose a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No teams available
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem key={team.team_id} value={team.team_id}>
                      {team.team_name}
                      {team.is_admin && ' (Admin)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && spaces.length > 0 && (
            <div>
              <Label htmlFor="space-select" className="mb-2">
                Select Space (Optional)
              </Label>
              <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                <SelectTrigger id="space-select">
                  <SelectValue placeholder="No specific space..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific space</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShareToTeam} disabled={loading || !selectedTeam}>
            {loading ? 'Sharing...' : 'Share to Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}