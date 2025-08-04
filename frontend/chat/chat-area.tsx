"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatSession } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { Logo } from '../logo';
import { ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  chat: ChatSession | undefined;
  onSendMessage: (content: string, mode: 'general' | 'spiritual') => void;
  isLoading: boolean;
}

export function ChatArea({ chat, onSendMessage, isLoading }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastMessageCountRef = useRef(0);

  // Get the viewport element from Radix ScrollArea
  const getViewport = useCallback(() => {
    return scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
  }, []);

  // Check scroll position and calculate progress
  const checkScrollPosition = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return { atBottom: false, atTop: true, progress: 0 };

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const threshold = 100; // pixels from edges

    const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
    const atTop = scrollTop < threshold;
    const progress = scrollHeight > clientHeight ?
      Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100)) : 0;

    return { atBottom, atTop, progress };
  }, [getViewport]);

  // Scroll to bottom with smooth animation
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    const viewport = getViewport();
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior
      });
    }
  }, [getViewport]);

  // Scroll to top with smooth animation
  const scrollToTop = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    const viewport = getViewport();
    if (viewport) {
      viewport.scrollTo({
        top: 0,
        behavior
      });
    }
  }, [getViewport]);

  // Handle scroll events with better detection
  const handleScroll = useCallback(() => {
    const { atBottom, atTop, progress } = checkScrollPosition();
    const hasMessages = (chat?.messages.length || 0) > 0;

    setIsAtBottom(atBottom);
    setIsAtTop(atTop);
    setScrollProgress(progress);
    setShowScrollButton(!atBottom && hasMessages);
    setShowScrollToTop(!atTop && hasMessages && progress > 20); // Show after scrolling down 20%
  }, [checkScrollPosition, chat?.messages.length]);

  // Auto-scroll when new messages arrive or when loading
  useEffect(() => {
    const currentMessageCount = chat?.messages.length || 0;
    const hasNewMessages = currentMessageCount > lastMessageCountRef.current;

    // Always scroll to bottom when:
    // 1. User was already at bottom and new message arrives
    // 2. Loading state changes to true (new message being typed)
    // 3. First time loading messages
    if ((isAtBottom && hasNewMessages) || isLoading || lastMessageCountRef.current === 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [chat?.messages, isLoading, isAtBottom, scrollToBottom]);

  // Additional effect to handle content changes within messages (for streaming)
  useEffect(() => {
    if (isAtBottom && chat?.messages && chat.messages.length > 0) {
      // Create a longer timeout for streaming content updates
      const timeoutId = setTimeout(() => {
        scrollToBottom('smooth');
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [chat?.messages, isAtBottom, scrollToBottom]);

  // Continuously scroll during loading (for streaming responses)
  useEffect(() => {
    if (isLoading && isAtBottom) {
      const interval = setInterval(() => {
        scrollToBottom('auto'); // Use auto for less jarring experience during streaming
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, isAtBottom, scrollToBottom]);

  // Set up scroll listener
  useEffect(() => {
    const viewport = getViewport();
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();

      return () => {
        viewport.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, getViewport]);

  // Also handle scroll when component mounts/updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const viewport = getViewport();
      if (viewport) {
        handleScroll();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [handleScroll, getViewport]);

  // Keyboard shortcuts for scrolling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'End':
          e.preventDefault();
          scrollToBottom('smooth');
          break;
        case 'Home':
          e.preventDefault();
          scrollToTop('smooth');
          break;
        case 'PageDown':
          e.preventDefault();
          const viewport = getViewport();
          if (viewport) {
            viewport.scrollBy({ top: viewport.clientHeight * 0.8, behavior: 'smooth' });
          }
          break;
        case 'PageUp':
          e.preventDefault();
          const viewportUp = getViewport();
          if (viewportUp) {
            viewportUp.scrollBy({ top: -viewportUp.clientHeight * 0.8, behavior: 'smooth' });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [scrollToBottom, scrollToTop, getViewport]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden">
        {/* Scroll progress indicator */}
        {scrollProgress > 0 && scrollProgress < 100 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-20">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}

        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-8 min-h-full flex flex-col">
            {chat && chat.messages.length > 0 ? (
              <div className="space-y-6">
                {chat.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <ChatMessage
                    message={{ id: 'loading', role: 'assistant', content: '' }}
                    isLoading
                  />
                )}
                {/* Padding at bottom to ensure last message is fully visible */}
                <div className="h-4" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 min-h-[50vh] gap-4 text-center">
                <Logo />
                <h1 className="text-2xl font-headline font-semibold">Cognito AI</h1>
                <p className="text-muted-foreground">Start a conversation or try a quick action.</p>
                <QuickActions onSelectAction={(action) => onSendMessage(action, chat?.mode || 'general')} mode={chat?.mode || 'general'} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Gradient fade effects */}
        {!isAtTop && (
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
        )}
        {!isAtBottom && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        )}

        {/* Scroll controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
          {/* Scroll to top button */}
          {showScrollToTop && (
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => scrollToTop('smooth')}
              title="Scroll to top (Home key)"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          )}

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={() => scrollToBottom('smooth')}
              title="Scroll to bottom (End key)"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          )}
        </div>

        {/* Message count indicator */}
        {chat && chat.messages.length > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-background/95 backdrop-blur-sm border rounded-full px-3 py-1 text-xs text-muted-foreground shadow-sm">
              {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
            </div>
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
