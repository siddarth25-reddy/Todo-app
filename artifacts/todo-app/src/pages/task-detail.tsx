import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useGetTask, 
  useUpdateTask, 
  useDeleteTask, 
  getGetTaskQueryKey, 
  getListTasksQueryKey, 
  getGetTaskSummaryQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TaskForm, TaskFormValues } from "@/components/tasks/TaskForm";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TaskDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: task, isLoading, isError } = useGetTask(id, {
    query: {
      enabled: !!id,
      queryKey: getGetTaskQueryKey(id)
    }
  });

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (values: TaskFormValues) => {
    updateTask.mutate(
      {
        id,
        data: {
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() });
          toast({
            title: "Task updated",
            description: "Your changes have been saved.",
          });
          setLocation("/");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update task. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteTask.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() });
          toast({
            title: "Task deleted",
            description: "The task has been permanently removed.",
          });
          setLocation("/");
        },
        onError: () => {
          setIsDeleting(false);
          toast({
            title: "Error",
            description: "Failed to delete task.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <div className="p-6 border rounded-lg bg-destructive/10 text-destructive">
          <h2 className="text-lg font-bold mb-2">Task not found</h2>
          <p>This task may have been deleted or doesn't exist.</p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation("/")}>
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center justify-center rounded-md w-10 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft size={16} />
            <span className="sr-only">Back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
            <p className="text-muted-foreground mt-1">Update details for this item.</p>
          </div>
        </div>

        {task && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" title="Delete Task">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task
                  "{task.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Task"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="p-6 border rounded-xl bg-card">
        {isLoading || !task ? (
          <div className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-5 w-16"/><Skeleton className="h-10 w-full"/></div>
            <div className="space-y-2"><Skeleton className="h-5 w-24"/><Skeleton className="h-24 w-full"/></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Skeleton className="h-5 w-16"/><Skeleton className="h-10 w-full"/></div>
              <div className="space-y-2"><Skeleton className="h-5 w-20"/><Skeleton className="h-10 w-full"/></div>
            </div>
          </div>
        ) : (
          <TaskForm 
            defaultValues={{
              title: task.title,
              description: task.description || "",
              priority: task.priority,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            }}
            onSubmit={handleSubmit} 
            isLoading={updateTask.isPending} 
            submitLabel="Save Changes" 
          />
        )}
      </div>
    </div>
  );
}
