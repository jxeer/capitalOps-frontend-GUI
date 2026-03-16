import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ConnectionRequestListProps {
  type?: "sent" | "received";
}

export function ConnectionRequestList({ type = "received" }: ConnectionRequestListProps) {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: type === "received" ? ["/api/connection-pending"] : ["/api/connection-requests"],
    enabled: !!user && !userLoading,
  });

  const handleRespond = async (requestId: string, status: "accepted" | "declined") => {
    try {
      const res = await apiRequest("PUT", `/api/connection-requests/${requestId}`, { status });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to respond");
      toast({ title: `Connection ${status}` });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-pending"] });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  if (userLoading) return null;
  if (isLoading) return <div className="p-6 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const requestsList: any = type === "received" ? requests : requests?.filter((r: any) => r.senderId === user?.id && r.status === "pending");

  if (!requestsList || requestsList.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">{type === "received" ? "No pending connection requests" : "No pending sent requests"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{type === "received" ? "Pending Requests" : "Sent Requests"}</h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {requestsList.map((request: any) => {
              const sender = request.senderId === user?.id ? user : request.senderId;
              return (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{sender?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{sender?.username}</p>
                      <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</p>
                      {request.message && <p className="text-xs text-muted-foreground mt-1 italic">"{request.message}"</p>}
                    </div>
                  </div>
                  {type === "received" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRespond(request.id, "declined")}>Decline</Button>
                      <Button size="sm" onClick={() => handleRespond(request.id, "accepted")}>Accept</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
