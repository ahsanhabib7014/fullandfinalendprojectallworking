import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import AgentSettings from "@/models/AgentSettings";
import AuditLog from "@/models/AuditLog"; // 🆕 অডিট লগ ইমপোর্ট
import { verifyAuth } from "@/utils/authCheck";

// GET — গ্লোবাল সেটিংস পড়ুন
export async function GET(req) {
  try {
    const auth = await verifyAuth("admin", "agent-settings", req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();
    const settings = await AgentSettings.getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        defaultDepositCommission: settings.defaultDepositCommission,
        defaultWithdrawCommission: settings.defaultWithdrawCommission,
        dollarRate: settings.dollarRate,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// PATCH — কমিশন এবং ডলার রেট আপডেট করুন
export async function PATCH(req) {
  try {
    const auth = await verifyAuth(
      "admin",
      "agent-settings",
      req,
      "AGENT_SETTINGS_UPDATE",
    );
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();
    const body = await req.json();

    const { defaultDepositCommission, defaultWithdrawCommission, dollarRate } =
      body;

    // ভ্যালিডেশন
    if (
      defaultDepositCommission === undefined &&
      defaultWithdrawCommission === undefined &&
      dollarRate === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "আপডেট করার জন্য কোনো ফিল্ড পাওয়া যায়নি।",
        },
        { status: 400 },
      );
    }

    if (
      defaultDepositCommission !== undefined &&
      (defaultDepositCommission < 0 || defaultDepositCommission > 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ডিপোজিট কমিশন ০ থেকে ১০০ এর মধ্যে হতে হবে।",
        },
        { status: 400 },
      );
    }

    if (
      defaultWithdrawCommission !== undefined &&
      (defaultWithdrawCommission < 0 || defaultWithdrawCommission > 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "উইথড্র কমিশন ০ থেকে ১০০ এর মধ্যে হতে হবে।",
        },
        { status: 400 },
      );
    }

    if (dollarRate !== undefined && dollarRate < 0) {
      return NextResponse.json(
        { success: false, message: "ডলার রেট ঋণাত্মক হতে পারবে না।" },
        { status: 400 },
      );
    }

    // আপডেট
    const settings = await AgentSettings.getSettings();

    // 🆕 অডিট লগের জন্য আগের ভ্যালুগুলো সেভ করে রাখা
    const oldData = {
      defaultDepositCommission: settings.defaultDepositCommission,
      defaultWithdrawCommission: settings.defaultWithdrawCommission,
      dollarRate: settings.dollarRate,
    };

    if (defaultDepositCommission !== undefined)
      settings.defaultDepositCommission = defaultDepositCommission;
    if (defaultWithdrawCommission !== undefined)
      settings.defaultWithdrawCommission = defaultWithdrawCommission;
    if (dollarRate !== undefined) settings.dollarRate = dollarRate;

    settings.updatedBy = auth.user._id;
    await settings.save();

    // 🆕 অডিট লগ তৈরি
    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action: "AGENT_SETTINGS_UPDATE",
        targetUser: "N/A",
        oldData,
        newData: {
          defaultDepositCommission: settings.defaultDepositCommission,
          defaultWithdrawCommission: settings.defaultWithdrawCommission,
          dollarRate: settings.dollarRate,
        },
        details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক এজেন্ট সেটিংস আপডেট করা হয়েছে।`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
      // অডিট লগ ফেইল করলেও সেটিংস আপডেট বাতিল হবে না
    }

    return NextResponse.json({
      success: true,
      message: "সেটিংস সফলভাবে আপডেট হয়েছে।",
      settings: {
        defaultDepositCommission: settings.defaultDepositCommission,
        defaultWithdrawCommission: settings.defaultWithdrawCommission,
        dollarRate: settings.dollarRate,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
