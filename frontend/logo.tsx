import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 font-semibold text-lg tracking-wider font-headline", className)}>
      <div className="p-1.5 bg-primary rounded-lg">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      Cognito AI
    </div>
  );
}
