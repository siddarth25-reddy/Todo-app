import { useGetTaskSummary, getGetTaskSummaryQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Clock, ListTodo, AlertTriangle, AlertCircle, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetTaskSummary({
    query: {
      queryKey: getGetTaskSummaryQueryKey()
    }
  });

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="p-6 border rounded-lg bg-destructive/10 text-destructive">
          Failed to load summary statistics.
        </div>
      </div>
    );
  }

  const completionRate = summary?.total ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your productivity overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{summary?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{summary?.completed || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{summary?.pending || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className={summary?.overdueCount ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className={`text-sm font-medium ${summary?.overdueCount ? "text-destructive" : "text-muted-foreground"}`}>Overdue</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${summary?.overdueCount ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className={`text-3xl font-bold ${summary?.overdueCount ? "text-destructive" : ""}`}>{summary?.overdueCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm font-medium">
                  <span>Progress</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
                <p className="text-sm text-muted-foreground mt-4">
                  {summary?.completed} of {summary?.total} tasks completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">High</span>
                  </div>
                  <span className="text-xl font-bold">{summary?.highPriority || 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Medium</span>
                  </div>
                  <span className="text-xl font-bold">{summary?.mediumPriority || 0}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">Low</span>
                  </div>
                  <span className="text-xl font-bold">{summary?.lowPriority || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
