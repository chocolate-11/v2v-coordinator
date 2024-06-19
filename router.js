import { Router } from "express";
import {
  OnAbort,
  OnFinish,
  OnPreview,
  OnProgress,
  OnRequest,
} from "./scripts/coordinator_server/coordinator.js";

const router = Router();

router.post("/request", OnRequest);
router.put("/progress", OnProgress);
router.put("/preview", OnPreview);
router.put("/finish", OnFinish);
router.put("/abort", OnAbort);

export default router;
