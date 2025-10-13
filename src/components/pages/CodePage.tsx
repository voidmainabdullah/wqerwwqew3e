import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';

interface SharedFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  download_count: number;
  is_locked: boolean;
}

export default function CodePage() {
  const [shareCode, setShareCode] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<SharedFile | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeSubmit = async () => {
    if (!shareCode.trim()) {
      toast.error('Please enter a share code');
      return;
    }

    setIsLoading(true);
    try {
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('id, original_name, file_size, file_type, storage_path, download_count, is_locked')
        .eq('share_code', shareCode.trim().toUpperCase())
        .single();

      if (fileError || !fileData) {
        toast.error('Invalid share code or file not found');
        return;
      }

      if (fileData.is_locked && !password) {
        setRequiresPassword(true);
        toast.error('This file is password protected');
        return;
      }

      if (fileData.is_locked && password) {
        const { data: sharedLink } = await supabase
          .from('shared_links')
          .select('password_hash, share_token')
          .eq('file_id', fileData.id)
          .not('password_hash', 'is', null)
          .maybeSingle();

        if (sharedLink?.password_hash) {
          const { data: isValidPassword } = await supabase.rpc('validate_share_password', {
            token: sharedLink.share_token,
            password: password
          });

          if (!isValidPassword) {
            toast.error('Incorrect password');
            return;
          }
        } else {
          toast.error('This file requires a password but none configured');
          return;
        }
      }

      setFile(fileData);
      setRequiresPassword(false);
    } catch (error: any) {
      console.error('Code lookup error:', error);
      toast.error('Failed to retrieve file: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!file) return;
    try {
      const { data } = await supabase.storage.from('files').createSignedUrl(file.storage_path, 60);
      if (data) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = file.original_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await supabase.from('download_logs').insert({
          file_id: file.id,
          download_method: 'code_share'
        });
        toast.success('File download started');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setShareCode('');
    setPassword('');
    setFile(null);
    setRequiresPassword(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 flex flex-col items-center justify-center p-4 space-y-8">
      
      {/* File Access Card */}
      <Card className="w-full max-w-md bg-neutral-900 border border-neutral-700 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-heading flex items-center justify-center gap-2 text-gray-100">
            <span className="material-icons md-24 text-gray-300">tag</span>
            Access File with Code
          </CardTitle>
          <CardDescription className="font-body text-gray-400">
            Enter your unique share code to access the file.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!file ? (
            <>
              <div>
                <Label htmlFor="shareCode" className="font-heading text-gray-300">Share Code</Label>
                <Input
                  id="shareCode"
                  placeholder="Enter 8-character code"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="font-mono tracking-wider text-center bg-neutral-800 border-neutral-700 text-gray-100"
                />
              </div>

              {requiresPassword && (
                <div>
                  <Label htmlFor="password" className="font-heading text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter file password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-gray-100"
                  />
                </div>
              )}

              <Button
                onClick={handleCodeSubmit}
                disabled={isLoading || !shareCode.trim()}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 font-heading"
              >
                <span className="material-icons md-18 mr-2">
                  {isLoading ? 'refresh' : 'search'}
                </span>
                {isLoading ? 'Verifying...' : 'Access File'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons md-36 text-gray-300">description</span>
                </div>
                <h3 className="font-heading text-lg font-semibold">{file.original_name}</h3>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(file.file_size)} • {file.download_count} downloads
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadFile} className="flex-1 bg-gray-700 hover:bg-gray-600">
                  <span className="material-icons md-18 mr-2">download</span>
                  Download
                </Button>
                <Button variant="outline" onClick={resetForm} className="text-gray-300 border-gray-700">
                  New Code
                </Button>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-neutral-800">
            <Button variant="link" asChild className="text-sm text-gray-400 hover:text-gray-200">
              <a href="/">
                <span className="material-icons md-18 mr-1">arrow_back</span>
                Back to Home
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ultra Professional Ad Layout (Responsive) */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center w-full max-w-6xl mx-auto">

        {/* Interactive Ad Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 rounded-3xl border border-neutral-700/60 shadow-2xl w-full md:w-2/3 group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-neutral-500/20 h-[360px] md:h-[420px]">
          
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <iframe
              className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:opacity-100"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0"
              title="Ad Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-900/50 to-neutral-800/80 group-hover:opacity-50 transition-all"></div>
          </div>

          {/* Ad Label + Dropdown */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <span className="text-sm font-semibold text-gray-200 bg-neutral-900/70 px-3 py-1 rounded-full border border-neutral-700 shadow-sm">
              Ad · Sponsored
            </span>

            <div className="relative">
              <button
                onClick={() => {
                  const el = document.getElementById("adDropdown");
                  el.classList.toggle("hidden");
                }}
                className="text-gray-300 hover:text-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                id="adDropdown"
                className="hidden absolute right-0 mt-2 w-60 bg-neutral-900/95 border border-neutral-700 rounded-xl p-4 shadow-xl backdrop-blur-lg z-30"
              >
                <h4 className="text-gray-100 text-sm font-semibold mb-2">Ad Highlights</h4>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Lightning-fast sync</li>
                  <li>• End-to-end encryption</li>
                  <li>• Global file access</li>
                  <li>• Free 1TB on sign-up</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hover Title */}
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex flex-col items-center justify-center text-center py-20 md:py-28 transition-all"
          >
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 text-xl md:text-2xl font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
              Cloud Sync Pro – Lightning Fast Uploads
            </h3>
          </a>

          {/* CTA Button */}
          <div className="absolute bottom-5 right-5 z-20">
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-gray-100 hover:bg-neutral-700 transition-all"
            >
              Visit Now
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Ad Preview (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-800 rounded-3xl border border-neutral-700 shadow-xl w-full md:w-1/3 p-6">
          <div className="relative overflow-hidden rounded-2xl mb-5">
            <img
              src="https://images.unsplash.com/photo-1672938464174-b5d2a875cc7d?q=80&w=800"
              alt="Ad Preview"
              className="w-full h-48 object-cover rounded-2xl hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 rounded-2xl"></div>
          </div>
          <div className="text-left space-y-2">
            <h4 className="text-gray-100 text-lg font-semibold">Ultra Cloud Storage</h4>
            <p className="text-gray-400 text-sm">Next-gen encrypted syncing for professionals with high security and performance.</p>
          </div>
          <div className="mt-5">
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border border-neutral-700 hover:from-gray-600 hover:to-gray-500 transition-all"
            >
              Learn More
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
