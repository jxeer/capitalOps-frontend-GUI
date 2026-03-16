import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserCheck, UserX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ConnectionRequestButtonProps {
  userId: string;
  targetUserId: string;
  connectionStatus?: "connected" | "request_sent" | "request_received";
}

export function ConnectionRequestButton({
  userId,
  targetUserId,
  connectionStatus,
}: ConnectionRequestButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendRequest = async () => {
    if (!userId) {
      toast({ title: "Please login to send connection requests", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/connection-requests", {
        receiverId: targetUserId,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request");
      
      toast({ title: "Connection request sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
    } catch (err: any) {
      toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await apiRequest("PUT", `/api/connection-requests/${requestId}`, {
        status: "accepted",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept request");
      
      toast({ title: "Connection accepted" });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-pending"] });
    } catch (err: any) {
      toast({ title: "Failed to accept request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await apiRequest("PUT", `/api/connection-requests/${requestId}`, {
        status: "declined",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to decline request");
      
      toast({ title: "Connection request declined" });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-pending"] });
    } catch (err: any) {
      toast({ title: "Failed to decline request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await apiRequest("DELETE", `/api/connection-requests/${requestId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to withdraw request");
      
      toast({ title: "Connection request withdrawn" });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
    } catch (err: any) {
      toast({ title: "Failed to withdraw request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (connectionStatus === "connected") {
    return (
      <Button size="sm" variant="outline" disabled>
        <UserCheck className="h-4 w-4 mr-2" />
        Connected
      </Button>
    );
  }

  if (connectionStatus === "request_sent") {
    return (
      <Button size="sm" variant="outline" onClick={() => handleRemove("pending")} disabled={loading}>
        <UserX className="h-4 w-4 mr-2" />
        Withdraw Request
      </Button>
    );
  }

  if (connectionStatus === "request_received") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleAccept("pending")} disabled={loading}>
          <UserCheck className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleDecline("pending")} disabled={loading}>
          <UserX className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={handleSendRequest} disabled={loading || !userId}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
      Connect
    </Button>
  );
}
