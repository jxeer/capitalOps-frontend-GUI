/**
 * CapitalOps Connections Page
 * 
 * Purpose: Manages professional networking through connections, connection requests,
 * and 1-on-1 messaging between users on the platform.
 * 
 * Approach:
 * - Tabbed interface separating connections, requests, and messages
 * - Search/discover users by username
 * - Send/accept/decline connection requests
 * - Real-time messaging with connected users
 * 
 * Key Features:
 * - All Connections tab: List of accepted connections with search
 * - Connection Requests tab: Pending incoming/outgoing requests
 * - Messages tab: 1-on-1 conversations with connected users
 * - User discovery search for finding new connections
 * - CommunicationCenter component for messaging UI
 * 
 * Related Components:
 * - CommunicationCenter: Full messaging interface
 * - ConnectionRequestList: Request management UI
 * 
 * Related Backend Routes:
 * - GET /api/connections - List user's accepted connections
 * - GET /api/connection-pending - List pending requests
 * - POST /api/connection-requests - Send connection request
 * - PUT /api/connection-requests/:id - Accept/decline request
 * - GET /api/conversations - List user's conversations
 * - POST /api/messages - Send message
 */

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

/**
 * Main Connections Page Component
 * 
 * Three main tabs:
 * 1. "all" - Accepted connections with search
 * 2. "requests" - Pending connection requests
 * 3. "messages" - 1-on-1 messaging
 */
export default function Connections() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [discoverTerm, setDiscoverTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch user's accepted connections
  const { data: connections, isLoading: connectionsLoading } = useQuery<UserType[]>({
    queryKey: ["/api/connections"],
    enabled: !!user,
  });

  // Fetch pending connection requests (both sent and received)
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/connection-pending"],
    enabled: !!user,
  });

  // Fetch all users for discovery
  const { data: allUsers, isLoading: allUsersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  /**
   * Handle search form submission
   * 
   * TODO: Search endpoint not yet implemented on backend
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Search users via API - TODO: Implement search endpoint
      toast({ title: "Search not implemented yet", description: "This feature will be added soon" });
    }
  };

  // Show nothing while loading
  if (isLoading || (activeTab === "all" && connectionsLoading)) return null;

  // Filter connections by search term
  const filteredConnections = connections?.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count pending requests for badge
  const pendingCount = pendingRequests?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-muted-foreground">Manage your professional network</p>
        </div>
      </div>

      {/* Tabbed interface */}
      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          {/* All Connections tab with count badge */}
          <TabsTrigger value="all">
            <User className="h-4 w-4 mr-2" />
            All Connections
            {connections && <span className="ml-2 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs">{connections.length}</span>}
          </TabsTrigger>
          
          {/* Connection Requests tab with pending count badge */}
          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-2" />
            Connection Requests
            {pendingCount > 0 && <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>}
          </TabsTrigger>
          
          {/* Messages tab */}
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="all" className="space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Connections list */}
          {filteredConnections && filteredConnections.length > 0 ? (
            <div className="grid gap-4">
              {filteredConnections.map((connection) => (
                <ConnectionCard key={connection.id} user={connection} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No connections yet. Start networking!</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {/* Connection request management */}
          <ConnectionRequestList requests={pendingRequests || []} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {/* Messaging interface */}
          <CommunicationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * ConnectionCard Component
 * 
 * Displays a single connection with avatar, name, and quick actions.
 */
function ConnectionCard({ user }: { user: UserType }) {
  const avatarFallback = user.username?.substring(0, 2).toUpperCase() || "??";

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* User avatar */}
        {user.profileImage ? (
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        )}

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.fullName || user.username}</p>
          <p className="text-sm text-muted-foreground truncate">
            {user.title || user.profileType || "User"}
            {user.organization ? ` at ${user.organization}` : ""}
          </p>
        </div>

        {/* Message button */}
        <Button size="sm" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
      </CardContent>
    </Card>
  );
}
