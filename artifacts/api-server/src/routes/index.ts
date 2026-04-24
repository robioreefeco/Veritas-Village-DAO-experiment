import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proposalsRouter from "./proposals";
import statsRouter from "./stats";
import vocdoniRouter from "./vocdoni";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(proposalsRouter);
router.use(statsRouter);
router.use(vocdoniRouter);
router.use(storageRouter);

export default router;
