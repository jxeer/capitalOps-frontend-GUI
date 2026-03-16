import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message, Conversation } from "@shared/schema";

interface CommunicationCenterProps {
  targetUserId?: string;
}

export function CommunicationCenter({ targetUserId }: CommunicationCenterProps) {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { data: pendingRequests } = useQuery({
    queryKey: ["/api/connection-pending"],
    enabled: !!user && !userLoading,
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages", { conversationId: selectedConversation?.id }],
    enabled: !!selectedConversation?.id,
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation?.id) throw new Error("No conversation selected");
      const res = await apiRequest("POST", "/api/messages", {
        conversationId: selectedConversation.id,
        content,
      });
      return res.json();
    },
    onSuccess: (message) => {
      if (selectedConversation?.id) {
        queryClient.setQueryData<Message[]>(["/api/messages", { conversationId: selectedConversation.id }], (prev) => [
          ...(prev || []),
          message,
        ]);
      }
      setMessageContent("");
      setSelectedConversation(null);
      toast({ title: "Message sent" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send message", description: err.message, variant: "destructive" });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const res = await apiRequest("POST", "/api/conversations", { otherUserId });
      return res.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(conversation);
      toast({ title: "Conversation started" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to start conversation", description: err.message, variant: "destructive" });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(messageContent.trim());
  };

  const handleCreateConversation = async (otherUserId: string) => {
    createConversationMutation.mutate(otherUserId);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  if (userLoading) return null;

  const otherUser = targetUserId
    ? conversations.find(c => c.userId1 === targetUserId || c.userId2 === targetUserId)
    : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Messages</h3>
          {targetUserId && (
            <Button size="sm" variant="ghost" onClick={() => setSelectedConversation(null)}>
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          )}
        </div>

        {targetUserId && !selectedConversation && !otherUser && (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No existing conversation with this user</p>
            <Button
              size="sm"
              onClick={() => handleCreateConversation(targetUserId)}
              disabled={createConversationMutation.isPending}
            >
              <User className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          </div>
        )}

        {!targetUserId && (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">Recent Conversations</p>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="p-3 rounded-lg bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {conv.userId1 === user?.id ? "You" : "Other User"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedConversation && (
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages?.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[10px] mt-1 text-right opacity-70">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Start the conversation!
                </p>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex gap-2"
            >
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
