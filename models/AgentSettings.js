import mongoose from "mongoose";

const AgentSettingsSchema = new mongoose.Schema(
  {
    // ==========================================
    // 🔑 সিঙ্গেল ডকুমেন্ট কী (শুধু একটা ডকুমেন্ট থাকবে)
    // ==========================================
    key: {
      type: String,
      default: "global",
      unique: true,
    },

    // ==========================================
    // 💰 গ্লোবাল কমিশন সেটিংস (%)
    // ==========================================
    defaultDepositCommission: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }, // ডিফল্ট ডিপোজিট কমিশন %

    defaultWithdrawCommission: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }, // ডিফল্ট উইথড্র কমিশন %

    // ==========================================
    // 💵 ডলার রেট
    // ==========================================
    dollarRate: {
      type: Number,
      default: 0,
      min: 0,
    }, // ১ ডলার = কত টাকা (BDT)

    // ==========================================
    // 📝 মেটা
    // ==========================================
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // সর্বশেষ কে আপডেট করেছে
  },
  { timestamps: true },
);

// ==========================================
// 🛠️ স্ট্যাটিক মেথড — সবসময় এক ডকুমেন্ট
// ==========================================
AgentSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: "global" });
  if (!settings) {
    settings = await this.create({ key: "global" });
  }
  return settings;
};

export default mongoose.models.AgentSettings ||
  mongoose.model("AgentSettings", AgentSettingsSchema);
