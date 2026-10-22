import mongoose from "mongoose";

const BonusRunLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
      index: true,
    },
    periodKey: {
      type: String,
      required: true,
      index: true,
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    given: {
      type: Array,
      default: [],
    },
    skipped: {
      type: Array,
      default: [],
    },
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    runAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true, strict: false },
);

// 🔥 Force fresh model
if (mongoose.models.BonusRunLog) {
  delete mongoose.models.BonusRunLog;
}

const BonusRunLog = mongoose.model("BonusRunLog", BonusRunLogSchema);
export default BonusRunLog;
