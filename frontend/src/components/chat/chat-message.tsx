"use client";

import { Bot, User, Copy, Download, Loader2 } from 'lucide-react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({ title: "Copied to clipboard" });
  };
  
  const handleExport = () => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognito-ai-response-${message.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported as .txt file" });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Thinking...</span>
        </div>
      );
    }
    
    // Basic markdown handling. A full library would be better for complex cases.
    if (message.type === 'markdown' || message.type === 'list') {
      return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    }
    
    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div className={cn("flex items-start gap-4", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "group relative max-w-2xl rounded-lg px-4 py-3",
        isAssistant ? "bg-secondary" : "bg-primary text-primary-foreground"
      )}>
        {renderContent()}
        {isAssistant && !isLoading && (
            <div className="absolute -bottom-4 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        )}
      </div>
       {!isAssistant && (
        <Avatar className="h-8 w-8">
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
