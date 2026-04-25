import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import attendanceRouter from "./attendance";
import feesRouter from "./fees";
import dashboardRouter from "./dashboard";
import publicRouter from "./publicRouter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(attendanceRouter);
router.use(feesRouter);
router.use(dashboardRouter);
router.use(publicRouter);

export default router;
