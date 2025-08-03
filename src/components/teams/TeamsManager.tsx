import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, Plus, Trash2, Crown, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  invited_at: string;
}

interface TeamsManagerProps {
  userProfile: any;
}

export const TeamsManager: React.FC<TeamsManagerProps> = ({ userProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const isPro = userProfile?.subscription_tier === 'pro';

  useEffect(() => {
    if (user && isPro) {
      fetchTeamMembers();
    } else {
      setLoading(false);
    }
  }, [user, isPro]);

  const fetchTeamMembers = async () => {
    try {
      // In a real implementation, this would fetch from a team_members table
      // For now, we'll simulate with local data
      setTeamMembers([
        {
          id: '1',
          email: 'john@example.com',
          role: 'member',
          status: 'active',
          invited_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'sarah@example.com',
          role: 'admin',
          status: 'pending',
          invited_at: new Date().toISOString(),
        }
      ]);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail) return;

    if (!isPro) {
      toast({
        variant: "destructive",
        title: "Premium feature",
        description: "Teams feature requires Pro subscription",
      });
      return;
    }

    try {
      // Simulate API call - in real implementation this would:
      // 1. Check if email exists in auth.users
      // 2. Create team invitation
      // 3. Send email invitation
      
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: inviteEmail,
        role: 'member',
        status: 'pending',
        invited_at: new Date().toISOString(),
      };

      setTeamMembers([...teamMembers, newMember]);
      
      toast({
        title: "Team invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending invitation",
        description: error.message,
      });
    }
  };

  const removeTeamMember = async (memberId: string, email: string) => {
    try {
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      
      toast({
        title: "Team member removed",
        description: `${email} has been removed from the team`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing team member",
        description: error.message,
      });
    }
  };

  if (!isPro) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Teams Feature</CardTitle>
          <CardDescription>
            Collaborate with team members by sharing files directly within your organization. Premium feature only.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <a href="/subscription">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage your team and share files securely within your organization.
            </CardDescription>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Enter the email address of the person you want to invite to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={inviteTeamMember} disabled={!inviteEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-6">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by inviting colleagues.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {member.role === 'admin' ? (
                      <Crown className="w-4 h-4 text-primary" />
                    ) : (
                      <Users className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {member.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTeamMember(member.id, member.email)}
                  className="hover:bg-functions-delete/10 hover:text-functions-delete transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};