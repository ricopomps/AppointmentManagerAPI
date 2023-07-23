import { RequestHandler } from "express";
import createHttpError from "http-errors";
import AppointmentModel from "../models/appointment";
import { endOfDay, startOfDay } from "date-fns";
import mongoose from "mongoose";

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

interface findAppointmentsQuery {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  clinicId?: string;
  dentistId?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
}
interface Filter {
  $match: filterQuery;
}

interface filterQuery {
  name?: regexSearch;
  email?: regexSearch;
  cpf?: regexSearch;
  phone?: regexSearch;
  clinicId?: mongoose.Types.ObjectId;
  dentistId?: mongoose.Types.ObjectId;
  day?: betweenDateSearch;
  skip?: number;
  take?: number;
}
interface regexSearch {
  $regex: string | undefined;
  $options: string;
}

interface betweenDateSearch {
  $gte?: Date;
  $lte?: Date;
}
export const findAppointments: RequestHandler<
  unknown,
  unknown,
  unknown,
  findAppointmentsQuery
> = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      name,
      email,
      cpf,
      phone,
      clinicId,
      dentistId,
      skip = 0,
      take = 10,
    } = req.query;

    const filter: Filter = {
      $match: {},
    };

    if (name) {
      filter.$match.name = { $regex: name, $options: "i" };
    }

    if (email) {
      filter.$match.email = { $regex: email, $options: "i" };
    }

    if (cpf) {
      filter.$match.cpf = { $regex: cpf, $options: "i" };
    }

    if (phone) {
      filter.$match.phone = { $regex: phone, $options: "i" };
    }

    if (clinicId) {
      const clinicObjectId = new mongoose.Types.ObjectId(clinicId);
      filter.$match.clinicId = clinicObjectId;
    }

    if (dentistId) {
      const dentistObjectId = new mongoose.Types.ObjectId(dentistId);
      filter.$match.dentistId = dentistObjectId;
    }

    if (startDate) {
      filter.$match.day = { $gte: startOfDay(new Date(startDate)) };
    }

    if (endDate) {
      filter.$match.day = {
        ...filter.$match.day,
        $lte: endOfDay(new Date(endDate)),
      };
    }

    const appointments = await AppointmentModel.aggregate([
      filter,
      {
        $lookup: {
          from: "users",
          localField: "dentistId",
          foreignField: "_id",
          as: "dentist",
        },
      },
      { $unwind: { path: "$dentist" } },
      { $unset: "dentist.password" },
      {
        $lookup: {
          from: "clinics",
          localField: "clinicId",
          foreignField: "_id",
          as: "clinic",
        },
      },
      { $unwind: { path: "$clinic" } },
      {
        $group: {
          _id: "$_id",
          dentist: { $first: "$dentist" },
          clinic: { $first: "$clinic" },
          name: { $first: "$name" },
          email: { $first: "$email" },
          cpf: { $first: "$cpf" },
          day: { $first: "$day" },
          interval: { $first: "$interval" },
          phone: { $first: "$phone" },
        },
      },
      { $skip: Number.parseInt(skip.toString()) },
      { $limit: Number.parseInt(take.toString()) },
    ]).exec();

    const totalAppointmentsCount = await AppointmentModel.aggregate([
      filter,
      { $group: { _id: null, total: { $sum: 1 } } },
      { $project: { _id: 0, total: 1 } },
    ]).exec();

    const totalCount = totalAppointmentsCount[0]?.total || 0;

    res.status(200).json({ appointments, count: totalCount });
  } catch (error) {
    next(error);
  }
};
