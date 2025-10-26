import React from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { FileReceiver } from '../../files/FileReceiver';
import { Inbox } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ReceiveFilesPage() {
  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Receive Files</h1>
              <p className="text-gray-400 text-sm md:text-base">
                View and manage files received from team members
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
          <FileReceiver />
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
