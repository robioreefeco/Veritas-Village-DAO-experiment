import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proposalsRouter from "./proposals";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(proposalsRouter);
router.use(statsRouter);

export default router;
