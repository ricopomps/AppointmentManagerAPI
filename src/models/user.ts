import { InferSchemaType, Schema, model } from "mongoose";

export enum UserType {
  default = "Usuario",
  dentist = "Dentista",
  admin = "Administrador",
}

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, select: false },
    password: { type: String, required: true, select: false },
    userType: {
      type: String,
      required: true,
      default: UserType.default,
      enum: Object.values(UserType),
    },
  },
  { timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
