import React, { useState } from 'react';
import { EnterpriseTeamManagerLayout } from './EnterpriseTeamManagerLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamsManager } from './TeamsManager';
import { TeamSpacesManager } from './TeamSpacesManager';
import { TeamInvitesManager } from './TeamInvitesManager';
import { TeamAuditLog } from './TeamAuditLog';
import { TeamPoliciesManager } from './TeamPoliciesManager';
import { TeamFileShare } from './TeamFileShare';
import { FolderOpen, Users, Envelope, Shield, Activity, ShareNetwork } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function EnterpriseTeamsManager() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="h-6 w-6 text-white" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Enterprise Teams</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Collaborate, share files, and manage your teams with enterprise-grade controls
              </p>
            </div>
          </div>
          {selectedTeamId && (
            <Badge variant="outline" className="mt-2 bg-blue-500/10 border-blue-500/30 text-blue-300">
              <Shield className="h-3 w-3 mr-1" />
              Team Selected
            </Badge>
          )}
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm">
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-stone-950/80 border border-white/10 h-auto p-1 gap-1">
              <TabsTrigger
                value="teams"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
              >
                <Users className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Teams</span>
              </TabsTrigger>
              <TabsTrigger
                value="spaces"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
                disabled={!selectedTeamId}
              >
                <FolderOpen className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Spaces</span>
              </TabsTrigger>
              <TabsTrigger
                value="share"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
                disabled={!selectedTeamId}
              >
                <ShareNetwork className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Share</span>
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
                disabled={!selectedTeamId}
              >
                <Envelope className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Invites</span>
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
                disabled={!selectedTeamId}
              >
                <Shield className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Policies</span>
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all py-2.5 text-gray-400"
                disabled={!selectedTeamId}
              >
                <Activity className="h-4 w-4" weight="duotone" />
                <span className="hidden sm:inline font-medium">Audit</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="teams" className="mt-0">
                <TeamsManager onSelectTeam={setSelectedTeamId} />
              </TabsContent>

              {selectedTeamId && ( 
                <>
                  <TabsContent value="spaces" className="mt-0">
                    <TeamSpacesManager teamId={selectedTeamId} />
                  </TabsContent>

                  <TabsContent value="share" className="mt-0">
                    <TeamFileShare teamId={selectedTeamId} />
                  </TabsContent>

                  <TabsContent value="invites" className="mt-0">
                    <TeamInvitesManager teamId={selectedTeamId} />
                  </TabsContent>

                  <TabsContent value="policies" className="mt-0">
                    <TeamPoliciesManager teamId={selectedTeamId} />
                  </TabsContent>

                  <TabsContent value="audit" className="mt-0">
                    <TeamAuditLog teamId={selectedTeamId} />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}