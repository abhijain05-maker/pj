import { Router, type IRouter } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db, attendanceTable, studentsTable } from "@workspace/db";
import {
  ListAttendanceQueryParams,
  UpsertAttendanceBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/attendance", async (req, res): Promise<void> => {
  const params = ListAttendanceQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { date, studentId } = params.data;
  const conds = [];
  if (date) conds.push(eq(attendanceTable.date, date));
  if (studentId) conds.push(eq(attendanceTable.studentId, studentId));
  const rows = await db
    .select({
      id: attendanceTable.id,
      studentId: attendanceTable.studentId,
      studentName: studentsTable.name,
      status: attendanceTable.status,
      date: attendanceTable.date,
      timestamp: attendanceTable.timestamp,
    })
    .from(attendanceTable)
    .innerJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(attendanceTable.date), desc(attendanceTable.timestamp));
  res.json(
    rows.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      status: r.status,
      date: r.date,
      timestamp: r.timestamp.toISOString(),
    })),
  );
});

router.post("/attendance", async (req, res): Promise<void> => {
  const parsed = UpsertAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { studentId, date, status } = parsed.data;
  const [row] = await db
    .insert(attendanceTable)
    .values({ studentId, date, status, timestamp: new Date() })
    .onConflictDoUpdate({
      target: [attendanceTable.studentId, attendanceTable.date],
      set: { status, timestamp: new Date() },
    })
    .returning();
  const [student] = await db
    .select({ name: studentsTable.name })
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId));
  res.json({
    id: row.id,
    studentId: row.studentId,
    studentName: student?.name ?? "",
    status: row.status,
    date: row.date,
    timestamp: row.timestamp.toISOString(),
  });
});

export default router;
