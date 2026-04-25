import {
  pgTable,
  serial,
  integer,
  text,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const feesTable = pgTable(
  "fees",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // YYYY-MM
    status: text("status").notNull(), // PAID | UNPAID
    paidOn: date("paid_on"),
  },
  (t) => ({
    studentMonthUnique: uniqueIndex("fees_student_month_unique").on(
      t.studentId,
      t.month,
    ),
  }),
);

export type FeeRow = typeof feesTable.$inferSelect;
export type InsertFee = typeof feesTable.$inferInsert;
