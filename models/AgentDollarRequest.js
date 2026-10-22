import mongoose from "mongoose";

const AgentDollarRequestSchema = new mongoose.Schema(
  {
    // ==========================================
    // 👤 কে রিকোয়েস্ট করেছে
    // ==========================================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // 💵 রিকোয়েস্টের অ্যামাউন্ট (ডলারে ইনপুট)
    // ==========================================
    amountUSD: {
      type: Number,
      required: true,
      min: 0.01,
    }, // এজেন্ট কত ডলার লোড চাইছে

    dollarRate: {
      type: Number,
      required: true,
      min: 0,
    }, // রিকোয়েস্টের সময়ের ডলার রেট (স্ন্যাপশট)

    amountBDT: {
      type: Number,
      required: true,
      min: 0,
    }, // অ্যাপ্রুভ হলে কত টাকা যোগ হবে = amountUSD × dollarRate

    // ==========================================
    // 📝 পেমেন্ট প্রুফ (ঐচ্ছিক)
    // ==========================================
    paymentMethod: {
      type: String,
      default: "",
    }, // কোন মাধ্যমে পাঠিয়েছে (USDT, bKash ইত্যাদি)

    senderNumber: {
      type: String,
      default: "",
    }, // কোন নাম্বার/অ্যাড্রেস থেকে পাঠিয়েছে

    transactionId: {
      type: String,
      default: "",
    }, // ট্রানজেকশন আইডি

    screenshot: {
      type: String,
      default: "",
    }, // পেমেন্ট স্ক্রিনশট URL (ঐচ্ছিক)

    // ==========================================
    // 📊 স্ট্যাটাস
    // ==========================================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminNote: {
      type: String,
      default: "",
    }, // অ্যাডমিনের নোট

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // কোন অ্যাডমিন রিভিউ করেছে

    reviewedAt: {
      type: Date,
      default: null,
    }, // কখন রিভিউ হয়েছে
  },
  { timestamps: true },
);

export default mongoose.models.AgentDollarRequest ||
  mongoose.model("AgentDollarRequest", AgentDollarRequestSchema);
