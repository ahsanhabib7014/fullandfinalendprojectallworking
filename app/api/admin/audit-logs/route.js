import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import AuditLog from "@/models/AuditLog";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "অনুমোদন নেই (Unauthorized)" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "আপনার এই পেজ দেখার অনুমতি নেই" },
        { status: 403 },
      );
    }

    await dbConnect();

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const groupedLogs = {
      manage_dashboard: [],
      view_game_tracking: [],
      manage_users: [],
      manage_agents: [], // 🆕 এজেন্ট সিস্টেমের জন্য নতুন ক্যাটাগরি
      manage_deposits: [],
      manage_withdraws: [],
      manage_referrals: [],
      manage_payments: [],
      manage_methods: [],
      manage_exchange_rate: [],
      manage_nowpayments: [],
      manage_auto_crypto: [],
      manage_bonus_settings: [],
      view_bonus_history: [],
      others: [],
    };

    logs.forEach((log) => {
      const act = String(log.action || "").toLowerCase();
      const details = String(log.details || "").toLowerCase();
      const combined = `${act} ${details}`;

      // 🆕 ১. এজেন্ট সিস্টেমের সব লগ এখানে যাবে
      if (act.startsWith("agent_") || combined.includes("এজেন্ট")) {
        groupedLogs.manage_agents.push(log);

        // ২. অন্যান্য লজিক
      } else if (
        combined.includes("dashboard") ||
        combined.includes("ড্যাশবোর্ড")
      ) {
        groupedLogs.manage_dashboard.push(log);
      } else if (
        combined.includes("track") ||
        combined.includes("game") ||
        combined.includes("ট্র্যাকিং")
      ) {
        groupedLogs.view_game_tracking.push(log);
      } else if (
        combined.includes("user") ||
        combined.includes("balance") ||
        combined.includes("commission") ||
        combined.includes("ইউজার") ||
        combined.includes("ব্যালেন্স")
      ) {
        groupedLogs.manage_users.push(log);
      } else if (combined.includes("deposit") || combined.includes("ডিপোজিট")) {
        groupedLogs.manage_deposits.push(log);
      } else if (combined.includes("withdraw") || combined.includes("উইথড্র")) {
        groupedLogs.manage_withdraws.push(log);
      } else if (
        combined.includes("referral") ||
        combined.includes("রেফারেল")
      ) {
        groupedLogs.manage_referrals.push(log);
      } else if (combined.includes("payment") || combined.includes("পেমেন্ট")) {
        groupedLogs.manage_payments.push(log);
      } else if (combined.includes("method") || combined.includes("মেথড")) {
        groupedLogs.manage_methods.push(log);
      } else if (combined.includes("exchange") || combined.includes("rate")) {
        groupedLogs.manage_exchange_rate.push(log);
      } else if (combined.includes("nowpayment")) {
        groupedLogs.manage_nowpayments.push(log);
      } else if (combined.includes("crypto")) {
        groupedLogs.manage_auto_crypto.push(log);
      } else if (
        combined.includes("bonus_setting") ||
        combined.includes("বোনাস সেটিংস")
      ) {
        groupedLogs.manage_bonus_settings.push(log);
      } else if (
        combined.includes("bonus") ||
        combined.includes("history") ||
        combined.includes("বোনাস ইতিহাস")
      ) {
        groupedLogs.view_bonus_history.push(log);
      } else {
        groupedLogs.others.push(log);
      }
    });

    return NextResponse.json({
      success: true,
      logs,
      groupedLogs,
    });
  } catch (err) {
    console.error("Fetch audit logs error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভারে ত্রুটি ঘটেছে" },
      { status: 500 },
    );
  }
}
