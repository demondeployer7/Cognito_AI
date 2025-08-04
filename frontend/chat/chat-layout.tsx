
"use client";

import { useState, useEffect } from 'react';
import type { ChatSession, Message } from '@/lib/types';
import { mockChatSessions } from '@/lib/mock-data';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatArea } from '@/components/chat/chat-area';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Plus, PanelLeft } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface ChatLayoutProps {
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
}


export default function ChatLayout({
  defaultLayout = [250, 750], // Updated to 25% sidebar (250px) and 75% main area (750px)
  defaultCollapsed = false
}: ChatLayoutProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem('cognito-ai-chats');
      const storedActiveId = localStorage.getItem('cognito-ai-active-id');
      const storedCollapsed = localStorage.getItem('react-resizable-panels:collapsed');

      let chatsHistory: ChatSession[] = [];
      if (storedChats) {
        // Ensure dates are properly parsed back into Date objects
        chatsHistory = JSON.parse(storedChats).map((chat: ChatSession) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
      }

      if (chatsHistory.length > 0) {
        setChats(chatsHistory);
        // Validate active ID or default to the most recent chat
        const activeId = storedActiveId && chatsHistory.some(c => c.id === storedActiveId)
          ? storedActiveId
          : chatsHistory[0].id; // Assuming chats are sorted newest first
        setActiveChatId(activeId);
      } else {
        // If no chats are in storage, start a new one
        const newChat: ChatSession = {
          id: `chat-${nanoid()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date(),
          mode: 'general',
        };
        setChats([newChat]);
        setActiveChatId(newChat.id);
      }

      if (storedCollapsed) {
        setIsCollapsed(JSON.parse(storedCollapsed));
      }
    } catch (error) {
      console.error("Failed to initialize chat from localStorage", error);
      // Fallback to a new chat session on any error
      const newChat: ChatSession = {
        id: `chat-${nanoid()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        mode: 'general',
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cognito-ai-chats', JSON.stringify(chats));
        if (activeChatId) localStorage.setItem('cognito-ai-active-id', activeChatId);
      } catch (error) {
        console.error("Failed to save chats to localStorage", error);
      }
    }
  }, [chats, activeChatId, isLoaded]);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: `chat-${nanoid()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      mode: 'general',
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleSendMessage = async (content: string, mode?: 'general' | 'spiritual') => {
    // If no active chat exists, create a new one
    let currentActiveChatId = activeChatId;
    if (!currentActiveChatId) {
      const newChat: ChatSession = {
        id: `chat-${nanoid()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        mode: mode || 'general',
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      currentActiveChatId = newChat.id;
    }

    const userMessage: Message = { id: nanoid(), role: 'user', content };

    // Optimistically update the UI with the user's message
    setChats(prevChats => {
      const newChats = prevChats.map(chat => {
        if (chat.id === currentActiveChatId) {
          const updatedMessages = [...chat.messages, userMessage];
          const updatedChat = { ...chat, messages: updatedMessages };
          // Update title for the first message
          if (chat.messages.length === 0) {
            updatedChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          }
          // Update mode if it has changed
          if (mode && chat.mode !== mode) {
            updatedChat.mode = mode;
          }
          return updatedChat;
        }
        return chat;
      });
      return newChats;
    });

    setIsLoading(true);

    try {
      const currentChat = chats.find(c => c.id === currentActiveChatId);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, mode: mode || currentChat?.mode || 'general' }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      const assistantResponse: Message = {
        id: nanoid(),
        role: 'assistant',
        content: data.response,
      };

      // Update the UI with the assistant's response
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === currentActiveChatId) {
            return { ...chat, messages: [...chat.messages, assistantResponse] };
          }
          return chat;
        });
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorResponse: Message = {
        id: nanoid(),
        role: 'assistant',
        content: "Sorry, I couldn't connect to the AI assistant. Please try again later.",
      };
      // Update the UI with the error message
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === currentActiveChatId) {
            return { ...chat, messages: [...chat.messages, errorResponse] };
          }
          return chat;
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => {
      const remainingChats = prev.filter(c => c.id !== chatId);
      if (activeChatId === chatId) {
        setActiveChatId(remainingChats[0]?.id || null);
      }
      return remainingChats;
    });
  };

  if (!isLoaded) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
      }}
      className="h-screen w-full items-stretch"
    >
      <ResizablePanel
        collapsible={true}
        defaultSize={25} // Set default to 25% of screen width
        minSize={12}     // Reduced minimum size
        maxSize={35}     // Limit maximum size to 35% of screen
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
        }}
        className={isCollapsed ? 'min-w-[50px] transition-all duration-300 ease-in-out' : 'min-w-[200px] max-w-[400px]'}
      >
        <ChatSidebar
          isCollapsed={isCollapsed}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onDeleteChat={handleDeleteChat}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} minSize={65}> {/* Set to 75% to complement 25% sidebar */}
        <div className="flex flex-col h-full min-h-0"> {/* Added min-h-0 to prevent overflow */}
          <header className="flex items-center justify-between p-4 border-b h-16 shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsCollapsed(!isCollapsed)}>
                <PanelLeft />
              </Button>
            </div>
            <Button onClick={handleNewChat} size="sm"><Plus /> New Chat</Button>
          </header>
          <div className="flex-1 min-h-0"> {/* Wrapper for chat area with proper flex */}
            <ChatArea
              chat={activeChat}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
