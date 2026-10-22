import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import BonusSetting from "@/models/BonusSetting";
import BonusRunLog from "@/models/BonusRunLog";
import { verifyAuth } from "@/utils/authCheck";

// 🆕 গ্লোবাল লক (একই সাথে দুইবার মাসিক বোনাস বাটন ক্লিক আটকাতে)
let isMonthlyBonusRunning = false;

// ==========================================
// মাসের key বের করার helper
// ==========================================
function getMonthKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// ==========================================
// ✅ POST — অ্যাডমিন প্যানেল থেকে ম্যানুয়াল ট্রিগার
// ==========================================
export async function POST(req) {
  const startedAt = Date.now();

  if (isMonthlyBonusRunning) {
    return NextResponse.json(
      {
        success: false,
        message: "মাসিক বোনাস বর্তমানে প্রসেস হচ্ছে, দয়া করে অপেক্ষা করুন!",
      },
      { status: 429 },
    );
  }

  try {
    await dbConnect();
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    isMonthlyBonusRunning = true;
    return await executeMonthlyBonus(startedAt, auth.userId);
  } catch (error) {
    console.error("Monthly Bonus POST Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  } finally {
    isMonthlyBonusRunning = false;
  }
}

// ==========================================
// ✅ GET — Vercel Cron Job বা Test Run এর জন্য
// ==========================================
export async function GET(req) {
  const startedAt = Date.now();

  if (isMonthlyBonusRunning) {
    return NextResponse.json(
      {
        success: false,
        message: "মাসিক বোনাস বর্তমানে প্রসেস হচ্ছে, দয়া করে অপেক্ষা করুন!",
      },
      { status: 429 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: "অরক্ষিত বা আনঅথরাইজড ক্রন রিকোয়েস্ট!" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();
    isMonthlyBonusRunning = true;
    return await executeMonthlyBonus(startedAt, "cron_system");
  } catch (error) {
    console.error("Monthly Bonus GET Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  } finally {
    isMonthlyBonusRunning = false;
  }
}

// ==========================================
// 🔄 মূল মাসিক বোনাস বিতরণের কমন লজিক (নিরাপদ)
// ==========================================
async function executeMonthlyBonus(startedAt, runBy) {
  // ২. বোনাস সেটিংস
  let settings = await BonusSetting.findOne({});
  if (!settings) {
    settings = await BonusSetting.create({});
  }

  if (!settings.topRankerEnabled) {
    return NextResponse.json(
      { success: false, message: "মাসিক টপ র‍্যাংকার বন্ধ আছে!" },
      { status: 400 },
    );
  }

  // ৩. এই মাসের key
  const thisMonthKey = getMonthKey();

  // ৪. Top ইউজার — monthlyCashbackReceived > 0
  const allUsersWithCashback = await User.find({
    role: "user",
    monthlyCashbackReceived: { $gt: 0 },
  })
    .sort({ monthlyCashbackReceived: -1 })
    .lean();

  if (allUsersWithCashback.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই — টপ র‍্যাংকার দেওয়ার মতো কেউ নেই।",
      },
      { status: 400 },
    );
  }

  const topN = settings.topRankerCount || 10;
  const topUsers = allUsersWithCashback.slice(0, topN);
  const notInTop = allUsersWithCashback.slice(topN);

  // যারা আগেই top_ranker bonus পেয়েছে
  const eligibleUsers = topUsers.filter(
    (u) =>
      !u.monthlyBonusHistory?.some(
        (h) => h.month === thisMonthKey && h.type === "top_ranker",
      ),
  );

  const alreadyGotUsers = topUsers.filter((u) =>
    u.monthlyBonusHistory?.some(
      (h) => h.month === thisMonthKey && h.type === "top_ranker",
    ),
  );

  if (eligibleUsers.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "এই মাসে সব টপ ইউজার আগেই বোনাস পেয়ে গেছে।",
      },
      { status: 400 },
    );
  }

  let totalBonus = 0;
  let raceCaught = 0;
  let failedCount = 0;
  const details = [];
  const skipped = [];

  // Skip log: যারা আগেই পেয়েছে
  for (const u of alreadyGotUsers) {
    skipped.push({
      uid: u.uid,
      phone: u.phone,
      reason: "already_got",
      monthlyCashback: u.monthlyCashbackReceived,
    });
  }

  // Skip log: যারা Top N-এ নেই
  for (const u of notInTop) {
    skipped.push({
      uid: u.uid,
      phone: u.phone,
      reason: `not_in_top_${topN}`,
      monthlyCashback: u.monthlyCashbackReceived,
    });
  }

  // ৫. প্রতিটি eligible ইউজারের জন্য atomic update
  for (let i = 0; i < eligibleUsers.length; i++) {
    const user = eligibleUsers[i];
    const rank = i + 1;

    let prize = 0;
    if (rank === 1) prize = settings.rank1Prize || 5000;
    else if (rank === 2) prize = settings.rank2Prize || 3000;
    else if (rank === 3) prize = settings.rank3Prize || 2000;
    else if (rank === 4) prize = settings.rank4Prize || 1000;
    else if (rank === 5) prize = settings.rank5Prize || 800;
    else if (rank === 6) prize = settings.rank6Prize || 600;
    else if (rank === 7) prize = settings.rank7Prize || 500;
    else if (rank === 8) prize = settings.rank8Prize || 400;
    else if (rank === 9) prize = settings.rank9Prize || 300;
    else if (rank === 10) prize = settings.rank10Prize || 200;
    else if (rank >= 11) prize = settings.rank11PlusPrize || 100;

    if (prize <= 0) {
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "no_prize_for_rank",
        monthlyCashback: user.monthlyCashbackReceived,
      });
      continue;
    }

    const topRankerTurnover = prize * 3;

    try {
      const updateResult = await User.updateOne(
        {
          _id: user._id,
          monthlyBonusHistory: {
            $not: {
              $elemMatch: {
                month: thisMonthKey,
                type: "top_ranker",
              },
            },
          },
        },
        {
          $inc: { balance: prize, turnover: topRankerTurnover },
          $set: { lastMonthlyBonusAt: new Date() },
          $push: {
            monthlyBonusHistory: {
              amount: prize,
              type: "top_ranker",
              month: thisMonthKey,
              rank: rank,
              givenAt: new Date(),
            },
          },
        },
      );

      if (updateResult.modifiedCount > 0) {
        totalBonus += prize;
        details.push({
          rank,
          uid: user.uid,
          phone: user.phone,
          monthlyCashbackReceived: user.monthlyCashbackReceived,
          prize,
          turnover: topRankerTurnover,
        });
      } else {
        raceCaught++;
        skipped.push({
          uid: user.uid,
          phone: user.phone,
          reason: "race_caught",
          monthlyCashback: user.monthlyCashbackReceived,
        });
      }
    } catch (err) {
      failedCount++;
      console.error(`Top ranker error for ${user.uid}:`, err.message);
      skipped.push({
        uid: user.uid,
        phone: user.phone,
        reason: "error: " + err.message,
      });
    }
  }

  // ৬. সেটিংসে ট্র্যাকিং আপডেট
  await BonusSetting.updateOne(
    { _id: settings._id },
    {
      $set: { lastMonthlyBonusAt: new Date() },
      $inc: { monthlyBonusGivenCount: 1 },
    },
  );

  // Reset only if winners
  if (details.length > 0) {
    await User.updateMany(
      { role: "user" },
      {
        $set: {
          monthlyCashbackReceived: 0,
          monthlyTurnover: 0,
          monthlyLost: 0,
        },
      },
    );
  }

  // ✅ ৭. Log save
  await BonusRunLog.create({
    type: "monthly",
    periodKey: thisMonthKey,
    summary: {
      totalGiven: details.length,
      totalSkipped: skipped.length,
      totalAmount: totalBonus,
      totalWinners: details.length,
      totalBonus,
      raceCaught,
      failedCount,
      durationMs: Date.now() - startedAt,
    },
    given: details,
    skipped,
    runBy: runBy,
    runAt: new Date(),
  });

  return NextResponse.json(
    {
      success: true,
      message: `✅ মাসিক টপ র‍্যাংকার বোনাস সফলভাবে দেওয়া হয়েছে!`,
      summary: {
        totalWinners: details.length,
        totalSkipped: skipped.length,
        totalBonus,
        monthKey: thisMonthKey,
        raceCaught,
        failedCount,
      },
      details,
      skipped,
    },
    { status: 200 },
  );
}
