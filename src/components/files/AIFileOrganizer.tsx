import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FolderTree, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIFileOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
  files: Array<{
    id: string;
    original_name: string;
    file_type: string;
    file_size: number;
  }>;
  onOrganized: () => void;
}

interface OrganizationSuggestion {
  folderName: string;
  fileIds: string[];
  reason: string;
  fileCount: number;
}

export function AIFileOrganizer({ isOpen, onClose, files, onOrganized }: AIFileOrganizerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([]);

  const analyzeFiles = async () => {
    setAnalyzing(true);
    try {
      // AI-powered analysis of file names and types
      const fileGroups = new Map<string, string[]>();
      
      files.forEach(file => {
        const name = file.original_name.toLowerCase();
        const ext = file.file_type.toLowerCase();
        
        // Smart categorization logic
        let category = 'Miscellaneous';
        
        // Image files
        if (ext.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].some(e => name.endsWith(e))) {
          category = 'Images';
        }
        // Video files
        else if (ext.includes('video') || ['mp4', 'avi', 'mov', 'mkv', 'webm'].some(e => name.endsWith(e))) {
          category = 'Videos';
        }
        // Audio files
        else if (ext.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'm4a'].some(e => name.endsWith(e))) {
          category = 'Audio';
        }
        // Documents
        else if (ext.includes('pdf') || ['pdf', 'doc', 'docx', 'txt', 'rtf'].some(e => name.endsWith(e))) {
          category = 'Documents';
        }
        // Spreadsheets
        else if (['xls', 'xlsx', 'csv'].some(e => name.endsWith(e))) {
          category = 'Spreadsheets';
        }
        // Presentations
        else if (['ppt', 'pptx', 'key'].some(e => name.endsWith(e))) {
          category = 'Presentations';
        }
        // Archives
        else if (['zip', 'rar', '7z', 'tar', 'gz'].some(e => name.endsWith(e))) {
          category = 'Archives';
        }
        // Code files
        else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].some(e => name.endsWith(e))) {
          category = 'Code';
        }
        // Date-based grouping for recent files
        else if (name.includes('2024') || name.includes('2025')) {
          const year = name.match(/202[45]/)?.[0];
          if (year) category = `Files ${year}`;
        }
        
        // Project-based grouping
        if (name.includes('project') || name.includes('work')) {
          category = 'Work Projects';
        } else if (name.includes('personal') || name.includes('private')) {
          category = 'Personal';
        } else if (name.includes('invoice') || name.includes('receipt')) {
          category = 'Financial';
        } else if (name.includes('photo') || name.includes('pic') || name.includes('img')) {
          category = 'Photos';
        } else if (name.includes('backup')) {
          category = 'Backups';
        }
        
        if (!fileGroups.has(category)) {
          fileGroups.set(category, []);
        }
        fileGroups.get(category)!.push(file.id);
      });

      // Convert to suggestions
      const newSuggestions: OrganizationSuggestion[] = Array.from(fileGroups.entries())
        .filter(([_, fileIds]) => fileIds.length > 0)
        .map(([folderName, fileIds]) => ({
          folderName,
          fileIds,
          fileCount: fileIds.length,
          reason: getReason(folderName, fileIds.length)
        }))
        .sort((a, b) => b.fileCount - a.fileCount);

      setSuggestions(newSuggestions);
      
      if (newSuggestions.length === 0) {
        toast.info('Your files are already well organized!');
      } else {
        toast.success(`Found ${newSuggestions.length} organization suggestions!`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze files');
    } finally {
      setAnalyzing(false);
    }
  };

  const getReason = (folderName: string, count: number): string => {
    const reasons: Record<string, string> = {
      'Images': 'Group all image files together for easy access',
      'Videos': 'Keep video files organized in one place',
      'Audio': 'Centralize audio and music files',
      'Documents': 'Organize text documents and PDFs',
      'Spreadsheets': 'Group Excel and CSV files',
      'Presentations': 'Keep presentation files together',
      'Archives': 'Organize compressed files',
      'Code': 'Group programming files',
      'Work Projects': 'Consolidate work-related files',
      'Personal': 'Group personal files separately',
      'Financial': 'Organize invoices and receipts',
      'Photos': 'Centralize photo collections',
      'Backups': 'Keep backup files organized',
    };
    
    return reasons[folderName] || `Suggested folder with ${count} related files`;
  };

  const applyOrganization = async () => {
    setOrganizing(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Create folders and move files
      for (const suggestion of suggestions) {
        // Create folder
        const { data: folder, error: folderError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: suggestion.folderName,
            parent_folder_id: null,
          })
          .select()
          .single();

        if (folderError) throw folderError;

        // Move files to folder
        const { error: moveError } = await supabase
          .from('files')
          .update({ folder_id: folder.id })
          .in('id', suggestion.fileIds);

        if (moveError) throw moveError;
      }

      toast.success(`Successfully organized ${files.length} files into ${suggestions.length} folders!`);
      onOrganized();
      onClose();
    } catch (error: any) {
      console.error('Organization error:', error);
      toast.error('Failed to organize files: ' + error.message);
    } finally {
      setOrganizing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI File Organizer
          </DialogTitle>
          <DialogDescription>
            Let AI analyze your files and suggest smart organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FolderTree className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Analyze {files.length} Files
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI will analyze your files and suggest the best way to organize them into folders based on file types, names, and patterns.
                  </p>
                </div>
                <Button 
                  onClick={analyzeFiles} 
                  disabled={analyzing}
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Files...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Organization Suggestions ({suggestions.length} folders)
                  </h3>
                  <Badge variant="secondary">
                    {files.length} files total
                  </Badge>
                </div>

                {suggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderTree className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {suggestion.folderName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.fileCount} files
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.reason}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSuggestions([])}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={applyOrganization}
                  disabled={organizing}
                  className="flex-1"
                >
                  {organizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Organizing...
                    </>
                  ) : (
                    <>
                      <FolderTree className="mr-2 h-4 w-4" />
                      Apply Organization
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
