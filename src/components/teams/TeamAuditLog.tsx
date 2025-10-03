import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, User, FileText, Users, Shield, Envelope, FolderOpen, MagnifyingGlass } from 'phosphor-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  team_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
}

interface TeamAuditLogProps {
  teamId: string;
}

export function TeamAuditLog({ teamId }: TeamAuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [teamId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('invite')) return <Envelope className="h-4 w-4" />;
    if (action.includes('member')) return <Users className="h-4 w-4" />;
    if (action.includes('space')) return <FolderOpen className="h-4 w-4" />;
    if (action.includes('file')) return <FileText className="h-4 w-4" />;
    if (action.includes('policy')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('revoke')) return 'text-destructive';
    if (action.includes('create') || action.includes('accept')) return 'text-emerald-500';
    if (action.includes('update') || action.includes('change')) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
          <p className="text-muted-foreground">Complete activity history for your team</p>
        </div>
        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-center">
              Team activity will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-foreground">
                        {formatAction(log.action)}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {log.entity_type}
                      </Badge>
                    </div>
                    {log.metadata && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      {log.user_id && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>User ID: {log.user_id.slice(0, 8)}...</span>
                          </div>
                        </>
                      )}
                    </div>
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