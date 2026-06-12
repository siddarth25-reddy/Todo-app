import { useLocation } from "wouter";
import { useCreateTask, getListTasksQueryKey, getGetTaskSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TaskForm, TaskFormValues } from "@/components/tasks/TaskForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewTask() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createTask = useCreateTask();

  const handleSubmit = (values: TaskFormValues) => {
    createTask.mutate(
      {
        data: {
          title: values.title,
          description: values.description,
          priority: values.priority,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() });
          toast({
            title: "Task created",
            description: "Your task has been successfully added.",
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create task. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="inline-flex items-center justify-center rounded-md w-10 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          <ArrowLeft size={16} />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground mt-1">Create a new priority item.</p>
        </div>
      </div>

      <div className="p-6 border rounded-xl bg-card">
        <TaskForm 
          onSubmit={handleSubmit} 
          isLoading={createTask.isPending} 
          submitLabel="Create Task" 
        />
      </div>
    </div>
  );
}
