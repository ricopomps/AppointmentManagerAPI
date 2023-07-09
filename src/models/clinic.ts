import { InferSchemaType, Schema, model } from "mongoose";

const clinicSchema = new Schema(
  {
    name: { type: String, required: true },
    dentists: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

type Clinic = InferSchemaType<typeof clinicSchema>;

export default model<Clinic>("Clinic", clinicSchema);
