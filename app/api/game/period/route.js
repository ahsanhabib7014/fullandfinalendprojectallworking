import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Bet from "@/models/Bet";
import { GameResult } from "@/models/Game";

export async function GET(req) {
  try {
    // ১. ডাটাবেজ কানেক্ট
    await dbConnect();

    // ২. HttpOnly কুকি থেকে টোকেন ভেরিফাই
    const token = req.cookies.get("token")?.value;
    let tokenUid = null;
    let tokenObjectId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        tokenUid = decoded.uid || decoded.phone || decoded.userId;

        if (tokenUid && mongoose.isValidObjectId(tokenUid)) {
          tokenObjectId = tokenUid;
        }
      } catch (err) {
        // Token invalid হলেও চলবে
      }
    }

    const currentTime = Date.now();
    const periodDuration = 30;
    const epochSeconds = Math.floor(currentTime / 1000);
    const timeLeft = periodDuration - (epochSeconds % periodDuration);

    const basePeriodNumber = Math.floor(epochSeconds / periodDuration);
    const periodNumber = `PER-${basePeriodNumber}`;
    const currentRoundNo = basePeriodNumber;

    const prevPeriodNumber = `PER-${basePeriodNumber - 1}`;
    const prevRoundNo = basePeriodNumber - 1;

    // ==========================================
    // ✅ ATOMIC result processing
    // ✅ FIX: LOSS হলেও weeklyLost, monthlyLost, totalLost বাড়াবে
    // ==========================================
    try {
      // ✅ String + Number দুই ফরম্যাটে খুঁজি
      const bets = await Bet.find({
        $or: [
          { periodNumber: prevPeriodNumber },
          { roundNo: prevRoundNo },
          { roundNo: String(prevRoundNo) },
        ],
      });

      let totalBig = 0;
      let totalSmall = 0;

      bets.forEach((bet) => {
        const amt = Number(bet.amount) || 0;
        const ch = String(bet.choice).toUpperCase();
        if (ch === "BIG") totalBig += amt;
        if (ch === "SMALL") totalSmall += amt;
      });

      // ✅ House Edge: বেশি বেট যেদিকে → তার বিপরীতে
      let winningResult = "";
      if (totalBig > totalSmall) {
        winningResult = "Small";
      } else if (totalSmall > totalBig) {
        winningResult = "Big";
      } else {
        winningResult = Math.random() < 0.5 ? "Big" : "Small";
      }

      // ✅ ATOMIC UPSERT
      let isNewlyCreated = false;
      try {
        const upsertResult = await GameResult.findOneAndUpdate(
          { periodNumber: prevPeriodNumber },
          {
            $setOnInsert: {
              periodNumber: prevPeriodNumber,
              result: winningResult,
              totalBig,
              totalSmall,
            },
          },
          // changed here: new -> returnDocument
          { upsert: true, returnDocument: "after", rawResult: true },
        );

        isNewlyCreated = !upsertResult.lastErrorObject?.updatedExisting;
      } catch (err) {
        if (err.code === 11000) {
          isNewlyCreated = false;
        } else {
          throw err;
        }
      }

      // ✅ শুধু নতুন তৈরি হলে bets প্রসেস
      if (isNewlyCreated && bets.length > 0) {
        for (let bet of bets) {
          if (
            bet.status === "PENDING" ||
            bet.status === "pending" ||
            bet.result === "pending"
          ) {
            const userChoiceFormatted = String(bet.choice).toLowerCase();
            const winningResultFormatted = winningResult.toLowerCase();
            const betAmountNum = Number(bet.amount) || 0;

            // ✅ userQuery তৈরি — String বা ObjectId handle
            let userQuery = null;
            if (bet.userId) {
              const userIdStr = bet.userId.toString();
              if (mongoose.Types.ObjectId.isValid(userIdStr)) {
                userQuery = { _id: new mongoose.Types.ObjectId(userIdStr) };
              } else {
                userQuery = { uid: userIdStr };
              }
            } else if (bet.uid) {
              userQuery = { uid: bet.uid.toString() };
            }

            if (userChoiceFormatted === winningResultFormatted) {
              // ✅ WIN
              bet.status = "WIN";
              bet.outcome = "WIN";
              bet.result = "win";
              bet.returnAmount = betAmountNum * 2;
              await bet.save();

              if (userQuery) {
                await User.updateOne(userQuery, {
                  $inc: { balance: betAmountNum * 2 },
                });
              }
            } else {
              // ✅ LOSS — bet update
              bet.status = "LOSS";
              bet.outcome = "LOSS";
              bet.result = "loss";
              bet.returnAmount = 0;
              await bet.save();

              // ✅✅✅ NEW: LOSS হলে weeklyLost, monthlyLost, totalLost বাড়াও
              if (userQuery && betAmountNum > 0) {
                await User.updateOne(userQuery, {
                  $inc: {
                    weeklyLost: betAmountNum, // ✅ সাপ্তাহিক লস
                    monthlyLost: betAmountNum, // ✅ মাসিক লস
                    totalLost: betAmountNum, // ✅ সব সময়ের লস
                  },
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.log("Result processing error:", err.message);
    }
    // ==========================================

    // ৫. ইউজারের বর্তমান বেট ও ব্যালেন্স চেক
    let userBetResult = null;
    let hasUserBetForThisPeriod = false;
    let userBalance = undefined;

    if (tokenUid) {
      const userBetQuery = [{ uid: tokenUid }];
      if (tokenObjectId) {
        userBetQuery.push({ userId: tokenObjectId });
      }

      const currentBet = await Bet.findOne({
        $and: [
          { $or: userBetQuery },
          {
            $or: [{ periodNumber: periodNumber }, { roundNo: currentRoundNo }],
          },
        ],
      });

      if (currentBet) {
        hasUserBetForThisPeriod = true;
      }

      const latestBet = await Bet.findOne({
        $or: userBetQuery,
      }).sort({ createdAt: -1 });

      if (latestBet) {
        userBetResult = {
          periodNumber: latestBet.periodNumber || latestBet.roundNo,
          choice: latestBet.choice,
          result:
            latestBet.result ||
            (latestBet.status ? latestBet.status.toLowerCase() : "pending"),
        };
      }

      const userQuery = [{ uid: tokenUid }];
      if (tokenObjectId) {
        userQuery.push({ _id: tokenObjectId });
      }

      const dbUser = await User.findOne({ $or: userQuery }).select("balance");

      if (dbUser && dbUser.balance !== undefined) {
        userBalance = Number(dbUser.balance);
      }
    }

    // ৬. সাম্প্রতিক ১০টি গ্লোবাল রেজাল্ট
    const recentResults = await GameResult.find()
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(
      {
        success: true,
        periodNumber,
        timeLeft,
        recentResults,
        userBetResult,
        hasUserBetForThisPeriod,
        balance: userBalance,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("API PERIOD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error: " + error.message,
      },
      { status: 500 },
    );
  }
}
