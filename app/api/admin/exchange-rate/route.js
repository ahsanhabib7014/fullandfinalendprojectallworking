import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Setting from "@/models/Setting";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

const DEFAULT_RATE = 120;

// GET: Current rate
export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth();
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message || "অনুমতি নেই!" },
        { status: auth.status || 401 },
      );
    }

    const setting = await Setting.findOne({ key: "usdToBdtRate" });
    const rate = setting?.value || DEFAULT_RATE;

    return NextResponse.json(
      {
        success: true,
        rate: Number(rate),
        updatedAt: setting?.updatedAt || null,
        source: setting ? "database" : "default",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Exchange Rate GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "সার্ভার এরর!",
        rate: DEFAULT_RATE,
      },
      { status: 500 },
    );
  }
}

// POST: Update rate with Audit Log & Old/New Data
export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const adminUser = auth.user;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ডেটা!" },
        { status: 400 },
      );
    }

    const { rate } = body || {};
    const parsedRate = Number(rate);

    if (isNaN(parsedRate) || parsedRate <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "সঠিক rate দিন (ধনাত্মক সংখ্যা)!",
        },
        { status: 400 },
      );
    }

    if (parsedRate < 50 || parsedRate > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate অবশ্যই ৫০ থেকে ৫০০ এর মধ্যে হতে হবে!",
        },
        { status: 400 },
      );
    }

    // আগের রেট সংরক্ষণ করা
    const existingSetting = await Setting.findOne({ key: "usdToBdtRate" });
    const oldRate = existingSetting ? existingSetting.value : DEFAULT_RATE;

    const updated = await Setting.findOneAndUpdate(
      { key: "usdToBdtRate" },
      { value: parsedRate },
      { upsert: true, returnDocument: "after" },
    );

    // অডিট লগ তৈরি করা
    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_EXCHANGE_RATE",
        targetUser: "SYSTEM_SETTINGS",
        oldData: { usdToBdtRate: oldRate },
        newData: { usdToBdtRate: parsedRate },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক এক্সচেঞ্জ রেট ৳${oldRate} থেকে পরিবর্তন করে ৳${parsedRate} করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `✅ Exchange rate সফলভাবে ৳${parsedRate} এ আপডেট হয়েছে!`,
        rate: parsedRate,
        updatedAt: updated.updatedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Exchange Rate POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "সার্ভার এরর!",
      },
      { status: 500 },
    );
  }
}
