import express from "express";
import * as ClinicsController from "../controller/clinicController";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", ClinicsController.getClinics);
router.post("/", requiresAuth, ClinicsController.createClinics);
router.patch("/adduser", requiresAuth, ClinicsController.addUserToClinic);
router.patch("/:clinicId", requiresAuth, ClinicsController.updateClinic);

export default router;
