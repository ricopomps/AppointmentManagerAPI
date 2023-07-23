import express from "express";
import * as AppointmentController from "../controller/appointmentController";
import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.get("/", AppointmentController.getAppointmentsBetweenDates);
router.post("/", AppointmentController.createAppointment);
router.get("/find", requiresAuth, AppointmentController.findAppointments);

export default router;
