import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import BonusSetting from '@/models/BonusSetting';

// ==========================================
// মাসের key বের করার helper
// ==========================================
function getMonthKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// ==========================================
// ✅ GET — Cron থেকে মাসিক টপ র‍্যাংকার বোনাস
// ==========================================
export async function GET(req) {
  try {
    // ✅ ১. Cron Secret চেক
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // ✅ ২. বোনাস সেটিংস চেক
    let settings = await BonusSetting.findOne({});
    if (!settings) {
      settings = await BonusSetting.create({});
    }

    if (!settings.topRankerEnabled) {
      return NextResponse.json({
        success: false,
        message: 'মাসিক টপ র‍্যাংকার বন্ধ আছে!'
      }, { status: 400 });
    }

    const thisMonthKey = getMonthKey();

    // ✅ ৩. Top 10 ইউজার — monthlyCashbackReceived > 0
    const topUsers = await User.find({
      role: 'user',
      monthlyCashbackReceived: { $gt: 0 }
    })
      .sort({ monthlyCashbackReceived: -1 })
      .limit(settings.topRankerCount || 10);

    if (topUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'এই মাসে কোনো ক্যাশব্যাক প্রাপক নেই।',
      }, { status: 400 });
    }

    let totalBonus = 0;
    const details = [];

    // ✅ ৪. প্রতিটি ইউজারের জন্য atomic update
    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const rank = i + 1;

      const alreadyGot = user.monthlyBonusHistory?.some(
        (h) => h.month === thisMonthKey && h.type === 'top_ranker'
      );
      if (alreadyGot) continue;

      // র‍্যাংক অনুযায়ী পুরস্কার
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

      if (prize <= 0) continue;

      const topRankerTurnover = prize * 3;

      try {
        // ✅ CAS: এই মাসে top_ranker না থাকলে update
        const updateResult = await User.updateOne(
          {
            _id: user._id,
            'monthlyBonusHistory': {
              $not: {
                $elemMatch: {
                  month: thisMonthKey,
                  type: 'top_ranker',
                }
              }
            }
          },
          {
            $inc: {
              balance: prize,
              turnover: topRankerTurnover,
            },
            $set: {
              lastMonthlyBonusAt: new Date(),
            },
            $push: {
              monthlyBonusHistory: {
                amount: prize,
                type: 'top_ranker',
                month: thisMonthKey,
                rank: rank,
                givenAt: new Date(),
              }
            }
          }
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
        }
      } catch (err) {
        console.error(`Top ranker error for ${user.uid}:`, err.message);
      }
    }

    // ✅ ৫. সেটিংস আপডেট
    await BonusSetting.updateOne(
      { _id: settings._id },
      {
        $set: { lastMonthlyBonusAt: new Date() },
        $inc: { monthlyBonusGivenCount: 1 },
      }
    );

    // ✅ ৬. সবার মাসিক ডাটা রিসেট
    await User.updateMany(
      { role: 'user' },
      {
        $set: {
          monthlyCashbackReceived: 0,
          monthlyTurnover: 0,
          monthlyLost: 0,
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `✅ মাসিক বোনাস দেওয়া হয়েছে (Cron)!`,
      summary: {
        totalWinners: details.length,
        totalBonus,
        monthKey: thisMonthKey,
      },
      details,
    }, { status: 200 });

  } catch (error) {
    console.error('Cron Monthly Bonus Error:', error);
    return NextResponse.json(
      { success: false, message: 'সার্ভার এরর: ' + error.message },
      { status: 500 }
    );
  }
}