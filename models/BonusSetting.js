import mongoose from 'mongoose';

const BonusSettingSchema = new mongoose.Schema({
  // ==========================================
  // 📅 সাপ্তাহিক বোনাস সেটিংস
  // ==========================================
  weeklyBonusEnabled: { type: Boolean, default: true },

  // ডিপোজিট বোনাস
  depositBonusEnabled: { type: Boolean, default: true },
  depositBonusPercent: { type: Number, default: 5 },        // ৫%
  depositBonusMax: { type: Number, default: 1000 },         // সর্বোচ্চ ৳১,০০০
  depositBonusMinDeposit: { type: Number, default: 1000 },  // ন্যূনতম ৳১,০০০

  // ক্যাশব্যাক
  cashbackEnabled: { type: Boolean, default: true },
  cashbackPercent: { type: Number, default: 5 },            // ৫%
  cashbackMax: { type: Number, default: 500 },              // সর্বোচ্চ ৳৫০০
  cashbackMinTurnover: { type: Number, default: 1000 },     // ন্যূনতম টার্নওভার ৳১,০০০

  // ==========================================
  // 📅 মাসিক টপ র‍্যাংকার সেটিংস
  // ==========================================
  topRankerEnabled: { type: Boolean, default: true },
  topRankerCount: { type: Number, default: 10 },            // Top 10

 rank1Prize:  { type: Number, default: 5000 },   // 🥇
rank2Prize:  { type: Number, default: 3000 },   // 🥈
rank3Prize:  { type: Number, default: 2000 },   // 🥉
rank4Prize:  { type: Number, default: 1000 },   // ৪র্থ
rank5Prize:  { type: Number, default: 800 },    // ৫ম
rank6Prize:  { type: Number, default: 600 },    // ৬ষ্ঠ
rank7Prize:  { type: Number, default: 500 },    // ৭ম
rank8Prize:  { type: Number, default: 400 },    // ৮ম
rank9Prize:  { type: Number, default: 300 },    // ৯ম
rank10Prize: { type: Number, default: 200 },    // ১০ম
rank11PlusPrize: { type: Number, default: 100 },   // ১১ থেকে সর্বোচ্চ

  // ==========================================
  // 📊 ট্র্যাকিং
  // ==========================================
  lastWeeklyBonusAt: { type: Date, default: null },
  lastMonthlyBonusAt: { type: Date, default: null },
  weeklyBonusGivenCount: { type: Number, default: 0 },      // মোট কতবার সাপ্তাহিক বোনাস দেওয়া হয়েছে
  monthlyBonusGivenCount: { type: Number, default: 0 },     // মোট কতবার মাসিক বোনাস দেওয়া হয়েছে

}, { timestamps: true });

// Next.js ক্যাশ সমস্যা এড়াতে মডেল মুছে নতুন করে কম্পাইল
if (mongoose.models.BonusSetting) {
  delete mongoose.models.BonusSetting;
}

export default mongoose.model('BonusSetting', BonusSettingSchema);