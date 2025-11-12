import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, Lock, Warning, FileText } from "phosphor-react";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface ShareData {
  id: string;
  file_id: string | null;
  folder_id: string | null;
  share_token: string;
  link_type: string;
  download_count: number;
  download_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  password_hash: string | null;
  message: string | null;
  file?: {
    original_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    is_locked: boolean;
    is_public: boolean;
  } | null;
  folder?: {
    name: string;
    is_public: boolean;
  } | null;
}

interface FolderFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
}

export const PublicSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [folderFiles, setFolderFiles] = useState<FolderFile[]>([]);

  useEffect(() => {
    if (token) fetchShareData();
  }, [token]);

  const fetchShareData = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_links")
        .select(
          `
          *,
          file:files(
            original_name,
            file_size,
            file_type,
            storage_path,
            is_locked,
            is_public
          ),
          folder:folders(
            name,
            is_public
          )
        `
        )
        .eq("share_token", token)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError("Share link not found or has expired");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This share link has expired");
        return;
      }

      if (data.download_limit && data.download_count >= data.download_limit) {
        setError("Download limit exceeded");
        return;
      }

      setShareData(data);

      if (data.folder_id) {
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("id, original_name, file_size, file_type, storage_path")
          .eq("folder_id", data.folder_id);

        if (filesError) throw filesError;
        setFolderFiles(filesData || []);
      }

      const isLocked = data.file?.is_locked || false;
      if (data.password_hash || isLocked) setPasswordRequired(true);
    } catch (err: any) {
      setError(err.message || "Failed to load share link");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = async () => {
    if (!token || !password) return;

    try {
      if (!shareData?.password_hash) {
        setPasswordVerified(true);
        setPasswordRequired(false);
        return;
      }

      const { data, error } = await supabase.rpc("validate_share_password", {
        token,
        password,
      });

      if (error) throw error;

      if (data === true) {
        setPasswordVerified(true);
        setPasswordRequired(false);
        toast({
          title: "Access granted",
          description: "Password verified successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please check your password and try again",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const downloadFile = async (fileToDownload?: FolderFile) => {
    if (!shareData) return;

    if (shareData.password_hash && !passwordVerified) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter and verify the password before download",
      });
      return;
    }

    if (
      shareData.download_limit &&
      shareData.download_count >= shareData.download_limit
    ) {
      toast({
        variant: "destructive",
        title: "Download limit exceeded",
        description: "This share has reached its maximum download limit",
      });
      return;
    }

    setDownloading(true);
    try {
      if (fileToDownload) {
        const { data: fileData, error } = await supabase.storage
          .from("files")
          .download(fileToDownload.storage_path);
        if (error) throw error;

        const url = URL.createObjectURL(fileData);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileToDownload.original_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Download started",
          description: `Downloading ${fileToDownload.original_name}`,
        });
      } else if (shareData.file && shareData.file_id) {
        const { data: fileData, error } = await supabase.storage
          .from("files")
          .download(shareData.file.storage_path);
        if (error) throw error;

        const url = URL.createObjectURL(fileData);
        const a = document.createElement("a");
        a.href = url;
        a.download = shareData.file.original_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await supabase.from("download_logs").insert({
          file_id: shareData.file_id,
          shared_link_id: shareData.id,
          download_method: "shared_link",
          downloader_ip: null,
          downloader_user_agent: navigator.userAgent,
        });

        await supabase
          .from("shared_links")
          .update({ download_count: shareData.download_count + 1 })
          .eq("id", shareData.id);

        toast({
          title: "Download started",
          description: "Your file download has begun",
        });
      } else {
        throw new Error("No file available to download");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: err.message,
      });
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading share link...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Warning className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  if (!shareData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Warning className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Share Link Not Found</h2>
              <p className="text-muted-foreground">
                This share link does not exist or has been deactivated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <FileText className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle>
              {passwordRequired && !passwordVerified
                ? "Password Protected Content"
                : "Shared File"}
            </CardTitle>
            <CardDescription>
              {passwordRequired && !passwordVerified
                ? "This content requires a password to access"
                : "Someone has work work work"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {passwordRequired && !passwordVerified ? (
              <>
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    This content is password protected. Please enter the password
                    to continue.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="password">Enter Password</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      onKeyPress={(e) => e.key === "Enter" && validatePassword()}
                    />
                    <Button onClick={validatePassword} size="sm">
                      Unlock
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h3 className="font-medium text-lg">
                    {shareData.file?.original_name ||
                      shareData.folder?.name ||
                      "Shared Item"}
                  </h3>

                  {shareData.file && (
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(shareData.file.file_size)} •{" "}
                      {shareData.file.file_type}
                    </p>
                  )}

                  {shareData.folder && (
                    <p className="text-sm text-muted-foreground">
                      Folder with {folderFiles.length} file
                      {folderFiles.length !== 1 ? "s" : ""}
                    </p>
                  )}

                  {shareData.message && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {shareData.message}
                      </p>
                    </div>
                  )}

                  {shareData.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Expires:{" "}
                      {new Date(shareData.expires_at).toLocaleDateString()}
                    </p>
                  )}

                  {shareData.download_limit && (
                    <p className="text-xs text-muted-foreground">
                      Downloads: {shareData.download_count}/
                      {shareData.download_limit}
                    </p>
                  )}
                </div>

                {shareData.folder && folderFiles.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <p className="text-sm font-medium">Files in this folder:</p>
                    {folderFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.original_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)} • {file.file_type}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(file)}
                          disabled={downloading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {shareData.file && (
                  <Button
                    onClick={() => downloadFile()}
                    disabled={downloading}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloading ? "Downloading..." : "Download File"}
                  </Button>
                )}

                {shareData.folder && folderFiles.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">This folder is empty</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
