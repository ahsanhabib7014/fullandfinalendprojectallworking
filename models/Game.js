import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    periodNumber: { type: String, required: true, unique: true },
    result: { type: String, enum: ["Big", "Small"], required: true },
    totalBig: { type: Number, default: 0 },
    totalSmall: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const GameResult =
  mongoose.models.GameResult || mongoose.model("GameResult", resultSchema);
