import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, feesTable, studentsTable } from "@workspace/db";
import { ListFeesQueryParams, UpsertFeeBody } from "@workspace/api-zod";

const router: IRouter = Router();

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

router.get("/fees", async (req, res): Promise<void> => {
  const params = ListFeesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { month, studentId } = params.data;
  const conds = [];
  if (month) conds.push(eq(feesTable.month, month));
  if (studentId) conds.push(eq(feesTable.studentId, studentId));
  const rows = await db
    .select({
      id: feesTable.id,
      studentId: feesTable.studentId,
      studentName: studentsTable.name,
      month: feesTable.month,
      status: feesTable.status,
      paidOn: feesTable.paidOn,
      monthlyFee: studentsTable.monthlyFee,
    })
    .from(feesTable)
    .innerJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(feesTable.month, studentsTable.name);
  res.json(
    rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      month: r.month,
      status: r.status,
      paidOn: r.paidOn,
      amount: Number(r.monthlyFee),
    })),
  );
});

router.post("/fees", async (req, res): Promise<void> => {
  const parsed = UpsertFeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { studentId, month, status } = parsed.data;
  const paidOn =
    status === "PAID" ? new Date().toISOString().slice(0, 10) : null;
  const [row] = await db
    .insert(feesTable)
    .values({ studentId, month, status, paidOn })
    .onConflictDoUpdate({
      target: [feesTable.studentId, feesTable.month],
      set: { status, paidOn },
    })
    .returning();
  const [student] = await db
    .select({ name: studentsTable.name, monthlyFee: studentsTable.monthlyFee })
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId));
  res.json({
    id: row.id,
    studentId: row.studentId,
    studentName: student?.name ?? "",
    month: row.month,
    status: row.status,
    paidOn: row.paidOn,
    amount: Number(student?.monthlyFee ?? 0),
  });
});

router.get("/fees/pending", async (_req, res): Promise<void> => {
  const month = currentMonth();
  // All students who do NOT have a PAID fee record for the current month
  const allStudents = await db.select().from(studentsTable);
  const paidThisMonth = await db
    .select({ studentId: feesTable.studentId })
    .from(feesTable)
    .where(and(eq(feesTable.month, month), eq(feesTable.status, "PAID")));
  const paidIds = new Set(paidThisMonth.map((r) => r.studentId));
  const pending = allStudents
    .filter((s) => !paidIds.has(s.id))
    .map((s) => ({
      studentId: s.id,
      studentName: s.name,
      className: s.className,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      month,
      amount: Number(s.monthlyFee),
    }));
  res.json(pending);
});

export default router;
