import React from 'react';
import { EnterpriseTeamManagerLayout } from '../EnterpriseTeamManagerLayout';
import { Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function SettingsPage() {
  return (
    <EnterpriseTeamManagerLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Team Settings</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Configure team preferences and options
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-stone-900/50 border-white/10 backdrop-blur-sm p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name" className="text-gray-300">Default Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    className="bg-stone-950/50 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-desc" className="text-gray-300">Default Description</Label>
                  <Input
                    id="team-desc"
                    placeholder="Enter team description"
                    className="bg-stone-950/50 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email updates for team activities</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">File Upload Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when files are uploaded</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Team Invitations</Label>
                    <p className="text-sm text-gray-500">Notify when invited to new teams</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Private Teams</Label>
                    <p className="text-sm text-gray-500">Make all teams private by default</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-300">Activity Tracking</Label>
                    <p className="text-sm text-gray-500">Enable detailed activity logging</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </EnterpriseTeamManagerLayout>
  );
}
