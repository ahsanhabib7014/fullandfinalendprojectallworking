import mongoose from "mongoose";

const DepositSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },

    // ✅ BDT amount (balance-এ এই amount যোগ হবে)
    amount: { type: Number, required: true },

    // ✅ USD conversion info
    originalAmount: { type: Number, default: 0 },
    originalCurrency: { type: String, default: "BDT" },
    exchangeRate: { type: Number, default: 1 },

    // ✅ Payment info
    method: { type: String, required: true },
    senderNumber: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },

    // ==========================================
    // 🆕 এজেন্ট সিস্টেম ফিল্ড
    // ==========================================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    }, // কোন এজেন্টের কাছে গেছে
    agentCommissionRate: { type: Number, default: 0 }, // তখনকার কমিশন % (স্ন্যাপশট)
    agentCommission: { type: Number, default: 0 }, // কমিশন অ্যামাউন্ট (ডলার)
    agentCommissionPaid: { type: Boolean, default: false }, // কমিশন কি এজেন্টের কমিশন ব্যালেন্সে যোগ হয়েছে?

    // ✅ Status — 'partial' যোগ করা হলো
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "partial"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Deposit ||
  mongoose.model("Deposit", DepositSchema);
