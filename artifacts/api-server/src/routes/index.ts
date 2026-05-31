import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incidentsRouter from "./incidents";
import phasesRouter from "./phases";
import accuracyRouter from "./accuracy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incidentsRouter);
router.use(phasesRouter);
router.use(accuracyRouter);

export default router;
