import express from "express";
import * as AppointmentController from "../controller/appointmentController";

const router = express.Router();

router.post("/", AppointmentController.createAppointment);

export default router;
