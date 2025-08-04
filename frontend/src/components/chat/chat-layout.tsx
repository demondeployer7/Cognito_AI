
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
  defaultLayout = [25, 75], // 25% sidebar, 75% main area
  defaultCollapsed = false
}: ChatLayoutProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem('cognito-ai-chats');
      const storedActiveId = localStorage.getItem('cognito-ai-active-id');
      const storedCollapsed = localStorage.getItem('react-resizable-panels:collapsed');

      if (storedChats) {
        const parsedChats: ChatSession[] = JSON.parse(storedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
        setChats(parsedChats);
        setActiveChatId(storedActiveId ?? (parsedChats[0]?.id || null));
      } else {
        setChats(mockChatSessions);
        setActiveChatId(mockChatSessions[0]?.id || null);
      }
      if (storedCollapsed) {
        setIsCollapsed(JSON.parse(storedCollapsed));
      }
    } catch (error) {
      console.error("Failed to load chats from localStorage", error);
      setChats(mockChatSessions);
      setActiveChatId(mockChatSessions[0]?.id || null);
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
    if (!activeChat) return;

    const userMessage: Message = { id: nanoid(), role: 'user', content };
    const updatedMessages = [...activeChat.messages, userMessage];
    let updatedChat = { ...activeChat, messages: updatedMessages };

    if (mode && activeChat.mode !== mode) {
      updatedChat.mode = mode;
    }

    if (activeChat.messages.length === 0) {
      updatedChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    setChats(chats.map(chat => chat.id === activeChatId ? updatedChat : chat));
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, mode: updatedChat.mode }),
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

      updatedChat = { ...updatedChat, messages: [...updatedMessages, assistantResponse] };
      setChats(chats.map(chat => chat.id === activeChatId ? updatedChat : chat));

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorResponse: Message = {
        id: nanoid(),
        role: 'assistant',
        content: "Sorry, I couldn't connect to the AI assistant. Please try again later.",
      };
      updatedChat = { ...updatedChat, messages: [...updatedMessages, errorResponse] };
      setChats(chats.map(chat => chat.id === activeChatId ? updatedChat : chat));
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
      <ResizablePanel defaultSize={75} minSize={65}>
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b h-16 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsCollapsed(!isCollapsed)}>
                <PanelLeft />
              </Button>
            </div>
            <Button onClick={handleNewChat} size="sm"><Plus /> New Chat</Button>
          </header>
          <ChatArea
            chat={activeChat}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
