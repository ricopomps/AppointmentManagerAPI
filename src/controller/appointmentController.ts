import { RequestHandler } from "express";
import createHttpError from "http-errors";
import AppointmentModel from "../models/appointment";

interface getAppointmentsBetweenDatesQuery {
  startDate?: string;
  endDate?: string;
}

export const getAppointmentsBetweenDates: RequestHandler<
  unknown,
  unknown,
  unknown,
  getAppointmentsBetweenDatesQuery
> = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate)
      throw createHttpError(400, "Campos de data necessários");

    const appointments = await AppointmentModel.find({
      day: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

interface createAppointmentBody {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  interval?: string;
  day?: Date;
  clinicId?: string;
  dentistId?: string;
}

export const createAppointment: RequestHandler<
  unknown,
  unknown,
  createAppointmentBody,
  unknown
> = async (req, res, next) => {
  try {
    const { name, email, phone, cpf, interval, day, clinicId, dentistId } =
      req.body;
    const newAppointment = await AppointmentModel.create({
      name,
      email,
      phone,
      cpf,
      interval,
      day,
      clinicId,
      dentistId,
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};
