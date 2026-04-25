import { Router, type IRouter } from "express";
import { eq, desc, or, ilike } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  CreateStudentBody,
  UpdateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  DeleteStudentParams,
  ListStudentsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(s: typeof studentsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    className: s.className,
    busStop: s.busStop,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    monthlyFee: Number(s.monthlyFee),
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/students", async (req, res): Promise<void> => {
  const params = ListStudentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { search } = params.data;
  const rows = search
    ? await db
        .select()
        .from(studentsTable)
        .where(
          or(
            ilike(studentsTable.name, `%${search}%`),
            ilike(studentsTable.parentName, `%${search}%`),
            ilike(studentsTable.parentPhone, `%${search}%`),
            ilike(studentsTable.busStop, `%${search}%`),
          ),
        )
        .orderBy(studentsTable.name)
    : await db.select().from(studentsTable).orderBy(studentsTable.name);
  res.json(rows.map(serialize));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { monthlyFee, ...rest } = parsed.data;
  const [row] = await db
    .insert(studentsTable)
    .values({ ...rest, monthlyFee: String(monthlyFee) })
    .returning();
  res.status(201).json(serialize(row));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(serialize(row));
});

router.put("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { monthlyFee, ...rest } = parsed.data;
  const [row] = await db
    .update(studentsTable)
    .set({ ...rest, monthlyFee: String(monthlyFee) })
    .where(eq(studentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/students/:id", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
export { serialize as serializeStudent };
