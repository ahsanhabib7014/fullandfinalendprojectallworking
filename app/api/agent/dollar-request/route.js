import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AgentDollarRequest from "@/models/AgentDollarRequest";
import AgentSettings from "@/models/AgentSettings";
import AuditLog from "@/models/AuditLog"; // 🆕 অডিট লগ ইমপোর্ট
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — এজেন্টের নিজের রিকোয়েস্ট লিস্ট
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

    const total = await AgentDollarRequest.countDocuments(filter);

    const requests = await AgentDollarRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      requests,
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

// ==========================================
// POST — নতুন ডলার লোড রিকোয়েস্ট (ডলারে ইনপুট)
// ==========================================
export async function POST(req) {
  try {
    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    // ✅ এজেন্ট চেক
    const agent = await User.findById(auth.user._id)
      .select("role agentIsBlocked agentIsActive")
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

    if (!agent.agentIsActive) {
      return NextResponse.json(
        {
          success: false,
          message: "আপনার এজেন্ট অ্যাকাউন্ট এখনো অ্যাক্টিভ হয়নি।",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      amountUSD, // 🆕 এজেন্ট ডলারে ইনপুট দেবে
      paymentMethod,
      senderNumber,
      transactionId,
      screenshot,
    } = body;

    // ✅ ভ্যালিডেশন
    const usdAmount = Number(amountUSD);
    if (!usdAmount || usdAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক ডলার পরিমাণ দিন।" },
        { status: 400 },
      );
    }

    // ✅ ডলার রেট
    const settings = await AgentSettings.getSettings();
    if (!settings.dollarRate || settings.dollarRate <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ডলার রেট এখনো সেট হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।",
        },
        { status: 400 },
      );
    }

    // ✅ ডলার → টাকা কনভার্ট
    const amountBDT = usdAmount * settings.dollarRate;

    // ✅ রিকোয়েস্ট তৈরি
    const dollarRequest = await AgentDollarRequest.create({
      agentId: auth.user._id,
      amountUSD: usdAmount,
      dollarRate: settings.dollarRate,
      amountBDT,
      paymentMethod: paymentMethod || "",
      senderNumber: senderNumber || "",
      transactionId: transactionId || "",
      screenshot: screenshot || "",
      status: "pending",
    });

    // 🆕 অডিট লগ তৈরি
    try {
      await AuditLog.create({
        adminId: auth.user._id, // এজেন্টের আইডি
        adminPhone: auth.user.phone || auth.user.uid,
        action: "AGENT_DOLLAR_REQUEST",
        targetUser: auth.user.uid,
        details: `এজেন্ট (${auth.user.phone || auth.user.uid}) $${usdAmount.toFixed(2)} ডলার লোডের রিকোয়েস্ট দিয়েছেন। (রেট: ৳${settings.dollarRate})।`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
      // অডিট লগ ফেইল করলেও রিকোয়েস্ট বাতিল হবে না
    }

    return NextResponse.json({
      success: true,
      message: `রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে ৳${amountBDT.toFixed(2)} ($${usdAmount.toFixed(2)} × ৳${settings.dollarRate}) এজেন্টের মূল ব্যালেন্সে যোগ হবে।`,
      request: {
        _id: dollarRequest._id,
        amountUSD: dollarRequest.amountUSD,
        dollarRate: dollarRequest.dollarRate,
        amountBDT: dollarRequest.amountBDT,
        status: dollarRequest.status,
        createdAt: dollarRequest.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
