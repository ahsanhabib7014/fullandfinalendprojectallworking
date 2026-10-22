import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Withdraw from "@/models/Withdraw";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — এজেন্টের সাথে সম্পর্কিত উইথড্র লিস্ট
// ==========================================
export async function GET(req) {
  try {
    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    // ✅ এজেন্ট কিনা চেক
    const agent = await User.findById(auth.user._id)
      .select("role agentIsBlocked")
      .lean();

    if (!agent || agent.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "আপনি এজেন্ট নন।" },
        { status: 403 },
      );
    }

    if (agent.agentIsBlocked) {
      return NextResponse.json(
        { success: false, message: "আপনার এজেন্ট অ্যাকাউন্ট ব্লক করা হয়েছে।" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter = { agentId: auth.user._id };
    if (status && status !== "all") {
      filter.status = status;
    }

    const total = await Withdraw.countDocuments(filter);

    const withdraws = await Withdraw.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ✅ সামারি — মোট কমিশন (শুধু paid)
    const summaryAgg = await Withdraw.aggregate([
      { $match: { agentId: auth.user._id, agentCommissionPaid: true } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$agentCommission" },
          totalApprovedAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = summaryAgg[0] || {
      totalCommission: 0,
      totalApprovedAmount: 0,
      count: 0,
    };

    return NextResponse.json({
      success: true,
      withdraws,
      summary: {
        totalCommission: summary.totalCommission,
        totalApprovedAmount: summary.totalApprovedAmount,
        approvedCount: summary.count,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
////////////////////////////////////////////////
