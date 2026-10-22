import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Deposit from "@/models/Deposit";
import Withdraw from "@/models/Withdraw";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — এজেন্টদের ডিপোজিট/উইথড্র হিস্ট্রি
// ==========================================
export async function GET(req) {
  try {
    const auth = await verifyAuth("admin", "agent-history", req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId"); // নির্দিষ্ট এজেন্ট
    const type = searchParams.get("type") || "all"; // deposit | withdraw | all
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;

    // ✅ ফিল্টার তৈরি
    const depositFilter = { agentId: { $ne: null } };
    const withdrawFilter = { agentId: { $ne: null } };

    if (agentId) {
      depositFilter.agentId = agentId;
      withdrawFilter.agentId = agentId;
    }
    if (status && status !== "all") {
      depositFilter.status = status;
      withdrawFilter.status = status;
    }

    let deposits = [];
    let withdraws = [];
    let totalDeposits = 0;
    let totalWithdraws = 0;

    // ==========================================
    // ডিপোজিট লোড
    // ==========================================
    if (type === "all" || type === "deposit") {
      totalDeposits = await Deposit.countDocuments(depositFilter);
      deposits = await Deposit.find(depositFilter)
        .populate("agentId", "uid phone agentCode agentPhone")
        .sort({ createdAt: -1 })
        .skip(type === "all" ? 0 : skip)
        .limit(type === "all" ? limit : limit)
        .lean();

      deposits = deposits.map((d) => ({ ...d, recordType: "deposit" }));
    }

    // ==========================================
    // উইথড্র লোড
    // ==========================================
    if (type === "all" || type === "withdraw") {
      totalWithdraws = await Withdraw.countDocuments(withdrawFilter);
      withdraws = await Withdraw.find(withdrawFilter)
        .populate("agentId", "uid phone agentCode agentPhone")
        .sort({ createdAt: -1 })
        .skip(type === "all" ? 0 : skip)
        .limit(type === "all" ? limit : limit)
        .lean();

      withdraws = withdraws.map((w) => ({ ...w, recordType: "withdraw" }));
    }

    // ==========================================
    // type === 'all' হলে একসাথে মার্জ + সর্ট
    // ==========================================
    let combined = [];
    if (type === "all") {
      combined = [...deposits, ...withdraws]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

      return NextResponse.json({
        success: true,
        records: combined,
        summary: {
          totalDeposits,
          totalWithdraws,
          totalRecords: totalDeposits + totalWithdraws,
        },
        pagination: {
          page,
          limit,
          totalPages: Math.ceil((totalDeposits + totalWithdraws) / limit),
        },
      });
    }

    // ==========================================
    // শুধু deposit বা withdraw হলে
    // ==========================================
    return NextResponse.json({
      success: true,
      records: type === "deposit" ? deposits : withdraws,
      summary: {
        totalDeposits,
        totalWithdraws,
        totalRecords: type === "deposit" ? totalDeposits : totalWithdraws,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(
          (type === "deposit" ? totalDeposits : totalWithdraws) / limit,
        ),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
