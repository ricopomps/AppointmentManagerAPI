import { RequestHandler } from "express";
import createHttpError from "http-errors";
import AppointmentModel from "../models/appointment";

interface createAppointmentBody {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  interval?: string;
  day?: string;
}

export const createAppointment: RequestHandler<
  unknown,
  unknown,
  createAppointmentBody,
  unknown
> = async (req, res, next) => {
  try {
    const { name, email, phone, cpf, interval, day } = req.body;

    const newAppointment = await AppointmentModel.create({
      name,
      email,
      phone,
      cpf,
      interval,
      day,
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};
