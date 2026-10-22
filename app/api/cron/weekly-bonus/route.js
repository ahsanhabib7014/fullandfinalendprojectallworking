import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import BonusSetting from "@/models/BonusSetting";

// ==========================================
// সপ্তাহের key বের করার helper
// ==========================================
function getWeekKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const days = Math.floor((d - oneJan) / 86400000);
  const weekNum = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

// ==========================================
// ✅ GET — Cron থেকে সাপ্তাহিক বোনাস
// ==========================================
export async function GET(req) {
  try {
    // ✅ ১. Cron Secret চেক (কুকি/সেশন নয়!)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await dbConnect();

    // ✅ ২. বোনাস সেটিংস চেক
    let settings = await BonusSetting.findOne({});
    if (!settings) {
      settings = await BonusSetting.create({});
    }

    if (!settings.weeklyBonusEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "সাপ্তাহিক বোনাস বন্ধ আছে!",
        },
        { status: 400 },
      );
    }

    // ✅ ৩. সাপ্তাহিক বোনাস লজিক
    const thisWeekKey = getWeekKey();
    const users = await User.find({ role: "user" });

    let depositBonusCount = 0;
    let cashbackCount = 0;
    let totalDepositBonus = 0;
    let totalCashback = 0;
    const details = [];

    for (const user of users) {
      const alreadyGot = user.weeklyBonusHistory?.some(
        (h) => h.week === thisWeekKey,
      );
      if (alreadyGot) continue;

      let userBonus = 0;
      let depositBonusTurnover = 0;
      let cashbackAmount = 0;
      let depositBonusAmount = 0;
      const userDetails = { uid: user.uid, phone: user.phone, bonuses: [] };

      // ডিপোজিট বোনাস
      if (
        settings.depositBonusEnabled &&
        (user.weeklyDeposit || 0) >= settings.depositBonusMinDeposit
      ) {
        let depositBonus =
          (user.weeklyDeposit || 0) * (settings.depositBonusPercent / 100);
        if (depositBonus > settings.depositBonusMax) {
          depositBonus = settings.depositBonusMax;
        }
        depositBonus = Math.round(depositBonus);

        if (depositBonus > 0) {
          depositBonusAmount = depositBonus;
          userBonus += depositBonus;
          totalDepositBonus += depositBonus;
          depositBonusCount++;
          depositBonusTurnover = depositBonus * 2;

          userDetails.bonuses.push({
            type: "ডিপোজিট বোনাস",
            amount: depositBonus,
            turnover: depositBonusTurnover,
          });
        }
      }

      // ক্যাশব্যাক
      if (
        settings.cashbackEnabled &&
        (user.weeklyTurnover || 0) >= settings.cashbackMinTurnover &&
        (user.weeklyLost || 0) > 0
      ) {
        let cashback =
          (user.weeklyLost || 0) * (settings.cashbackPercent / 100);
        if (cashback > settings.cashbackMax) {
          cashback = settings.cashbackMax;
        }
        cashback = Math.round(cashback);

        if (cashback > 0) {
          cashbackAmount = cashback;
          userBonus += cashback;
          totalCashback += cashback;
          cashbackCount++;

          userDetails.bonuses.push({
            type: "ক্যাশব্যাক",
            amount: cashback,
          });
        }
      }

      // ✅ Atomic update
      if (userBonus > 0) {
        try {
          const updateResult = await User.updateOne(
            {
              _id: user._id,
              "weeklyBonusHistory.week": { $ne: thisWeekKey },
            },
            {
              $inc: {
                balance: userBonus,
                turnover: depositBonusTurnover,
                ...(cashbackAmount > 0
                  ? { monthlyCashbackReceived: cashbackAmount }
                  : {}),
              },
              $set: {
                lastWeeklyBonusAt: new Date(),
                weeklyTurnover: 0,
                weeklyLost: 0,
                weeklyDeposit: 0,
              },
              $push: {
                weeklyBonusHistory: {
                  $each: [
                    ...(depositBonusAmount > 0
                      ? [
                          {
                            amount: depositBonusAmount,
                            type: "deposit",
                            week: thisWeekKey,
                            givenAt: new Date(),
                          },
                        ]
                      : []),
                    ...(cashbackAmount > 0
                      ? [
                          {
                            amount: cashbackAmount,
                            type: "cashback",
                            week: thisWeekKey,
                            givenAt: new Date(),
                          },
                        ]
                      : []),
                  ],
                },
              },
            },
          );

          if (updateResult.modifiedCount > 0) {
            details.push(userDetails);
          }
        } catch (err) {
          console.error(`Bonus error for ${user.uid}:`, err.message);
        }
      }
    }

    // ✅ সেটিংস আপডেট
    await BonusSetting.updateOne(
      { _id: settings._id },
      {
        $set: { lastWeeklyBonusAt: new Date() },
        $inc: { weeklyBonusGivenCount: 1 },
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: `✅ সাপ্তাহিক বোনাস দেওয়া হয়েছে (Cron)!`,
        summary: {
          totalUsers: details.length,
          depositBonusCount,
          cashbackCount,
          totalDepositBonus,
          totalCashback,
          totalBonus: totalDepositBonus + totalCashback,
          weekKey: thisWeekKey,
        },
        details,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cron Weekly Bonus Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
