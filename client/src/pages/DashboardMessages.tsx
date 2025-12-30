import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Search,
  Loader2,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function DashboardMessages() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const convId = params.get('conversation');
    if (convId) {
      setSelectedConversationId(parseInt(convId));
    }
  }, [location]);

  const { data: conversations, isLoading: convLoading } = trpc.conversation.list.useQuery();
  const { data: messages, isLoading: msgLoading, refetch: refetchMessages } = trpc.message.getByConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId, refetchInterval: 5000 }
  );

  const sendMessage = trpc.message.send.useMutation();
  const markAsRead = trpc.conversation.markAsRead.useMutation();
  const utils = trpc.useUtils();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversationId,
        content: newMessage.trim(),
      });
      setNewMessage("");
      refetchMessages();
      utils.conversation.list.invalidate();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedConversation = conversations?.find((c: any) => c.id === selectedConversationId);

  const filteredConversations = conversations?.filter((conv: any) => {
    if (!searchQuery) return true;
    return conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communiquez avec vos clients et freelances
          </p>
        </div>
      </div>

      <Card className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={cn(
          "w-full sm:w-80 border-r flex flex-col",
          selectedConversationId && "hidden sm:flex"
        )}>
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {convLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map((conv: any) => (
                  <button
                    key={conv.id}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                      selectedConversationId === conv.id && "bg-muted"
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={conv.otherUser?.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.otherUser?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {conv.otherUser?.name || "Utilisateur"}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.lastMessage || "Aucun message"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Aucune conversation</p>
                <p className="text-sm">Vos messages apparaîtront ici</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedConversationId && "hidden sm:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.otherUser?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConversation.otherUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedConversation.otherUser?.name || "Utilisateur"}
                  </p>
                  {selectedConversation.otherUser?.isSeller && (
                    <p className="text-xs text-muted-foreground">Freelance</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {msgLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        <Skeleton className="h-16 w-48 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg: any) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                            )}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwn && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun message</p>
                      <p className="text-sm">Envoyez le premier message</p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessage.isPending}
                  />
                  <Button 
                    className="btn-benin shrink-0"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Sélectionnez une conversation</p>
                <p className="text-sm">Choisissez une conversation pour voir les messages</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
