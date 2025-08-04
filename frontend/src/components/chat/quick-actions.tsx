"use client";

import { quickActions as allQuickActions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onSelectAction: (action: string) => void;
  mode: 'general' | 'spiritual';
}

export function QuickActions({ onSelectAction, mode }: QuickActionsProps) {
    const actions = allQuickActions[mode];
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xl">
      {actions.map((action, index) => (
        <Button 
            key={index} 
            variant="outline"
            size="sm"
            onClick={() => onSelectAction(action)}
            className="transition-all hover:bg-accent hover:text-accent-foreground"
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
