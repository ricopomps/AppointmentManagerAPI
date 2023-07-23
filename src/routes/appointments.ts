import express from "express";
import * as AppointmentController from "../controller/appointmentController";

const router = express.Router();

router.get("/", AppointmentController.getAppointmentsBetweenDates);
router.post("/", AppointmentController.createAppointment);
router.get("/find", AppointmentController.findAppointments);

export default router;
