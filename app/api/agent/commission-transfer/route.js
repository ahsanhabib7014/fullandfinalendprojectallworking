import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog"; // 🆕 অডিট লগ ইমপোর্ট
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — কমিশন ট্রান্সফারের হিস্ট্রি
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
      .select("role agentIsBlocked agentMainBalance agentCommissionBalance")
      .lean();

    if (!agent || agent.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "আপনি এজেন্ট নন।" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter = {
      agentId: auth.user._id,
      type: "AGENT_COMMISSION_TRANSFER",
    };

    const total = await Transaction.countDocuments(filter);

    const history = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      balances: {
        agentMainBalance: agent.agentMainBalance || 0,
        agentCommissionBalance: agent.agentCommissionBalance || 0,
      },
      history,
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
// POST — কমিশন → মূল ব্যালেন্সে ট্রান্সফার
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

    const body = await req.json();
    const { amount } = body;

    // ✅ ভ্যালিডেশন
    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক পরিমাণ দিন।" },
        { status: 400 },
      );
    }

    const session = await mongoose.startSession();
    let result = null;

    try {
      await session.withTransaction(async () => {
        const agent = await User.findById(auth.user._id).session(session);

        if (!agent || agent.role !== "agent") {
          throw new Error("আপনি এজেন্ট নন।");
        }
        if (agent.agentIsBlocked) {
          throw new Error("আপনার এজেন্ট অ্যাকাউন্ট ব্লক করা হয়েছে।");
        }
        if (!agent.agentIsActive) {
          throw new Error("আপনার এজেন্ট অ্যাকাউন্ট এখনো অ্যাক্টিভ হয়নি।");
        }

        const commissionBalance = agent.agentCommissionBalance || 0;

        if (commissionBalance < transferAmount) {
          throw new Error(
            `অপর্যাপ্ত কমিশন ব্যালেন্স। আপনার কমিশন ব্যালেন্স: ৳${commissionBalance.toFixed(2)}`,
          );
        }

        // ১. কমিশন থেকে কাটা, মূল ব্যালেন্সে যোগ
        agent.agentCommissionBalance = commissionBalance - transferAmount;
        agent.agentMainBalance = (agent.agentMainBalance || 0) + transferAmount;
        await agent.save({ session });

        // ২. Transaction এন্ট্রি
        const [tx] = await Transaction.create(
          [
            {
              userId: agent._id,
              agentId: agent._id,
              type: "AGENT_COMMISSION_TRANSFER",
              method: "COMMISSION_TRANSFER",
              phone: agent.agentPhone || agent.phone || "",
              amount: transferAmount,
              trxId: "",
              status: "ACCEPTED",
              comment: `কমিশন ব্যালেন্স → মূল ব্যালেন্স ট্রান্সফার (৳${transferAmount.toFixed(2)})`,
            },
          ],
          { session },
        );

        result = {
          transferAmount,
          newMainBalance: agent.agentMainBalance,
          newCommissionBalance: agent.agentCommissionBalance,
          transactionId: tx._id,
        };
      });

      // 🆕 ৩. Audit Log তৈরি (ট্রানজেকশন সফল হওয়ার পর)
      try {
        await AuditLog.create({
          adminId: auth.user._id, // এজেন্টের আইডি
          adminPhone: auth.user.phone || auth.user.uid,
          action: "AGENT_COMMISSION_TRANSFER",
          targetUser: auth.user.uid,
          oldData: {
            mainBalance: result.newMainBalance - transferAmount,
            commissionBalance: result.newCommissionBalance + transferAmount,
          },
          newData: {
            mainBalance: result.newMainBalance,
            commissionBalance: result.newCommissionBalance,
          },
          details: `এজেন্ট (${auth.user.phone || auth.user.uid}) ৳${transferAmount.toFixed(2)} কমিশন থেকে মূল ব্যালেন্সে ট্রান্সফার করেছেন।`,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      } catch (auditErr) {
        console.error("Audit log error:", auditErr);
        // অডিট লগ ফেইল করলেও ইউজারের ট্রান্সফার বাতিল হবে না
      }
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 },
      );
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      message: `৳${transferAmount.toFixed(2)} কমিশন থেকে মূল ব্যালেন্সে ট্রান্সফার হয়েছে।`,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
