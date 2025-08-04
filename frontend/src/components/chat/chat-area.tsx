"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatSession } from '@/lib/types';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { QuickActions } from '@/components/chat/quick-actions';
import { Logo } from '../logo';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  chat: ChatSession | undefined;
  onSendMessage: (content: string, mode: 'general' | 'spiritual') => void;
  isLoading: boolean;
}

export function ChatArea({ chat, onSendMessage, isLoading }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageCountRef = useRef(0);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Get the scrollable element (now it's the ref directly)
  const getScrollElement = useCallback(() => {
    return scrollAreaRef.current;
  }, []);

  // Check if user is at the bottom of the chat
  const isAtBottom = useCallback(() => {
    const element = getScrollElement();
    if (!element) return false;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [getScrollElement]);

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((force = false) => {
    const element = getScrollElement();
    if (!element) return;

    // Don't auto-scroll if user is manually scrolling, unless forced
    if (isUserScrolling && !force) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: force ? 'auto' : 'smooth'
    });
  }, [getScrollElement, isUserScrolling]);

  // Handle scroll events with debouncing
  const handleScroll = useCallback(() => {
    const element = getScrollElement();
    if (!element) return;

    // Mark as user scrolling and set timeout to reset
    setIsUserScrolling(true);

    // Clear previous timeout
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }

    // Reset user scrolling flag after 1 second of no scrolling
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);

    // Show/hide scroll to bottom button
    const atBottom = isAtBottom();
    setShowScrollButton(!atBottom && (chat?.messages.length || 0) > 0);
  }, [getScrollElement, isAtBottom, chat?.messages.length]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const currentMessageCount = chat?.messages.length || 0;
    const hasNewMessages = currentMessageCount > lastMessageCountRef.current;

    if (hasNewMessages) {
      // For new messages, only auto-scroll if user isn't actively scrolling
      // or if it's the first message
      if (!isUserScrolling || lastMessageCountRef.current === 0) {
        // Small delay to ensure DOM is updated
        const timer = setTimeout(() => {
          scrollToBottom(lastMessageCountRef.current === 0);
        }, 50);

        lastMessageCountRef.current = currentMessageCount;
        return () => clearTimeout(timer);
      }
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [chat?.messages, isUserScrolling, scrollToBottom]);

  // Set up scroll listener
  useEffect(() => {
    const element = getScrollElement();
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        element.removeEventListener('scroll', handleScroll);
        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll, getScrollElement]);

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex-1 relative">
        {/* Using a simpler scrollable div instead of ScrollArea for better control */}
        <div
          ref={scrollAreaRef}
          className="absolute inset-0 overflow-y-auto scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) transparent'
          }}
        >
          <div className="p-4 md:p-8">
            {chat && chat.messages.length > 0 ? (
              <div className="space-y-6">
                {chat.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <ChatMessage message={{ id: 'loading', role: 'assistant', content: '' }} isLoading />
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <Logo />
                <h1 className="text-2xl font-headline font-semibold">Cognito AI</h1>
                <p className="text-muted-foreground">Start a conversation or try a quick action.</p>
                <QuickActions onSelectAction={(action) => onSendMessage(action, chat?.mode || 'general')} mode={chat?.mode || 'general'} />
              </div>
            )}
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => scrollToBottom(true)}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-background shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          currentMode={chat?.mode || 'general'}
        />
      </div>
    </div>
  );
}
