import express from "express";
import * as ClinicsController from "../controller/clinicController";

const router = express.Router();

router.get("/", ClinicsController.getClinics);
router.post("/", ClinicsController.createClinics);
router.patch("/adduser", ClinicsController.addUserToClinic);

export default router;
