import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Mail,
  Shield,
} from "lucide-react";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface ReceiveRequest {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export const ReceiveUploadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [receiveRequest, setReceiveRequest] = useState<ReceiveRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    loadReceiveRequest();
  }, [token]);

  const loadReceiveRequest = async () => {
    if (!token) {
      navigate("/404");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("receive_requests")
        .select("*")
        .eq("token", token)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "This receive link does not exist or has expired.",
        });
        navigate("/404");
        return;
      }

      setReceiveRequest(data);
    } catch (error: any) {
      console.error("Error loading receive request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load receive request.",
      });
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading || uploadComplete,
  });

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!receiveRequest || uploadFiles.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i];
        if (uploadFile.status !== "pending") continue;

        setUploadFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading", progress: 25 } : f
          )
        );

        try {
          const fileExt = uploadFile.file.name.split(".").pop();
          const fileName = `received/${receiveRequest.user_id}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

          const { error: storageError } = await supabase.storage
            .from("files")
            .upload(fileName, uploadFile.file, { upsert: false });

          if (storageError) throw storageError;

          const { data: fileData, error: fileError } = await supabase
            .from("files")
            .insert({
              user_id: receiveRequest.user_id,
              original_name: uploadFile.file.name,
              file_size: uploadFile.file.size,
              file_type: uploadFile.file.type || "application/octet-stream",
              storage_path: fileName,
            })
            .select()
            .single();

          if (fileError) throw fileError;

          const { error: linkError } = await supabase
            .from("received_files")
            .insert({
              receive_request_id: receiveRequest.id,
              file_id: fileData.id,
              uploader_name: uploaderName || null,
              uploader_email: uploaderEmail || null,
            });

          if (linkError) throw linkError;

          setUploadFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "success", progress: 100 } : f
            )
          );
        } catch (error: any) {
          console.error("Upload error:", error);
          setUploadFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "error", error: error.message || "Upload failed" }
                : f
            )
          );
        }
      }

      const successCount = uploadFiles.filter((f) => f.status === "success").length;
      if (successCount > 0) {
        setUploadComplete(true);
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} file(s)!`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ---------------- UI -------------------
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/sky.png" alt="SkyShare" className="h-8 w-8 rounded-md" />
          <h1 className="text-xl font-semibold tracking-tight">SkyShare</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="border-white/20 text-white hover:bg-blue-600 hover:border-blue-600"
        >
          Home
        </Button>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-12 mb-6"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Upload and Share Files Securely
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Lightning-fast transfers. Apple-like simplicity. Trusted SkyShare security.
        </p>
      </motion.div>

      {/* Upload Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">{receiveRequest?.name}</CardTitle>
              {receiveRequest?.description && (
                <CardDescription className="text-gray-400 text-base">
                  {receiveRequest.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uploaderName">Your Name</Label>
                  <Input
                    id="uploaderName"
                    placeholder="John Doe"
                    className="bg-black/40 border-white/10 text-white"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="uploaderEmail">Your Email</Label>
                  <Input
                    id="uploaderEmail"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-black/40 border-white/10 text-white"
                    value={uploaderEmail}
                    onChange={(e) => setUploaderEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-blue-400 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Drop your files here"
                    : "Click or drag files to upload"}
                </p>
                <p className="text-sm text-gray-400">
                  Supports all file types • Secure transfer
                </p>
              </div>

              {/* File List */}
              {uploadFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-300">
                      {uploadFiles.length} file(s) selected
                    </h3>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                      {isUploading ? "Uploading..." : "Upload All"}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {uploadFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/10"
                      >
                        {f.status === "pending" && (
                          <FileText className="text-gray-400 h-5 w-5" />
                        )}
                        {f.status === "success" && (
                          <CheckCircle className="text-green-500 h-5 w-5" />
                        )}
                        {f.status === "error" && (
                          <AlertCircle className="text-red-500 h-5 w-5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{f.file.name}</p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(f.file.size)}
                          </p>
                          {f.status === "uploading" && (
                            <Progress value={f.progress} className="h-1 mt-1" />
                          )}
                        </div>
                        {f.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => removeFile(i)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 border-t border-white/10 py-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <p>
            © {new Date().getFullYear()} SkyShare — Built for speed and privacy.
          </p>
        </div>
      </footer>
    </div>
  );
};
