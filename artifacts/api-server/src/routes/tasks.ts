import { Router } from "express";
import { eq, and, ilike, or } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  ToggleTaskCompleteParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tasks/summary", async (req, res) => {
  try {
    const tasks = await db.select().from(tasksTable);
    const now = new Date().toISOString().split("T")[0];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter((t) => t.priority === "high" && !t.completed).length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium" && !t.completed).length;
    const lowPriority = tasks.filter((t) => t.priority === "low" && !t.completed).length;
    const overdueCount = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now
    ).length;
    res.json({ total, completed, pending, highPriority, mediumPriority, lowPriority, overdueCount });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get summary" });
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const parsed = ListTasksQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query params" });
      return;
    }
    const { priority, completed, search } = parsed.data;

    const conditions = [];
    if (priority) conditions.push(eq(tasksTable.priority, priority as "high" | "medium" | "low"));
    if (completed !== undefined) {
      conditions.push(eq(tasksTable.completed, completed === "true"));
    }

    let tasks = await db
      .select()
      .from(tasksTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(tasksTable.createdAt);

    if (search) {
      const lower = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          (t.description && t.description.toLowerCase().includes(lower))
      );
    }

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json(tasks.map(serializeTask));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const parsed = CreateTaskBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error });
      return;
    }
    const { title, description, priority, dueDate } = parsed.data;
    const [task] = await db
      .insert(tasksTable)
      .values({ title, description, priority: priority as "high" | "medium" | "low", dueDate })
      .returning();
    res.status(201).json(serializeTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/tasks/:id", async (req, res) => {
  try {
    const parsed = GetTaskParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid task id" });
      return;
    }
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, parsed.data.id));
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(serializeTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get task" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateTaskParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid task id" });
      return;
    }
    const bodyParsed = UpdateTaskBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { title, description, priority, dueDate, completed } = bodyParsed.data;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (completed !== undefined) updates.completed = completed;

    const [task] = await db
      .update(tasksTable)
      .set(updates)
      .where(eq(tasksTable.id, paramsParsed.data.id))
      .returning();
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(serializeTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const parsed = DeleteTaskParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid task id" });
      return;
    }
    const [task] = await db
      .delete(tasksTable)
      .where(eq(tasksTable.id, parsed.data.id))
      .returning();
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

router.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const parsed = ToggleTaskCompleteParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid task id" });
      return;
    }
    const [existing] = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, parsed.data.id));
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const [task] = await db
      .update(tasksTable)
      .set({ completed: !existing.completed, updatedAt: new Date() })
      .where(eq(tasksTable.id, parsed.data.id))
      .returning();
    res.json(serializeTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

function serializeTask(task: typeof tasksTable.$inferSelect) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export default router;
