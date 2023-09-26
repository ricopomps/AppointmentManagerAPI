import mongoose, { InferSchemaType, Schema, model } from "mongoose";

export enum UserType {
  default = "Usuario",
  dentist = "Dentista",
  admin = "Administrador",
}

const userSchema = new Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true, select: false },
    displayName: { type: String },
    about: { type: String },
    profilePicUrl: { type: String },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    githubId: { type: String, unique: true, sparse: true, select: false },
    userType: {
      type: String,
      required: true,
      default: UserType.default,
      enum: Object.values(UserType),
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (!this.email && !this.googleId && !this.githubId) {
    return next(new Error("User must have an email or social provider id"));
  }
  next();
});

export type User = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default model<User>("User", userSchema);
