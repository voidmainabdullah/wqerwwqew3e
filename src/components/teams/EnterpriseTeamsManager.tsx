import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TeamsManager } from './TeamsManager';
import { TeamSpacesManager } from './TeamSpacesManager';
import { TeamInvitesManager } from './TeamInvitesManager';
import { TeamAuditLog } from './TeamAuditLog';
import { TeamPoliciesManager } from './TeamPoliciesManager';
import { TeamFileShare } from './TeamFileShare';
import { FolderOpen, Users, Envelope, Shield, Activity, ShareNetwork } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';

export function EnterpriseTeamsManager() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-primary-foreground" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Enterprise Teams</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Collaborate, share files, and manage your teams with enterprise-grade controls
              </p>
            </div>
          </div>
          {selectedTeamId && (
            <Badge variant="outline" className="mt-2 bg-primary/5 border-primary/20">
              <Shield className="h-3 w-3 mr-1" />
              Team Selected
            </Badge>
          )}
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-card border border-border h-auto p-1 gap-1">
            <TabsTrigger 
              value="teams" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
            >
              <Users className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Teams</span>
            </TabsTrigger>
            <TabsTrigger 
              value="spaces" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
              disabled={!selectedTeamId}
            >
              <FolderOpen className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Spaces</span>
            </TabsTrigger>
            <TabsTrigger 
              value="share" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
              disabled={!selectedTeamId}
            >
              <ShareNetwork className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Share</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invites" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
              disabled={!selectedTeamId}
            >
              <Envelope className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Invites</span>
            </TabsTrigger>
            <TabsTrigger 
              value="policies" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
              disabled={!selectedTeamId}
            >
              <Shield className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Policies</span>
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-2.5"
              disabled={!selectedTeamId}
            >
              <Activity className="h-4 w-4" weight="duotone" />
              <span className="hidden sm:inline font-medium">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-6">
            <TeamsManager onSelectTeam={setSelectedTeamId} />
          </TabsContent>

          {selectedTeamId && (
            <>
              <TabsContent value="spaces" className="mt-6">
                <TeamSpacesManager teamId={selectedTeamId} />
              </TabsContent>

              <TabsContent value="share" className="mt-6">
                <TeamFileShare teamId={selectedTeamId} />
              </TabsContent>

              <TabsContent value="invites" className="mt-6">
                <TeamInvitesManager teamId={selectedTeamId} />
              </TabsContent>

              <TabsContent value="policies" className="mt-6">
                <TeamPoliciesManager teamId={selectedTeamId} />
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <TeamAuditLog teamId={selectedTeamId} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}