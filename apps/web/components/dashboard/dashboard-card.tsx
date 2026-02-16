'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    delay?: number;
    className?: string;
}

export function DashboardCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    delay = 0,
    className,
}: DashboardCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -5 }}
            className={cn('h-full', className)}
        >
            <Card className="h-full overflow-hidden border-muted/40 bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {(description || trend) && (
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            {trend && (
                                <span
                                    className={cn(
                                        'mr-2 font-medium',
                                        trend.positive ? 'text-green-500' : 'text-red-500'
                                    )}
                                >
                                    {trend.positive ? '+' : ''}
                                    {trend.value}%
                                </span>
                            )}
                            {description}
                        </div>
                    )}
                    {/* Decorative background glow */}
                    <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                </CardContent>
            </Card>
        </motion.div>
    );
}
