import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AgentSettings from "@/models/AgentSettings";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — ইউজারের জন্য এজেন্ট নাম্বার লিস্ট
// ==========================================
export async function GET(req) {
  try {
    // ✅ লগইন করা যেকোনো ইউজার দেখতে পারবে
    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    // ✅ শুধু অ্যাক্টিভ, ব্লকড নয়, নাম্বার আছে এমন এজেন্ট
    const agents = await User.find({
      role: "agent",
      agentIsActive: true,
      agentIsBlocked: false,
      agentPhone: { $ne: "" },
    })
      .select("_id agentCode agentPhone agentMainBalance agentPaymentAccounts") // 🆕 agentPaymentAccounts যোগ করা হলো
      .sort({ createdAt: -1 })
      .lean();

    // ✅ গ্লোবাল ডলার রেট (ইউজার ডলারে ডিপোজিট করলে কনভার্ট দেখানোর জন্য)
    const settings = await AgentSettings.getSettings();
    const dollarRate = settings.dollarRate || 0;

    // ✅ ফ্রন্টএন্ডে দরকারি ফিল্ড
    const list = agents.map((a) => ({
      _id: a._id, // 🆕 আইডি যোগ করা হলো
      agentCode: a.agentCode || "",
      agentPhone: a.agentPhone,
      agentBalance: a.agentMainBalance || 0, // টাকায়
      paymentAccounts: a.agentPaymentAccounts || [], // 🆕 মাল্টিপল নাম্বার/অ্যাড্রেস
    }));

    return NextResponse.json({
      success: true,
      agents: list,
      dollarRate, // ইউজার ডলারে দিলে ফ্রন্টএন্ডে কনভার্ট দেখানোর জন্য
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
