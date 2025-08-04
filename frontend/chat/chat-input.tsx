"use client";

import * as React from 'react';
import { useState } from 'react';
import { Send, Sparkles, BrainCircuit, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChatInputProps {
  onSendMessage: (content: string, mode: 'general' | 'spiritual') => void;
  isLoading: boolean;
  currentMode: 'general' | 'spiritual';
}

export function ChatInput({ onSendMessage, isLoading, currentMode }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'general' | 'spiritual'>(currentMode);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, mode);
    setInput('');
  };

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Handle file upload
      console.log("Selected file:", file.name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-start gap-4">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
          }
        }}
        placeholder="Ask me anything..."
        className="flex-1 resize-none pr-40"
        rows={1}
        disabled={isLoading}
      />
      <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf"
        />
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMediaClick}
            disabled={isLoading}
            aria-label="Attach media"
            className='h-8 w-8'
          >
            <Paperclip className="h-4 w-4" />
        </Button>
        <Select value={mode} onValueChange={(value: 'general' | 'spiritual') => setMode(value)}>
          <SelectTrigger className="w-auto h-8 px-2.5 text-xs gap-1.5">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" /> General
              </div>
            </SelectItem>
            <SelectItem value="spiritual">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Spiritual
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
