import { RequestHandler } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import UserModel, { UserType } from "../models/user";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId: authenticatedUser } = req.session;

    const user = await UserModel.findById(authenticatedUser)
      .select("+email")
      .exec();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserModel.find().exec();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

interface SignUpBody {
  username?: string;
  email?: string;
  password?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, email, password: passwordRaw } = req.body;

    if (!username || !email || !passwordRaw)
      throw createHttpError(400, "Parametros inválidos ");

    const existingUsername = await UserModel.findOne({ username }).exec();

    if (existingUsername)
      throw createHttpError(409, "Nome do usuário já existe");

    const existingEmail = await UserModel.findOne({ email }).exec();

    if (existingEmail) throw createHttpError(409, "Email já cadastrado");

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await UserModel.create({
      username,
      email,
      password: passwordHashed,
    });

    req.session.userId = newUser._id;

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  username?: string;
  password?: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw createHttpError(400, "Parâmetros faltando");

    const user = await UserModel.findOne({ username })
      .select("+password +email")
      .exec();

    if (!user) throw createHttpError(401, "Credenciais inválidas");

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw createHttpError(401, "Credenciais inválidas");

    req.session.userId = user._id;
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200);
    }
  });
};

interface UpdateUserBody {
  username?: string;
  email?: string;
  userType?: UserType;
}

interface UpdateUserParams {
  userId?: string;
}

export const updateUser: RequestHandler<
  UpdateUserParams,
  unknown,
  UpdateUserBody,
  unknown
> = async (req, res, next) => {
  try {
    const { username, email, userType } = req.body;
    const { userId } = req.params;

    const user = await UserModel.findById(userId).exec();

    if (!user) throw createHttpError(404, "Usuário não encontrado");

    if (userType && !Object.values(UserType).includes(userType))
      throw createHttpError(401, "Tipo de usuário inválido");

    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.userType = userType ?? user.userType;

    const updatedUser = await user.save();

    res.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getDentists: RequestHandler = async (req, res, next) => {
  try {
    const dentists = await UserModel.find({
      userType: UserType.dentist || UserType.admin,
    }).exec();

    res.status(200).json(dentists);
  } catch (error) {
    next(error);
  }
};
