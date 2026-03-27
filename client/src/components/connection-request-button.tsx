/**
 * ConnectionRequestButton Component
 * 
 * Purpose:
 * A stateful button component that handles all connection request actions:
 * sending, accepting, declining, and withdrawing connection requests.
 * Adapts its UI based on the current connection status between two users.
 * 
 * Key Features:
 * - Dynamic UI based on connection status (none, sent, received, connected)
 * - Optimistic UI with loading states during API calls
 * - Toast notifications for success/error feedback
 * - Query cache invalidation to sync UI after state changes
 * - Security check: validates userId before allowing actions
 * 
 * Security Considerations:
 * - Requires valid userId to send connection requests (auth check)
 * - All API calls use authenticated apiRequest helper
 * - Request IDs are internal (not user-supplied except for status updates)
 * - Rate limiting should be enforced server-side
 * 
 * State Management:
 * - Local loading state prevents double-submissions
 * - TanStack Query cache invalidation ensures data consistency
 * - Toast notifications provide feedback without blocking UI
 * 
 * Usage:
 * <ConnectionRequestButton
 *   userId={currentUser.id}
 *   targetUserId={profileUser.id}
 *   connectionStatus="request_sent"  // or "connected", "request_received", undefined
 * />
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserCheck, UserX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Props for ConnectionRequestButton component.
 * @interface ConnectionRequestButtonProps
 * @property userId - ID of the currently authenticated user (required for sending)
 * @property targetUserId - ID of the user to connect with
 * @property connectionStatus - Current state of the connection relationship
 */
interface ConnectionRequestButtonProps {
  userId: string;
  targetUserId: string;
  connectionStatus?: "connected" | "request_sent" | "request_received";
}

/**
 * ConnectionRequestButton handles all connection-related actions with a user.
 * 
 * Renders different UI based on connectionStatus:
 * - undefined: "Connect" button (send initial request)
 * - "request_sent": "Withdraw Request" button (cancel pending request)
 * - "request_received": "Accept" and "Decline" buttons (respond to incoming)
 * - "connected": Disabled "Connected" button (already connected)
 * 
 * @param userId - Current user's ID
 * @param targetUserId - Target user's ID
 * @param connectionStatus - Current connection state
 */
export function ConnectionRequestButton({
  userId,
  targetUserId,
  connectionStatus,
}: ConnectionRequestButtonProps) {
  // Local loading state prevents duplicate submissions during async operations
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Sends a new connection request to the target user.
   * 
   * API: POST /api/connection-requests
   * Payload: { receiverId: targetUserId }
   * 
   * On success: Invalidates connection-requests query to refresh lists
   * On failure: Shows error toast; button remains enabled for retry
   */
  const handleSendRequest = async () => {
    // Security: Ensure user is authenticated before allowing connection
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
      
      // Refresh connection request lists in the UI
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
    } catch (err: any) {
      toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accepts an incoming connection request.
   * 
   * API: PUT /api/connection-requests/{requestId}
   * Payload: { status: "accepted" }
   * 
   * On success: Invalidates multiple queries to sync connection state
   * Note: "pending" is used as requestId when acting on request_received status
   */
  const handleAccept = async (requestId: string) => {
    setLoading(true);
    try {
      const res = await apiRequest("PUT", `/api/connection-requests/${requestId}`, {
        status: "accepted",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept request");
      
      toast({ title: "Connection accepted" });
      
      // Invalidate all connection-related queries for consistent state
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-pending"] });
    } catch (err: any) {
      toast({ title: "Failed to accept request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Declines an incoming connection request.
   * 
   * API: PUT /api/connection-requests/{requestId}
   * Payload: { status: "declined" }
   * 
   * On success: Invalidates request lists
   * Note: Request is not deleted; status is set to "declined"
   */
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

  /**
   * Withdraws a previously sent connection request (cancel before accepted).
   * 
   * API: DELETE /api/connection-requests/{requestId}
   * 
   * On success: Removes request from sent list
   * Note: Can only withdraw pending requests; accepted/declined cannot be withdrawn
   */
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

  // --- Render States ---

  // State: Already connected
  if (connectionStatus === "connected") {
    return (
      <Button size="sm" variant="outline" disabled>
        <UserCheck className="h-4 w-4 mr-2" />
        Connected
      </Button>
    );
  }

  // State: Request previously sent (can withdraw)
  if (connectionStatus === "request_sent") {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => handleRemove("pending")} 
        disabled={loading}
      >
        <UserX className="h-4 w-4 mr-2" />
        Withdraw Request
      </Button>
    );
  }

  // State: Received request (can accept or decline)
  if (connectionStatus === "request_received") {
    return (
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleAccept("pending")} 
          disabled={loading}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleDecline("pending")} 
          disabled={loading}
        >
          <UserX className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
    );
  }

  // State: No existing relationship (can send new request)
  return (
    <Button 
      size="sm" 
      onClick={handleSendRequest} 
      disabled={loading || !userId}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Connect
    </Button>
  );
}
