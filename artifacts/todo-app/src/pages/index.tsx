import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListTasks, getListTasksQueryKey, TaskPriority, ListTasksCompleted, ListTasksPriority } from "@workspace/api-client-react";
import { Search, Loader2, ListTodo, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");
  const [completedFilter, setCompletedFilter] = useState<"all" | "true" | "false">("false");
  const [priorityFilter, setPriorityFilter] = useState<ListTasksPriority | "all">("all");

  const queryParams = useMemo(() => {
    const params: any = {};
    if (search.trim()) params.search = search;
    if (completedFilter !== "all") params.completed = completedFilter as ListTasksCompleted;
    if (priorityFilter !== "all") params.priority = priorityFilter;
    return params;
  }, [search, completedFilter, priorityFilter]);

  const { data: tasks, isLoading, isError } = useListTasks(queryParams, {
    query: {
      queryKey: getListTasksQueryKey(queryParams),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your priorities and get things done.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Tabs value={completedFilter} onValueChange={(v) => setCompletedFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="false">Pending</TabsTrigger>
              <TabsTrigger value="true">Done</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
            <SelectTrigger>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value={TaskPriority.high}>High Priority</SelectItem>
              <SelectItem value={TaskPriority.medium}>Medium Priority</SelectItem>
              <SelectItem value={TaskPriority.low}>Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
            <p className="text-destructive font-medium">Failed to load tasks</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 border rounded-lg border-dashed bg-muted/20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              {completedFilter === "true" ? <CheckCircle2 size={32} /> : <ListTodo size={32} />}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {completedFilter === "true" 
                ? "No completed tasks yet" 
                : search 
                  ? "No matching tasks found" 
                  : "You're all caught up!"}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {completedFilter === "true" 
                ? "When you finish tasks, they'll appear here."
                : search 
                  ? "Try adjusting your search terms or filters."
                  : "Enjoy the peace of mind, or add a new task to get started."}
            </p>
            {completedFilter !== "true" && (
              <Link href="/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Create New Task
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
