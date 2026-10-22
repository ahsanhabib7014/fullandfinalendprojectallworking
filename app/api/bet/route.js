import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Bet from "@/models/Bet";
import User from "@/models/User";
import { betSchema, sanitizeString } from "@/utils/validators";
import { verifyAuth } from "@/utils/authCheck";

export async function POST(req) {
  try {
    // ১. ডেটাবেজ কানেকশন নিশ্চিত করা
    await dbConnect();

    // ২. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
    const auth = await verifyAuth("user");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        {
          status: auth.status,
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
          },
        },
      );
    }

    const userId = auth.user._id;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "অবৈধ বা খালি ডেটা পাঠানো হয়েছে!" },
        { status: 400 },
      );
    }

    // Zod Validation & Sanitization
    const validationResult = betSchema.safeParse({
      choice: sanitizeString(body?.choice),
      amount: Number(body?.amount),
      roundNo: Number(body?.roundNo),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, errors: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { choice, amount, roundNo } = validationResult.data;

    // Negative value check
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "নেগেটিভ বা শূন্য পরিমাণ গ্রহণযোগ্য নয়" },
        { status: 400 },
      );
    }

    // ==========================================
    // ✅ ATOMIC balance deduct + turnover tracking
    // ==========================================
    // ✅ findOneAndUpdate + $inc = atomic (race condition proof)
    // - isBlocked: false → ব্লকড user পারবে না
    // - balance: { $gte: amount } → balance যথেষ্ট হলে তবেই deduct
    // ✅ NEW: weeklyTurnover + monthlyTurnover যোগ করা হলো
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        isBlocked: false,
        balance: { $gte: amount },
      },
      {
        $inc: {
          balance: -amount,
          turnover: -amount,
          weeklyTurnover: amount, // ✅ নতুন — সাপ্তাহিক টার্নওভার
          monthlyTurnover: amount, // ✅ নতুন — মাসিক টার্নওভার
        },
      },
      { returnDocument: "after" },
    );

    if (!user) {
      // হয় user নেই, blocked, অথবা balance কম — কারণ খুঁজে বের করি
      const checkUser = await User.findById(userId);

      if (!checkUser) {
        return NextResponse.json(
          { success: false, message: "ইউজার পাওয়া যায়নি" },
          { status: 403 },
        );
      }
      if (checkUser.isBlocked) {
        return NextResponse.json(
          { success: false, message: "আপনার অ্যাকাউন্ট ব্লকড" },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { success: false, message: "অপর্যাপ্ত ব্যালেন্স" },
        { status: 400 },
      );
    }

    // ✅ Turnover 0-এর নিচে গেলে clamp (atomic)
    if (user.turnover < 0) {
      await User.updateOne({ _id: userId }, { $set: { turnover: 0 } });
    }
    // ==========================================

    // ৩. Duplicate bet check
    const existingBet = await Bet.findOne({ userId: user._id, roundNo });

    if (existingBet) {
      // ⚠️ Already bet — balance refund দাও (atomic)
      // ✅ NEW: weeklyTurnover + monthlyTurnover ও ফেরত দাও
      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            balance: amount,
            turnover: amount,
            weeklyTurnover: -amount, // ✅ refund
            monthlyTurnover: -amount, // ✅ refund
          },
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে। আলাদা ব্রাউজার বা ডিভাইস থেকে একই রাউন্ডে বেট করা নিষিদ্ধ।",
        },
        { status: 400 },
      );
    }

    // ৪. Bet তৈরি — fail হলে refund
    let newBet;
    try {
      newBet = await Bet.create({
        userId: user._id,
        roundNo,
        choice,
        amount,
        status: "PENDING",
      });
    } catch (error) {
      // ⚠️ Bet fail হলে balance refund (atomic)
      // ✅ NEW: weeklyTurnover + monthlyTurnover ও ফেরত দাও
      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            balance: amount,
            turnover: amount,
            weeklyTurnover: -amount, // ✅ refund
            monthlyTurnover: -amount, // ✅ refund
          },
        },
      );

      if (error.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            message: "এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে!",
          },
          { status: 400 },
        );
      }
      throw error;
    }

    return NextResponse.json(
      { success: true, message: "বেট সফলভাবে গৃহীত হয়েছে", bet: newBet },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "এই রাউন্ডে ইতিমধ্যে বেট করা হয়েছে (ডুপ্লিকেট এন্ট্রি ব্লকড)।",
        },
        { status: 400 },
      );
    }

    console.error("Bet API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "সার্ভার এরর হয়েছে" },
      { status: 500 },
    );
  }
}
