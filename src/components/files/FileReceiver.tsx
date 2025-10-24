import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Share2,
  Mail,
  QrCode,
  Link as LinkIcon,
  Info,
  FileText,
  Globe,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface RecentRequest {
  id: string;
  title: string;
  date: string;
  link: string;
}

export const FileReceiver: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [receiverName, setReceiverName] = useState("");
  const [description, setDescription] = useState("");
  const [receiveUrl, setReceiveUrl] = useState("");
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);

  const generateReceiveLink = () => {
    if (!user) return;

    const baseUrl = window.location.origin;
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    const url = `${baseUrl}/receive/${token}`;
    setReceiveUrl(url);

    const newRequest: RecentRequest = {
      id: token,
      title: receiverName || "Untitled Request",
      date: new Date().toLocaleString(),
      link: url,
    };

    setRecentRequests((prev) => [newRequest, ...prev.slice(0, 4)]);
    toast({
      title: "New link created",
      description: "Your secure file receive link has been generated.",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receiveUrl);
      toast({
        title: "Copied",
        description: "Receive link copied to clipboard",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the link",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `Send me files - ${receiverName || "File Request"}`
    );
    const body = encodeURIComponent(
      `Hi!\n\nPlease send me files using this secure link:\n${receiveUrl}\n\n${
        description ? `Description: ${description}\n\n` : ""
      }Thanks!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <motion.div
      className="space-y-8 px-4 sm:px-6 md:px-10 py-6 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Request Files
          </h1>
          <p className="text-muted-foreground">
            Create and manage secure links to receive files from others.
          </p>
        </div>
        <Button
          onClick={generateReceiveLink}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Share2 className="mr-2 h-4 w-4" />
          New Receive Link
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Create Request */}
        <Card className="shadow-md border border-border/40">
          <CardHeader>
            <CardTitle>Create File Request</CardTitle>
            <CardDescription>
              Fill details and generate a secure link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="receiverName">Request Name (optional)</Label>
              <Input
                id="receiverName"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g., Project files, Design drafts..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details or instructions..."
              />
            </div>

            <Button
              onClick={generateReceiveLink}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Generate Link
            </Button>
          </CardContent>
        </Card>

        {/* Right: Share Link */}
        {receiveUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md border border-border/40">
              <CardHeader>
                <CardTitle>Share Your Link</CardTitle>
                <CardDescription>
                  Copy or share your receive link instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Receive Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={receiveUrl}
                      readOnly
                      className="font-mono text-xs sm:text-sm"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={shareViaEmail}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Send me files",
                          text:
                            description ||
                            "Please send me files using this secure link",
                          url: receiveUrl,
                        });
                      } else {
                        copyToClipboard();
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-md border border-border/40">
                  <h4 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" /> How it works
                  </h4>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Share your unique link with anyone.</li>
                    <li>• They can securely upload files to your account.</li>
                    <li>• You’ll get notified when files arrive.</li>
                    <li>• Only you can access uploaded files.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-dashed border-2 border-border/40 flex items-center justify-center text-muted-foreground py-12">
            <div className="text-center">
              <QrCode className="mx-auto mb-4 h-10 w-10 opacity-70" />
              <p className="text-sm">No link created yet</p>
              <p className="text-xs">
                Generate a link to start receiving files securely
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Requests */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent File Requests</CardTitle>
            <CardDescription>
              View your recently generated receive links.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRecentRequests([])}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentRequests.map((req) => (
                <motion.div
                  key={req.id}
                  className="border rounded-md p-4 bg-muted hover:shadow-md transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium truncate">{req.title}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        navigator.clipboard.writeText(req.link).then(() =>
                          toast({
                            title: "Copied",
                            description: "Link copied to clipboard",
                          })
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {req.link}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.date}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 opacity-60" />
              <p className="font-medium">No file requests found</p>
              <p className="text-sm">
                Your created receive links will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Tip */}
      <div className="text-center text-sm text-muted-foreground pt-6">
        <Globe className="inline h-4 w-4 mr-1" />
        Powered by <span className="text-blue-600 font-medium">SkieShare</span>
      </div>
    </motion.div>
  );
};

export default FileReceiver;
