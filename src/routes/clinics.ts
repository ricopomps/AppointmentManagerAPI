import express from "express";
import * as ClinicsController from "../controller/clinicController";
import { verifyJWT } from "../middleware/verifyJWT";
const router = express.Router();

router.get("/", ClinicsController.getClinics);
router.post("/", verifyJWT, ClinicsController.createClinics);
router.patch("/adduser", verifyJWT, ClinicsController.addUserToClinic);
router.patch("/removeuser", verifyJWT, ClinicsController.removeUserFromClinic);
router.patch("/:clinicId", verifyJWT, ClinicsController.updateClinic);

export default router;
