import { Router, type IRouter } from "express";
import { and, eq, desc, or, ilike } from "drizzle-orm";
import { db, attendanceTable, feesTable, studentsTable } from "@workspace/db";
import { PublicSearchStudentQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

router.get("/public/student", async (req, res): Promise<void> => {
  const parsed = PublicSearchStudentQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data.query.trim();
  if (!q) {
    res.json([]);
    return;
  }
  const students = await db
    .select()
    .from(studentsTable)
    .where(
      or(
        ilike(studentsTable.name, `%${q}%`),
        ilike(studentsTable.parentPhone, `%${q}%`),
      ),
    )
    .orderBy(studentsTable.name);

  const today = todayStr();
  const out = await Promise.all(
    students.map(async (s) => {
      const [todayRec] = await db
        .select()
        .from(attendanceTable)
        .where(
          and(
            eq(attendanceTable.studentId, s.id),
            eq(attendanceTable.date, today),
          ),
        );
      const history = await db
        .select()
        .from(attendanceTable)
        .where(eq(attendanceTable.studentId, s.id))
        .orderBy(desc(attendanceTable.date))
        .limit(30);
      const fees = await db
        .select()
        .from(feesTable)
        .where(eq(feesTable.studentId, s.id))
        .orderBy(desc(feesTable.month))
        .limit(12);
      return {
        id: s.id,
        name: s.name,
        className: s.className,
        busStop: s.busStop,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        monthlyFee: Number(s.monthlyFee),
        todayStatus: todayRec ? todayRec.status : null,
        attendanceHistory: history.map((h) => ({
          date: h.date,
          status: h.status,
        })),
        feeHistory: fees.map((f) => ({
          month: f.month,
          status: f.status,
          paidOn: f.paidOn,
          amount: Number(s.monthlyFee),
        })),
      };
    }),
  );
  res.json(out);
});

export default router;
