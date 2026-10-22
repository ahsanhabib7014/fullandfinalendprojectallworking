import mongoose from "mongoose";

const BetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roundNo: { type: String, required: true },
    choice: {
      type: String,
      enum: ["BIG", "SMALL", "Big", "Small"],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    outcome: { type: String, default: "PENDING" },
    status: {
      type: String,
      enum: ["PENDING", "WIN", "LOSS", "unsettled"],
      default: "PENDING",
    },
    returnAmount: { type: Number, default: 0, min: 0 },
    uid: { type: String },
    periodNumber: { type: String },
    result: { type: String, default: "pending" },
  },
  { timestamps: true },
);

// ✅ FIX: sparse: true যোগ করুন
BetSchema.index({ userId: 1, roundNo: 1 }, { unique: true, sparse: true });

export default mongoose.models.Bet || mongoose.model("Bet", BetSchema);
