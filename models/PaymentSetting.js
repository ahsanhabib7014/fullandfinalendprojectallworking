import mongoose from "mongoose";

const PaymentSettingSchema = new mongoose.Schema(
  {
    methodName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["Personal", "Agent/Cashout", "Crypto"],
      default: "Personal",
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
      // ✅ maxlength সরানো হলো — এখন dynamic validation হবে route-এ
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minDeposit: {
      type: Number,
      default: 500,
    },
    minWithdraw: {
      type: Number,
      default: 500,
    },
  },
  { timestamps: true },
);

export default mongoose.models.PaymentSetting ||
  mongoose.model("PaymentSetting", PaymentSettingSchema);
