import { Router, type IRouter } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, attendanceTable, feesTable, studentsTable } from "@workspace/db";
import { GetAttendanceTrendQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = todayStr();
  const month = currentMonth();

  const [{ count: totalStudents }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studentsTable);

  const todayAttendance = await db
    .select({
      status: attendanceTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(attendanceTable)
    .where(eq(attendanceTable.date, today))
    .groupBy(attendanceTable.status);

  let onBoardToday = 0;
  let offBoardToday = 0;
  let absentToday = 0;
  for (const r of todayAttendance) {
    if (r.status === "ON_BOARD") onBoardToday = Number(r.count);
    else if (r.status === "OFF_BOARD") offBoardToday = Number(r.count);
    else if (r.status === "ABSENT") absentToday = Number(r.count);
  }
  const unmarkedToday = Math.max(
    0,
    Number(totalStudents) - (onBoardToday + offBoardToday + absentToday),
  );

  const monthFees = await db
    .select({
      status: feesTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(feesTable)
    .where(eq(feesTable.month, month))
    .groupBy(feesTable.status);

  let paidThisMonth = 0;
  for (const r of monthFees) {
    if (r.status === "PAID") paidThisMonth = Number(r.count);
  }
  const unpaidThisMonth = Math.max(0, Number(totalStudents) - paidThisMonth);

  const paidStudentIds = await db
    .select({ studentId: feesTable.studentId })
    .from(feesTable)
    .where(and(eq(feesTable.month, month), eq(feesTable.status, "PAID")));
  const paidIds = new Set(paidStudentIds.map((r) => r.studentId));

  const allStudents = await db.select().from(studentsTable);
  let revenueCollected = 0;
  let revenuePending = 0;
  for (const s of allStudents) {
    const fee = Number(s.monthlyFee);
    if (paidIds.has(s.id)) revenueCollected += fee;
    else revenuePending += fee;
  }

  res.json({
    totalStudents: Number(totalStudents),
    onBoardToday,
    offBoardToday,
    absentToday,
    unmarkedToday,
    paidThisMonth,
    unpaidThisMonth,
    revenueCollectedThisMonth: revenueCollected,
    revenuePendingThisMonth: revenuePending,
  });
});

router.get("/dashboard/attendance-trend", async (req, res): Promise<void> => {
  const parsed = GetAttendanceTrendQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const days = parsed.data.days ?? 14;
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceStr = since.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: attendanceTable.date,
      status: attendanceTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(attendanceTable)
    .where(gte(attendanceTable.date, sinceStr))
    .groupBy(attendanceTable.date, attendanceTable.status);

  const map = new Map<string, { onBoard: number; offBoard: number; absent: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    map.set(ds, { onBoard: 0, offBoard: 0, absent: 0 });
  }
  for (const r of rows) {
    const entry = map.get(r.date) ?? { onBoard: 0, offBoard: 0, absent: 0 };
    if (r.status === "ON_BOARD") entry.onBoard = Number(r.count);
    else if (r.status === "OFF_BOARD") entry.offBoard = Number(r.count);
    else if (r.status === "ABSENT") entry.absent = Number(r.count);
    map.set(r.date, entry);
  }
  const out = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
  res.json(out);
});

export default router;
