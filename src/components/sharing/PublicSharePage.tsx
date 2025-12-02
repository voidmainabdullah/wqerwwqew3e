import React, { useEffect, useState } from "react";
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

/**
 * Types
 */
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
    if (token) {
      fetchShareData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Fetch shared link metadata and (if folder) its files
   */
  const fetchShareData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("shared_links")
        .select(
          `
            *,
            file:files(
              id,
              original_name,
              file_size,
              file_type,
              storage_path,
              is_locked,
              is_public
            ),
            folder:folders(
              id,
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

      // expiration check
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This share link has expired");
        return;
      }

      // download limit check
      if (data.download_limit && data.download_count >= data.download_limit) {
        setError("Download limit exceeded");
        return;
      }

      setShareData(data);

      // if folder -> fetch files
      if (data.folder_id) {
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("id, original_name, file_size, file_type, storage_path")
          .eq("folder_id", data.folder_id);

        if (filesError) throw filesError;
        setFolderFiles(filesData || []);
      }

      // password requirement detection
      const isLocked = data.file?.is_locked || false;
      if (data.password_hash || isLocked) {
        setPasswordRequired(true);
      } else {
        setPasswordRequired(false);
      }
    } catch (err: any) {
      console.error("fetchShareData error:", err);
      setError(err?.message || "Failed to load share link");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate share password using RPC. Also re-check file access RPC if needed.
   */
  const validatePassword = async () => {
    if (!token) return;
    if (!password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter the password.",
      });
      return;
    }

    try {
      // If no password on shareData, allow
      if (!shareData?.password_hash) {
        setPasswordVerified(true);
        setPasswordRequired(false);
        toast({ title: "Access granted", description: "No password required" });
        return;
      }

      const { data, error } = await supabase.rpc("validate_share_password", {
        token,
        password,
      });

      if (error) throw error;

      if (data === true) {
        // extra file access check (RPC) to respect any other protections
        if (shareData?.file_id) {
          const { data: accessCheck, error: accessErr } = await supabase.rpc(
            "check_file_access",
            {
              p_file_id: shareData.file_id,
              p_user_id: null,
            }
          );
          if (accessErr) throw accessErr;

          if (!accessCheck?.[0]?.can_access) {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You do not have permission to download this file.",
            });
            return;
          }
        }

        setPasswordVerified(true);
        setPasswordRequired(false);
        toast({ title: "Access granted", description: "Password verified" });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: "Please check your password and try again",
        });
      }
    } catch (err: any) {
      console.error("validatePassword error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Password validation failed",
      });
    }
  };

  /**
   * Insert a download log row with only allowed columns:
   * id (handled by DB), file_id, downloader_ip, downloader_user_agent, download_method, downloaded_at
   *
   * NOTE: downloaded_at column in DB expects timestamp — we send ISO string.
   * downloader_ip is null from frontend; replace with backend/edge function if you want real IP.
   */
  const insertDownloadLog = async (fileId: string, method = "public_shared") => {
    try {
      const payload = {
        file_id: fileId,
        downloader_ip: null, // frontend cannot reliably obtain real client IP
        downloader_user_agent: navigator.userAgent,
        download_method: method,
        downloaded_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await supabase
        .from("download_logs")
        .insert(payload);

      if (insertError) {
        // log to console for debugging; RLS or column mismatch will appear here
        console.error("insertDownloadLog failed:", insertError);
        // don't throw — we want downloads to still proceed if logging fails
        return { success: false, error: insertError };
      }

      return { success: true, inserted };
    } catch (err: any) {
      console.error("insertDownloadLog unexpected error:", err);
      return { success: false, error: err };
    }
  };

  /**
   * Generic single-file downloader for data blobs
   */
  const triggerBrowserDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Main download function:
   * - supports folder item downloads (fileToDownload passed)
   * - supports single shared file (shareData.file)
   * - logs to download_logs with only allowed fields
   * - updates shared_links.download_count
   */
  const downloadFile = async (fileToDownload?: FolderFile) => {
    if (!shareData) return;

    // password protection
    if (shareData.password_hash && !passwordVerified) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter and verify the password before download",
      });
      return;
    }

    // download limit guard
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
      let fileMeta: { id?: string; original_name: string } | null = null;
      let storagePath = "";

      // decide which file and storage path
      if (fileToDownload) {
        fileMeta = { id: fileToDownload.id, original_name: fileToDownload.original_name };
        storagePath = fileToDownload.storage_path;
      } else if (shareData.file && shareData.file_id) {
        fileMeta = { id: shareData.file_id, original_name: shareData.file.original_name };
        storagePath = shareData.file.storage_path;
      } else {
        throw new Error("No file available to download");
      }

      // download binary from Supabase Storage
      const { data: fileBlob, error: storageError } = await supabase.storage
        .from("files")
        .download(storagePath);

      if (storageError) throw storageError;
      if (!fileBlob) throw new Error("Downloaded file blob is empty");

      // browser download
      triggerBrowserDownload(fileBlob, fileMeta.original_name);

      // attempt to insert download log (only allowed columns)
      if (fileMeta.id) {
        const { success, error: logErr } = await insertDownloadLog(fileMeta.id, "public_shared");
        if (!success) {
          // Show non-blocking warning to user & log for debug
          console.warn("Download log insertion failed:", logErr);
          // We avoid showing destructive toast here because we don't want normal users alarmed.
        }
      } else {
        console.warn("No file id to log for download");
      }

      // increment shared link download_count (best-effort)
      try {
        const { error: updateError } = await supabase
          .from("shared_links")
          .update({ download_count: (shareData.download_count || 0) + 1 })
          .eq("id", shareData.id);
        if (updateError) {
          console.error("Failed to increment shared_links.download_count:", updateError);
        } else {
          // optimistic local update so UI reflects new count immediately
          setShareData({ ...shareData, download_count: (shareData.download_count || 0) + 1 });
        }
      } catch (uErr) {
        console.error("update download_count unexpected error:", uErr);
      }

      toast({
        title: "Download started",
        description: fileMeta.original_name,
      });
    } catch (err: any) {
      console.error("downloadFile error:", err);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: err?.message || "An error occurred during download",
      });
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * UI states
   */
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
                : "Someone shared a file with you"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {passwordRequired && !passwordVerified ? (
              <>
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    This content is password protected. Please enter the password to continue.
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
                      Folder with {folderFiles.length} file{folderFiles.length !== 1 ? "s" : ""}
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
                      Downloads: {shareData.download_count}/{shareData.download_limit}
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
                          <p className="text-sm font-medium truncate">{file.original_name}</p>
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


