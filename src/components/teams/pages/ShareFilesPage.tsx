import React from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { TeamFileShare } from '../TeamFileShare';
import { Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';

export function ShareFilesPage() {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('teamId');

  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-zinnc-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Share Files</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Share files with your team members
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
          {teamId ? (
            <TeamFileShare teamId={teamId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Please select a team to share files</p>
            </div>
          )}
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
