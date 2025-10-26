import React from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { LayoutDashboard, Users, Files, Shield, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function DashboardPage() {
  const stats = [
    {
      label: 'Total Teams',
      value: '12',
      icon: Users,
      trend: '+2 this month',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Active Members',
      value: '48',
      icon: Users,
      trend: '+8 this week',
      color: 'from-green-600 to-emerald-600'
    },
    {
      label: 'Shared Files',
      value: '234',
      icon: Files,
      trend: '+15 today',
      color: 'from-orange-600 to-amber-600'
    },
    {
      label: 'Security Score',
      value: '98%',
      icon: Shield,
      trend: '+2% improvement',
      color: 'from-red-600 to-pink-600'
    }
  ];

  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Overview of your enterprise teams and activities
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6 hover:bg-stone-900/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1 text-sm text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Team member added</p>
                    <p className="text-gray-400 text-xs mt-1">John Doe joined Marketing Team</p>
                    <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <p className="text-white font-medium">Create New Team</p>
                <p className="text-gray-400 text-sm mt-1">Set up a new team workspace</p>
              </button>
              <button className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <p className="text-white font-medium">Invite Members</p>
                <p className="text-gray-400 text-sm mt-1">Add new team members</p>
              </button>
              <button className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <p className="text-white font-medium">Share Files</p>
                <p className="text-gray-400 text-sm mt-1">Upload and share resources</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
