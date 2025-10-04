import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Plus, FolderPlus, Files, Calendar, User, Trash, ArrowRight } from 'phosphor-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Space {
  id: string;
  team_id: string;
  parent_space_id: string | null;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  creator_email: string;
  file_count: number;
  is_archived: boolean;
}

interface TeamSpacesManagerProps {
  teamId: string;
}

export function TeamSpacesManager({ teamId }: TeamSpacesManagerProps) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: 'Root' }
  ]);

  useEffect(() => {
    fetchSpaces();
  }, [teamId, currentParentId]);

  // Real-time subscription for spaces
  useEffect(() => {
    const channel = supabase
      .channel('spaces-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spaces',
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchSpaces();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, currentParentId]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_team_spaces', { 
          _team_id: teamId,
          _parent_space_id: currentParentId
        });

      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast.error('Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const createSpace = async () => {
    if (!newSpaceName.trim()) {
      toast.error('Space name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          team_id: teamId,
          parent_space_id: currentParentId,
          name: newSpaceName,
          description: newSpaceDescription || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        _team_id: teamId,
        _user_id: user?.id,
        _action: 'space_created',
        _entity_type: 'space',
        _entity_id: data.id,
        _metadata: { name: newSpaceName }
      });

      toast.success('Space created successfully');
      setNewSpaceName('');
      setNewSpaceDescription('');
      setShowCreateDialog(false);
      fetchSpaces();
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
    }
  };

  const deleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this space? All nested spaces will also be deleted.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;

      await supabase.rpc('log_audit_event', {
        _team_id: teamId,
        _user_id: user?.id,
        _action: 'space_deleted',
        _entity_type: 'space',
        _entity_id: spaceId
      });

      toast.success('Space deleted successfully');
      fetchSpaces();
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
    }
  };

  const navigateToSpace = (space: Space) => {
    setCurrentParentId(space.id);
    setBreadcrumbs([...breadcrumbs, { id: space.id, name: space.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentParentId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || 'root'}>
            <button
              onClick={() => navigateToBreadcrumb(index)}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <ArrowRight className="h-4 w-4" />}
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" weight="duotone" />
            Spaces
          </h2>
          <p className="text-muted-foreground">
            Organize your team's files into projects and folders
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <FolderPlus className="h-4 w-4" weight="bold" />
              Create Space
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
              <DialogDescription>
                Create a new space to organize files and collaborate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Space Name</label>
                <Input
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="Enter space name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  placeholder="Enter space description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createSpace}>Create Space</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Spaces Grid */}
      {spaces.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FolderOpen className="h-10 w-10 text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No spaces yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first space to organize files and projects
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 shadow-lg">
              <FolderPlus className="h-4 w-4" weight="bold" />
              Create Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card 
              key={space.id} 
              className="hover:shadow-xl transition-all duration-200 cursor-pointer group hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1"
                    onClick={() => navigateToSpace(space)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                        <FolderOpen className="h-6 w-6 text-primary-foreground" weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {space.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Files className="h-3 w-3" weight="duotone" />
                            {space.file_count} files
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSpace(space.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" weight="duotone" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {space.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {space.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" weight="duotone" />
                    <span className="truncate max-w-[120px]">{space.creator_email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" weight="duotone" />
                    <span>{new Date(space.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}