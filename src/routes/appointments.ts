import express from "express";
import * as AppointmentController from "../controller/appointmentController";
import { verifyJWT } from "../middleware/verifyJWT";
const router = express.Router();

router.get("/", AppointmentController.getAppointmentsBetweenDates);
router.post("/", AppointmentController.createAppointment);
router.get("/find", verifyJWT, AppointmentController.findAppointments);

export default router;
