"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HealthStatusProps {
    isCollapsed?: boolean;
}

export function HealthStatus({ isCollapsed = false }: HealthStatusProps) {
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkHealth = async () => {
        setIsChecking(true);
        try {
            console.log("SUP")
            const response = await fetch('http://127.0.0.1:5000/health', {
                method: 'GET',
                signal: AbortSignal.timeout(3000), // 3 second timeout
            });

            if (response.ok) {
                const data = await response.json();
                setIsHealthy(data.ai_assistant_ready || false);
            } else {
                setIsHealthy(false);
            }
        } catch (error) {
            setIsHealthy(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // Check health immediately
        checkHealth();

        // Set up interval to check every 10 seconds
        const interval = setInterval(checkHealth, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusText = () => {
        if (isChecking) return 'Checking...';
        if (isHealthy === null) return 'Unknown';
        return isHealthy ? 'AI Ready' : 'AI Offline';
    };

    const getStatusColor = () => {
        if (isChecking) return 'text-yellow-500';
        if (isHealthy === null) return 'text-gray-500';
        return isHealthy ? 'text-green-500' : 'text-red-500';
    };

    const getDotColor = () => {
        if (isChecking) return 'bg-yellow-500';
        if (isHealthy === null) return 'bg-gray-500';
        return isHealthy ? 'bg-green-500' : 'bg-red-500';
    };

    return (
        <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-col" : "justify-between"
        )}>
            {!isCollapsed && (
                <span className={cn("text-sm font-medium", getStatusColor())}>
                    {getStatusText()}
                </span>
            )}

            <div className="relative flex items-center">
                {/* Status dot with blinking animation */}
                <div
                    className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        getDotColor(),
                        isChecking && "animate-pulse",
                        isHealthy && "animate-pulse"
                    )}
                />

                {/* Ripple effect for active status */}
                {isHealthy && (
                    <div className={cn(
                        "absolute w-3 h-3 rounded-full animate-ping opacity-30",
                        getDotColor()
                    )} />
                )}
            </div>

            {isCollapsed && (
                <span className={cn("text-xs", getStatusColor())}>
                    {isHealthy ? '●' : '○'}
                </span>
            )}
        </div>
    );
}
