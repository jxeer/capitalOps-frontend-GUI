import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationCenter } from "@/components/communication-center";
import { ConnectionRequestList } from "@/components/connection-request-list";
import { User, MessageSquare, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { User as UserType } from "@shared/schema";

export default function Connections() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [discoverTerm, setDiscoverTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: connections, isLoading: connectionsLoading } = useQuery<UserType[]>({
    queryKey: ["/api/connections"],
    enabled: !!user,
  });

   const { data: pendingRequests, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/connection-pending"],
    enabled: !!user,
  });

  const { data: allUsers, isLoading: allUsersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Search users via API - TODO: Implement search endpoint
      toast({ title: "Search not implemented yet", description: "This feature will be added soon" });
    }
  };

  if (isLoading || (activeTab === "all" && connectionsLoading)) return null;

  const filteredConnections = connections?.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = pendingRequests?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-muted-foreground">Manage your professional network</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <User className="h-4 w-4 mr-2" />
            All Connections
            {connections && <span className="ml-2 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs">{connections.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-2" />
            Connection Requests
            {pendingCount > 0 && <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search connections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

               <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-accent/20 mb-4">
                    <h3 className="text-sm font-semibold mb-2">Find New Users</h3>
                    <form onSubmit={(e) => { e.preventDefault(); /* Search functionality */ }} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by username, title, or organization..."
                          value={discoverTerm}
                          onChange={(e) => setDiscoverTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </form>
                  </div>
                  {activeTab === "all" && !searchTerm && (
                    <div className="p-4 rounded-lg bg-accent/20 mb-4">
                      <p className="text-sm text-muted-foreground mb-3">Quick Actions</p>
                      <div className="space-y-2">
                        {allUsers?.filter(u => u.id !== user?.id).slice(0, 5).map((otherUser) => (
                          <div key={otherUser.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{otherUser.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{otherUser.username}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={async () => {
                                  try {
                                    await apiRequest("POST", "/api/connection-requests", { receiverId: otherUser.id });
                                    toast({ title: "Connection request sent", description: `Request sent to ${otherUser.username}` });
                                    queryClient.invalidateQueries({ queryKey: ["/api/connection-pending"] });
                                  } catch (err: any) {
                                    toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
                                  }
                                }}
                              >
                                + Connect
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredConnections?.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/20">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.profileImage} alt={connection.username} />
                          <AvatarFallback>{connection.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{connection.username}</p>
                          <p className="text-xs text-muted-foreground capitalize">{connection.profileType || "User"}</p>
                        </div>
                      </div>
                       <div className="flex gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={async () => {
                             try {
                               const res = await apiRequest("POST", "/api/conversations", { otherUserId: connection.id });
                               const conversation = await res.json();
                               toast({ title: "Conversation started", description: "You can now message this user" });
                               queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
                             } catch (err: any) {
                               toast({ title: "Failed to start conversation", description: err.message, variant: "destructive" });
                             }
                           }}
                         >
                           <MessageSquare className="h-4 w-4 mr-2" />
                           Message
                         </Button>
                       </div>
                    </div>
                  ))}
                  {activeTab === "all" && searchTerm && !filteredConnections?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No connections matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <ConnectionRequestList type="received" />
        </TabsContent>

        <TabsContent value="messages">
          <CommunicationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
