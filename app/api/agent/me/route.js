import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AgentSettings from "@/models/AgentSettings";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — এজেন্ট নিজের তথ্য দেখবে
// ==========================================
export async function GET(req) {
  try {
    // ✅ লগইন চেক (যেকোনো ভ্যালিড ইউজার)
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
      .select(
        "uid phone role agentCode agentPhone agentCryptoAddress agentMainBalance agentCommissionBalance agentDepositCommission agentWithdrawCommission agentIsActive agentIsBlocked",
      )
      .lean();

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (agent.role !== "agent") {
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

    // ✅ গ্লোবাল ডলার রেট (কমিশন ট্রান্সফার/লোড রিকোয়েস্টে লাগবে)
    const settings = await AgentSettings.getSettings();

    return NextResponse.json({
      success: true,
      agent: {
        uid: agent.uid,
        phone: agent.phone,
        agentCode: agent.agentCode || "",
        agentPhone: agent.agentPhone || "",
        agentCryptoAddress: agent.agentCryptoAddress || "",
        agentMainBalance: agent.agentMainBalance || 0,
        agentCommissionBalance: agent.agentCommissionBalance || 0,
        agentDepositCommission: agent.agentDepositCommission || 0,
        agentWithdrawCommission: agent.agentWithdrawCommission || 0,
        agentIsActive: agent.agentIsActive,
        agentIsBlocked: agent.agentIsBlocked,
      },
      dollarRate: settings.dollarRate || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
