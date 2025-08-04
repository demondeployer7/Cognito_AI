"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/lib/types';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { HealthStatus } from './health-status';

interface ChatSidebarProps {
  isCollapsed: boolean;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  isCollapsed,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex flex-col h-full bg-card transition-all duration-300 rounded-lg m-2", isCollapsed ? 'p-2 items-center' : 'p-4')}>
        {!isCollapsed && (
          <>
            <div className="pb-4">
              <Logo />
            </div>
            <Separator />
            <div className="py-4 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        <ScrollArea className="flex-1">
          <div className={cn("space-y-1", isCollapsed ? 'w-full' : 'p-2')}>
            {filteredChats.map(chat => (
              <Tooltip key={chat.id}>
                <TooltipTrigger asChild>
                  <div className="group relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 px-3",
                        activeChatId === chat.id && "bg-secondary",
                        isCollapsed && 'justify-center p-2'
                      )}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1">
                            <p className="font-medium truncate max-w-40">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(chat.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                        )}
                      </div>
                    </Button>
                    {!isCollapsed && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" align="center">
                    <p>{chat.title}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className={cn("mt-auto flex items-center", isCollapsed ? 'flex-col gap-2 p-2' : 'p-4')}>
          <HealthStatus isCollapsed={isCollapsed} />
        </div>
      </div>
    </TooltipProvider>
  );
}
