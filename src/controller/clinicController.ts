import { RequestHandler } from "express";
import ClinicModel from "../models/clinic";
import UserModel, { UserType } from "../models/user";
import createHttpError from "http-errors";

export const getClinics: RequestHandler = async (req, res, next) => {
  try {
    const clinics = await ClinicModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "dentists",
          foreignField: "_id",
          as: "dentists",
        },
      },
      { $unwind: { path: "$dentists" } },
      { $unset: "dentists.password" },
      {
        $group: {
          _id: "$_id",
          dentists: { $push: "$dentists" },
          name: { $first: "$name" },
        },
      },
    ]).exec();

    res.status(200).json(clinics);
  } catch (error) {
    next(error);
  }
};

interface createClinicBody {
  name?: string;
}

export const createClinics: RequestHandler<
  unknown,
  unknown,
  createClinicBody,
  unknown
> = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw createHttpError(400, "O Titúlo é obrigatório");
    }

    const newClinic = await ClinicModel.create({
      name,
    });

    res.status(201).json(newClinic);
  } catch (error) {
    next(error);
  }
};

interface addUserToClinicBody {
  clinicId?: string;
  userId?: string;
}

export const addUserToClinic: RequestHandler<
  unknown,
  unknown,
  addUserToClinicBody,
  unknown
> = async (req, res, next) => {
  try {
    const { clinicId, userId } = req.body;

    const clinic = await ClinicModel.findById(clinicId).exec();

    if (!clinic) throw createHttpError(404, "Clinica não encontrada");

    const user = await UserModel.findById(userId).exec();

    if (!user) throw createHttpError(404, "Usuário não encontrado");
    if (user.userType !== UserType.dentist)
      throw createHttpError(400, "Apenas dentistas podem ser adicionados");

    clinic.dentists = [...clinic.dentists, user._id];

    const updateClinic = await clinic.save();

    res.status(200).json(updateClinic);
  } catch (error) {
    next(error);
  }
};
