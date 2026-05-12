import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  iconClassName?: string;
  /** "Up is good" — positive trend rendered green. Reverse for things like MTTR. */
  positiveTrendIsGood?: boolean;
}

export function MetricCard({
  label,
  value,
  trend = 0,
  icon: Icon,
  iconClassName,
  positiveTrendIsGood = true,
}: MetricCardProps) {
  const isPositive = trend > 0;
  const isGood = positiveTrendIsGood ? isPositive : !isPositive;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-5 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
              iconClassName ?? 'bg-primary/10 text-primary',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend !== 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold',
                isGood ? 'bg-success/10 text-success' : 'bg-critical/10 text-critical',
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last 7 days</span>
          </div>
        )}
      </motion.div>
    </Card>
  );
}
