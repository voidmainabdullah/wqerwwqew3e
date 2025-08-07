import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Crown, Settings, Trash2, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
interface Team {
  id: string;
  name: string;
  admin_id: string;
  created_at: string;
  is_admin: boolean;
  role: string;
  permissions: any;
}
interface MemberManagementProps {
  team: Team;
  members: TeamMember[];
  isAdmin: boolean;
  onAddMember: (email: string, role: string) => Promise<void>;
  onUpdateMemberRole: (memberId: string, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: string, email: string) => Promise<void>;
  onRefreshMembers: () => void;
}
const MemberManagement: React.FC<MemberManagementProps> = ({
  team,
  members,
  isAdmin,
  onAddMember,
  onUpdateMemberRole,
  onRemoveMember,
  onRefreshMembers
}) => {
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter a valid email address"
      });
      return;
    }
    setIsLoading(true);
    try {
      await onAddMember(newMemberEmail, newMemberRole);
      setNewMemberEmail('');
      setNewMemberRole('member');
      setAddMemberDialogOpen(false);
      onRefreshMembers();
      toast({
        title: "Member added",
        description: `${newMemberEmail} has been added to the team`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding member",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await onUpdateMemberRole(memberId, newRole);
      onRefreshMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: error.message
      });
    }
  };
  const handleRemoveMember = async (memberId: string, email: string) => {
    try {
      await onRemoveMember(memberId, email);
      onRefreshMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing member",
        description: error.message
      });
    }
  };
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3" />;
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };
  const getPermissionsList = (permissions: any) => {
    const perms = [];
    if (permissions?.can_view) perms.push('View');
    if (permissions?.can_edit) perms.push('Edit');
    if (permissions?.can_share) perms.push('Share');
    return perms.join(', ') || 'No permissions';
  };
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              Manage team members and their permissions
            </CardDescription>
          </div>
          {isAdmin && <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
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
                    Invite a new member to {team.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email Address</Label>
                    <Input id="member-email" type="email" placeholder="user@example.com" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-role">Role</Label>
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember} disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Member'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No team members yet</p>
            <p className="text-sm">Start building your team by adding members</p>
          </div> : <div className="space-y-4">
            {members.map(member => <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.email}</p>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Permissions: {getPermissionsList(member.permissions)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {isAdmin && member.role !== 'admin' && <div className="flex items-center space-x-2">
                    <Select value={member.role} onValueChange={newRole => handleRoleChange(member.id, newRole)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.email} from the team? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(member.id, member.email)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove Member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>}
                
                {member.role === 'admin' && <Badge variant="default" className="text-xs bg-lime-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Team Admin
                  </Badge>}
              </div>)}
          </div>}
      </CardContent>
    </Card>;
};
export default MemberManagement;