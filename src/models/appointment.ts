import { InferSchemaType, Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    cpf: { type: String, required: true },
    interval: { type: String, required: true },
    day: { type: Date, required: true },
    clinicId: { type: Schema.Types.ObjectId, required: true, ref: "Clinic" },
    dentistId: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  },
  {
    timestamps: true,
  }
);

type Appointment = InferSchemaType<typeof appointmentSchema>;

export default model<Appointment>("Appointment", appointmentSchema);
