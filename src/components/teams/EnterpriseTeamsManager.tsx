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

export function EnterpriseTeamsManager() {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Enterprise Teams</h1>
          <p className="text-muted-foreground text-lg">
            Collaborate, share files, and manage your teams with enterprise-grade controls
          </p>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-card border">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="spaces" className="flex items-center gap-2" disabled={!selectedTeamId}>
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Spaces</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2" disabled={!selectedTeamId}>
              <ShareNetwork className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2" disabled={!selectedTeamId}>
              <Envelope className="h-4 w-4" />
              <span className="hidden sm:inline">Invites</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2" disabled={!selectedTeamId}>
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2" disabled={!selectedTeamId}>
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
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