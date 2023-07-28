import { RequestHandler } from "express";
import ClinicModel from "../models/clinic";
import UserModel, { UserType } from "../models/user";
import createHttpError from "http-errors";
import mongoose from "mongoose";

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
  clinicId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
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

    if (!clinic) throw createHttpError(404, "Clínica não encontrada");

    if (userId && clinic.dentists.includes(userId))
      throw createHttpError(401, "Usuário já cadastrado nessa clínica");

    const user = await UserModel.findById(userId).exec();

    if (!user) throw createHttpError(404, "Usuário não encontrado");
    if (
      !(user.userType === UserType.dentist || user.userType === UserType.admin)
    )
      throw createHttpError(400, "Apenas dentistas podem ser adicionados");

    clinic.dentists = [...clinic.dentists, user._id];

    await clinic.save();

    const updatedClinicAggregated = await ClinicModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(clinicId),
        },
      },
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

    res.status(200).json(updatedClinicAggregated[0]);
  } catch (error) {
    next(error);
  }
};

interface UpdateClinicParams {
  clinicId?: string;
}

interface UpdateClinicBody {
  name?: string;
}

export const updateClinic: RequestHandler<
  UpdateClinicParams,
  unknown,
  UpdateClinicBody,
  unknown
> = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const { name: newName } = req.body;

    if (!mongoose.isValidObjectId(clinicId)) {
      throw createHttpError(400, "Id inválido");
    }

    if (!newName) {
      throw createHttpError(400, "O Titúlo é obrigatório");
    }

    const clinic = await ClinicModel.findById(clinicId).exec();

    if (!clinic) {
      throw createHttpError(404, "Clinic não encontrada");
    }

    clinic.name = newName;

    const updatedClinic = await clinic.save();

    const dentists = await UserModel.find({
      _id: { $in: clinic.dentists },
    }).exec();

    res.status(200).json({ ...updatedClinic.toObject(), dentists });
  } catch (error) {
    next(error);
  }
};
