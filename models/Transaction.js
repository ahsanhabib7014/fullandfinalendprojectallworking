import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🆕 এজেন্ট ট্রানজেকশনের জন্য নতুন type যোগ করা হলো
    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAW",
        "AGENT_COMMISSION", // ডিপোজিট/উইথড্র থেকে এজেন্টের কমিশন
        "AGENT_LOAD", // অ্যাডমিন ডলার লোড অ্যাপ্রুভ করলে
        "AGENT_COMMISSION_TRANSFER", // কমিশন ব্যালেন্স → মূল ব্যালেন্সে ট্রান্সফার
      ],
      required: true,
    },

    method: { type: String, required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    trxId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    comment: { type: String, default: "" },

    // ==========================================
    // 🆕 এজেন্ট সিস্টেম ফিল্ড
    // ==========================================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    }, // কোন এজেন্টের সাথে সম্পর্কিত
    relatedDepositId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deposit",
      default: null,
    }, // কোন ডিপোজিট থেকে কমিশন এসেছে
    relatedWithdrawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdraw",
      default: null,
    }, // কোন উইথড্র থেকে কমিশন এসেছে
    relatedDollarRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentDollarRequest",
      default: null,
    }, // কোন ডলার রিকোয়েস্ট থেকে এসেছে
  },
  { timestamps: true },
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
