import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proposalsRouter from "./proposals";
import statsRouter from "./stats";
import vocdoniRouter from "./vocdoni";

const router: IRouter = Router();

router.use(healthRouter);
router.use(proposalsRouter);
router.use(statsRouter);
router.use(vocdoniRouter);

export default router;
