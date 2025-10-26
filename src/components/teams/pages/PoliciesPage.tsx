import React from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { TeamPoliciesManager } from '../TeamPoliciesManager';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';

export function PoliciesPage() {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('teamId');

  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Security Policies</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Configure security policies and permissions
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
          {teamId ? (
            <TeamPoliciesManager teamId={teamId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Please select a team to manage policies</p>
            </div>
          )}
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
