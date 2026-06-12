import { cn } from "@/lib/utils";
import { TaskPriority } from "@workspace/api-client-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, className, size = "md" }: PriorityBadgeProps) {
  const isHigh = priority === TaskPriority.high;
  const isMedium = priority === TaskPriority.medium;
  const isLow = priority === TaskPriority.low;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        isHigh && "bg-destructive/10 text-destructive border-destructive/20",
        isMedium && "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
        isLow && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
        className
      )}
    >
      {isHigh && "High"}
      {isMedium && "Medium"}
      {isLow && "Low"}
    </span>
  );
}
