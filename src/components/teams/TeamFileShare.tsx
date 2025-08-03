import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Share } from 'lucide-react';

interface Team {
  team_id: string;
  team_name: string;
  is_admin: boolean;
  role: string;
  permissions: any;
}

interface TeamFileShareProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamFileShare: React.FC<TeamFileShareProps> = ({
  fileId,
  fileName,
  isOpen,
  onOpenChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserTeams();
    }
  }, [isOpen, user]);

  const fetchUserTeams = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_teams', {
        user_id: user!.id
      });

      if (error) throw error;
      
      // Filter teams where user has share permissions
      const shareableTeams = data?.filter(team => {
        const permissions = team.permissions as any;
        return permissions?.can_share || team.is_admin;
      }) || [];
      
      setTeams(shareableTeams);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      toast({
        variant: "destructive",
        title: "Error fetching teams",
        description: error.message,
      });
    }
  };

  const shareWithTeam = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('team_file_shares')
        .insert({
          file_id: fileId,
          team_id: selectedTeam,
          shared_by: user!.id
        });

      if (error) throw error;

      const teamName = teams.find(t => t.team_id === selectedTeam)?.team_name;
      
      toast({
        title: "File shared successfully",
        description: `${fileName} has been shared with ${teamName}`,
      });

      onOpenChange(false);
      setSelectedTeam('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sharing file",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share className="w-5 h-5 mr-2" />
            Share with Team
          </DialogTitle>
          <DialogDescription>
            Share "{fileName}" with one of your teams
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {teams.length === 0 ? (
            <div className="text-center py-6">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No teams available</h3>
              <p className="text-muted-foreground text-sm">
                You need to be part of a team with sharing permissions to share files
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.team_id} value={team.team_id}>
                      <div className="flex items-center space-x-2">
                        <span>{team.team_name}</span>
                        <Badge variant={team.is_admin ? 'default' : 'secondary'} className="text-xs">
                          {team.is_admin ? 'Admin' : team.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={shareWithTeam} 
            disabled={!selectedTeam || loading || teams.length === 0}
            className="hover:scale-105 transition-transform"
          >
            {loading ? 'Sharing...' : 'Share File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};