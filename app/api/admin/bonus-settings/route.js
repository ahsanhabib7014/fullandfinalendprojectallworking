import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import BonusSetting from "@/models/BonusSetting";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog"; // ✅ অডিট লগ ইমপোর্ট করা হলো

// ✅ সাব-অ্যাডমিন বা অ্যাডমিন ভেরিফিকেশনের জন্য হেলপার ফাংশন
const checkAdminAuth = async () => {
  try {
    const auth = await verifyAuth("admin");
    if (auth.success && auth.user) {
      const role = auth.user.role;
      if (role === "admin" || role === "sub-admin") {
        return { success: true, user: auth.user };
      }
    }
  } catch (e) {
    // ignore
  }
  return { success: false, message: "অনুমোদিত নয়! দয়া করে আবার লগইন করুন।" };
};

// ==========================================
// ✅ GET — বোনাস সেটিংস পাওয়া
// ==========================================
export async function GET(req) {
  try {
    await dbConnect();

    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: 401 },
      );
    }

    let settings = await BonusSetting.findOne({});

    // যদি কোনো সেটিংস না থাকে — ডিফল্ট তৈরি করি
    if (!settings) {
      settings = await BonusSetting.create({});
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bonus Settings GET Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ PATCH — বোনাস সেটিংস আপডেট (Atomic Upsert)
// ==========================================
export async function PATCH(req) {
  try {
    await dbConnect();

    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, message: authCheck.message },
        { status: 401 },
      );
    }

    const adminUser = authCheck.user;
    const body = await req.json();

    // আগের সেটিংস ধরে রাখা (অডিট লগের জন্য)
    const existingSettings = await BonusSetting.findOne({});

    // ✅ কোন কোন ফিল্ড আপডেট করা যাবে
    const allowedFields = [
      // সাপ্তাহিক
      "weeklyBonusEnabled",
      "depositBonusEnabled",
      "depositBonusPercent",
      "depositBonusMax",
      "depositBonusMinDeposit",
      "cashbackEnabled",
      "cashbackPercent",
      "cashbackMax",
      "cashbackMinTurnover",
      // মাসিক
      "topRankerEnabled",
      "topRankerCount",
      // ✅ ১১টি আলাদা rank ফিল্ড
      "rank1Prize",
      "rank2Prize",
      "rank3Prize",
      "rank4Prize",
      "rank5Prize",
      "rank6Prize",
      "rank7Prize",
      "rank8Prize",
      "rank9Prize",
      "rank10Prize",
      "rank11PlusPrize",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // ✅ Atomic upsert — Race Condition মুক্ত
    const settings = await BonusSetting.findOneAndUpdate(
      {}, // যেকোনো একটি ডকুমেন্ট
      { $set: updateData },
      {
        returnDocument: "after", // আপডেটেড ডকুমেন্ট ফেরত
        upsert: true, // না থাকলে তৈরি হবে
        setDefaultsOnInsert: true, // ডিফল্ট মান বসবে
      },
    );

    // ==========================================
    // ✅ অডিট লগ সেভ করা
    // ==========================================
    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const roleText =
        adminUser.role === "sub-admin" ? "সাব-অ্যাডমিন" : "অ্যাডমিন";

      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_BONUS_SETTINGS",
        targetUser: "BONUS_SETTINGS",
        oldData: existingSettings ? existingSettings.toObject() : {},
        newData: settings.toObject(),
        details: `${roleText} (${adminUser.phone || adminUser.uid}) কর্তৃক বোনাস সেটিংস আপডেট করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ বোনাস সেটিংস সফলভাবে আপডেট হয়েছে!",
        settings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bonus Settings PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
