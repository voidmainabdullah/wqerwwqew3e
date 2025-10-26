import React, { useState } from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { TeamsManager } from '../TeamsManager';
import { Users } from 'phosphor-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function TeamsPage() {
  const navigate = useNavigate();

  const handleSelectTeam = (teamId: string) => {
    navigate(`/dashboard/teams/manage?teamId=${teamId}`);
  };

  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="h-6 w-6 text-white" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Teams Management</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Create and manage your enterprise teams
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
          <TeamsManager onSelectTeam={handleSelectTeam} />
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
