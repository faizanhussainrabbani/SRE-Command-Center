import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incidentsRouter from "./incidents";
import phasesRouter from "./phases";
import accuracyRouter from "./accuracy";
import remediationActionsRouter from "./remediation-actions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incidentsRouter);
router.use(phasesRouter);
router.use(accuracyRouter);
router.use(remediationActionsRouter);

export default router;
