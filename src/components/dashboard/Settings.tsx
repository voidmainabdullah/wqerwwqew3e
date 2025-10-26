import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, CloudUpload, FileText, Info, Shield } from "lucide-react";


export const FileBackupPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [reason, setReason] = useState("");
  const [backupRequests, setBackupRequests] = useState<any[]>([]);

  // Fetch user's backup requests
  useEffect(() => {
    if (user) fetchBackupRequests();
  }, [user]);

  const fetchBackupRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("file_backups")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBackupRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching backup requests:", error);
    }
  };

  // Submit backup request
  const handleBackupRequest = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to request a backup.",
      });
      return;
    }
    if (!fileName.trim()) {
      toast({
        variant: "destructive",
        title: "File name required",
        description: "Please enter the file name or ID for backup.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("file_backups").insert([
        {
          user_id: user.id,
          email: user.email,
          file_name: fileName,
          reason,
          status: "Pending",
        },
      ]);
      if (error) throw error;

      // Optionally send a confirmation email (pseudo backend trigger)
      await supabase.functions.invoke("send-backup-email", {
        body: {
          email: user.email,
          file_name: fileName,
          reason,
        },
      });

      toast({
        title: "Request Sent",
        description:
          "Your file backup request has been submitted successfully. You’ll be notified via email.",
      });

      setFileName("");
      setReason("");
      fetchBackupRequests();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-heading font-bold text-blue-500">
          File Backup Requests
        </h1>
        <p className="text-neutral-400 font-body max-w-lg mx-auto">
          Request backups of your uploaded files and track their processing status.
        </p>
      </div>

      {/* Request Form */}
      <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all max-w-2xl mx-auto mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <CloudArrowUp className="text-blue-400" size={20} /> Request a Backup
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Submit a file backup request using your registered email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-heading">Email Address</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-zinc-800 text-neutral-400"
            />
          </div>
          <div>
            <Label className="font-heading">File Name or ID</Label>
            <Input
              placeholder="Enter the file name or ID"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-zinc-800"
            />
          </div>
          <div>
            <Label className="font-heading">Reason (optional)</Label>
            <Input
              placeholder="Why do you need this backup?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-zinc-800"
            />
          </div>
          <Button
            onClick={handleBackupRequest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            {loading ? "Submitting..." : "Send Backup Request"}
          </Button>
        </CardContent>
      </Card>

      {/* Backup Request History */}
      <Card className="border border-zinc-800 bg-zinc-900/70 backdrop-blur-sm hover:border-blue-500/40 transition-all max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Mail className="text-blue-400" size={20} /> Request History
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Track your recent file backup requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupRequests.length === 0 ? (
            <p className="text-neutral-400 text-center py-6">
              No backup requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {backupRequests.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-zinc-800 rounded-lg px-4 py-3 bg-zinc-950/50 hover:border-blue-500/30 transition-all"
                >
                  <div>
                    <p className="font-heading text-sm text-white">
                      {req.file_name}
                    </p>
                    <p className="text-neutral-400 text-xs">
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        req.status === "Completed"
                          ? "bg-green-700"
                          : req.status === "Pending"
                          ? "bg-yellow-700"
                          : "bg-red-700"
                      } text-white`}
                    >
                      {req.status}
                    </Badge>
                    <Info
                      size={18}
                      className="text-neutral-400 hover:text-blue-400 cursor-pointer"
                      title={req.reason || "No reason provided"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <div className="max-w-3xl mx-auto mt-10 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
        <Shield size={18} className="text-blue-400" />
        <p>
          All backup requests are encrypted and reviewed manually by the SkieShare
          data team. You will receive confirmation once the backup is available.
        </p>
      </div>
    </div>
  );
};
 