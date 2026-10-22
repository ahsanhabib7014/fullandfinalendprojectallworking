import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AgentSettings from "@/models/AgentSettings";
import AuditLog from "@/models/AuditLog"; // 🆕 অডিট লগ ইমপোর্ট
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — সব এজেন্টের লিস্ট
// ==========================================
export async function GET(req) {
  try {
    const auth = await verifyAuth("admin", "agent-create", req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    const agents = await User.find({ role: "agent" })
      .select(
        "uid phone agentCode agentPhone agentCryptoAddress agentPaymentAccounts agentMainBalance agentCommissionBalance agentDepositCommission agentWithdrawCommission agentIsActive agentIsBlocked createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// POST — ইউজারকে এজেন্ট বানানো / আপডেট
// ==========================================
export async function POST(req) {
  try {
    const auth = await verifyAuth(
      "admin",
      "agent-create",
      req,
      "AGENT_CREATE_OR_UPDATE",
    );
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();
    const body = await req.json();

    const {
      uid, // যে ইউজারকে এজেন্ট বানাতে হবে (uid)
      agentPhone,
      agentCryptoAddress,
      agentPaymentAccounts, // 🆕 নতুন ফিল্ড
      agentMainBalance,
      agentCommissionBalance,
      agentDepositCommission,
      agentWithdrawCommission,
      agentIsActive,
      agentIsBlocked,
    } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: "ইউজার uid প্রয়োজন।" },
        { status: 400 },
      );
    }

    // ✅ ইউজার খুঁজে বের করা
    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "এই uid-এর কোনো ইউজার পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // ✅ অ্যাডমিন/সাব-অ্যাডমিনকে এজেন্ট বানানো যাবে না
    if (user.role === "admin" || user.role === "sub-admin") {
      return NextResponse.json(
        {
          success: false,
          message: "অ্যাডমিন বা সাব-অ্যাডমিনকে এজেন্ট বানানো যাবে না।",
        },
        { status: 400 },
      );
    }

    // ✅ নাম্বার ভ্যালিডেশন
    if (agentPhone !== undefined) {
      if (!/^[0-9]{11}$/.test(agentPhone)) {
        return NextResponse.json(
          { success: false, message: "এজেন্ট নাম্বার ১১ ডিজিটের হতে হবে।" },
          { status: 400 },
        );
      }

      // ✅ একই নাম্বার অন্য এজেন্টের নেই কিনা
      const phoneExists = await User.findOne({
        _id: { $ne: user._id },
        agentPhone,
        role: "agent",
      });
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: "এই নাম্বারটি অন্য এজেন্টের কাছে আছে।" },
          { status: 400 },
        );
      }
    }

    // ✅ কমিশন ভ্যালিডেশন
    if (
      agentDepositCommission !== undefined &&
      (agentDepositCommission < 0 || agentDepositCommission > 100)
    ) {
      return NextResponse.json(
        { success: false, message: "ডিপোজিট কমিশন ০–১০০ এর মধ্যে হতে হবে।" },
        { status: 400 },
      );
    }
    if (
      agentWithdrawCommission !== undefined &&
      (agentWithdrawCommission < 0 || agentWithdrawCommission > 100)
    ) {
      return NextResponse.json(
        { success: false, message: "উইথড্র কমিশন ০–১০০ এর মধ্যে হতে হবে।" },
        { status: 400 },
      );
    }

    // ✅ ব্যালেন্স ভ্যালিডেশন
    if (agentMainBalance !== undefined && agentMainBalance < 0) {
      return NextResponse.json(
        { success: false, message: "মূল ব্যালেন্স ঋণাত্মক হতে পারবে না।" },
        { status: 400 },
      );
    }
    if (agentCommissionBalance !== undefined && agentCommissionBalance < 0) {
      return NextResponse.json(
        { success: false, message: "কমিশন ব্যালেন্স ঋণাত্মক হতে পারবে না।" },
        { status: 400 },
      );
    }

    // ✅ রোল সেট + নতুন এজেন্ট হলে ডিফল্ট কমিশন গ্লোবাল সেটিংস থেকে
    const isNewAgent = user.role !== "agent";
    user.role = "agent";

    if (isNewAgent && !user.agentCode) {
      user.agentCode =
        "AG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    // গ্লোবাল ডিফল্ট কমিশন (নতুন এজেন্টের জন্য, যদি ফর্মে না পাঠানো হয়)
    if (isNewAgent && agentDepositCommission === undefined) {
      const settings = await AgentSettings.getSettings();
      user.agentDepositCommission = settings.defaultDepositCommission;
    }
    if (isNewAgent && agentWithdrawCommission === undefined) {
      const settings = await AgentSettings.getSettings();
      user.agentWithdrawCommission = settings.defaultWithdrawCommission;
    }

    // ✅ ফিল্ড আপডেট (শুধু পাঠানো ফিল্ড)
    if (agentPhone !== undefined) user.agentPhone = agentPhone;
    if (agentCryptoAddress !== undefined)
      user.agentCryptoAddress = agentCryptoAddress;

    // 🆕 একাধিক পেমেন্ট মেথড ও নাম্বার আপডেট
    if (
      agentPaymentAccounts !== undefined &&
      Array.isArray(agentPaymentAccounts)
    ) {
      user.agentPaymentAccounts = agentPaymentAccounts
        .filter((acc) => acc.method?.trim() && acc.accountNumber?.trim())
        .map((acc) => ({
          method: acc.method.trim(),
          accountNumber: acc.accountNumber.trim(),
        }));
    }

    if (agentMainBalance !== undefined)
      user.agentMainBalance = agentMainBalance;
    if (agentCommissionBalance !== undefined)
      user.agentCommissionBalance = agentCommissionBalance;
    if (agentDepositCommission !== undefined)
      user.agentDepositCommission = agentDepositCommission;
    if (agentWithdrawCommission !== undefined)
      user.agentWithdrawCommission = agentWithdrawCommission;
    if (agentIsActive !== undefined) user.agentIsActive = agentIsActive;
    if (agentIsBlocked !== undefined) user.agentIsBlocked = agentIsBlocked;

    await user.save();

    // 🆕 ৮. অডিট লগ তৈরি
    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action: isNewAgent ? "AGENT_CREATE" : "AGENT_UPDATE",
        targetUser: user.uid,
        details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক ${isNewAgent ? "নতুন এজেন্ট তৈরি" : "এজেন্ট তথ্য আপডেট"} করা হয়েছে। (UID: ${user.uid})`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: isNewAgent
        ? "ইউজারকে সফলভাবে এজেন্ট বানানো হয়েছে।"
        : "এজেন্ট তথ্য সফলভাবে আপডেট হয়েছে।",
      agent: {
        uid: user.uid,
        phone: user.phone,
        agentCode: user.agentCode,
        agentPhone: user.agentPhone,
        agentCryptoAddress: user.agentCryptoAddress,
        agentPaymentAccounts: user.agentPaymentAccounts || [], // 🆕
        agentMainBalance: user.agentMainBalance,
        agentCommissionBalance: user.agentCommissionBalance,
        agentDepositCommission: user.agentDepositCommission,
        agentWithdrawCommission: user.agentWithdrawCommission,
        agentIsActive: user.agentIsActive,
        agentIsBlocked: user.agentIsBlocked,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
