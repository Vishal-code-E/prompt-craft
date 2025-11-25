import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className }: ContainerProps) {
    return (
        <div className={cn('bg-white border rounded-xl p-6 shadow-sm', className)}>
            {children}
        </div>
    );
}
