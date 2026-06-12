import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Check, Clock, GripVertical, MoreVertical, Trash, CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Task, useToggleTaskComplete, getListTasksQueryKey, getGetTaskSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDueDate, isOverdue } from "@/lib/date-utils";
import { PriorityBadge } from "./PriorityBadge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const queryClient = useQueryClient();
  const toggleComplete = useToggleTaskComplete();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToggling(true);
    
    toggleComplete.mutate(
      { id: task.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() });
        },
        onSettled: () => setIsToggling(false)
      }
    );
  };

  const overdue = !task.completed && isOverdue(task.dueDate);

  return (
    <Link 
      href={`/task/${task.id}`}
      className={cn(
        "group flex items-start gap-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
        task.completed && "opacity-60"
      )}
    >
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={cn(
          "mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-sm border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
          task.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-input hover:border-primary hover:bg-primary/10 text-transparent hover:text-primary/50"
        )}
      >
        <Check size={14} className={cn(!task.completed && "opacity-0 hover:opacity-100")} />
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn(
            "font-medium leading-tight",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={task.priority} size="sm" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/task/${task.id}`} onClick={e => e.stopPropagation()}>
                    Edit Task
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className={cn(
            "text-sm text-muted-foreground line-clamp-2",
            task.completed && "line-through"
          )}>
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium mt-1",
            overdue ? "text-destructive" : "text-muted-foreground"
          )}>
            <CalendarIcon size={12} />
            <span>{formatDueDate(task.dueDate)}</span>
            {overdue && <span className="uppercase text-[10px] tracking-wider font-bold ml-1">Overdue</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
