import {
  pgTable,
  serial,
  integer,
  text,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const attendanceTable = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // ON_BOARD | OFF_BOARD | ABSENT
    date: date("date").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    studentDateUnique: uniqueIndex("attendance_student_date_unique").on(
      t.studentId,
      t.date,
    ),
  }),
);

export type AttendanceRow = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;
