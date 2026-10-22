import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import AgentDollarRequest from "@/models/AgentDollarRequest"; // ✅ আপনার কালেকশনের নাম অনুযায়ী মডেল
import { verifyAuth } from "@/utils/authCheck";

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ ১. এজেন্ট লগইন চেক
    const auth = await verifyAuth("user");
    if (!auth.success || auth.user.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "আপনি এজেন্ট নন!" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { transactionId } = body || {};

    // ✅ ২. ভ্যালিডেশন (খুব ছোট হলে চেক করবে না)
    if (!transactionId || transactionId.trim().length < 5) {
      return NextResponse.json(
        { exists: false, message: "ট্রানজেকশন আইডি খুব ছোট!" },
        { status: 200 },
      );
    }

    const cleanTrxId = transactionId.trim().toUpperCase();

    // ✅ ৩. এজেন্ট ডলার রিকোয়েস্ট কালেকশনে চেক করা
    const existingRequest = await AgentDollarRequest.findOne({
      transactionId: cleanTrxId,
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          exists: true,
          message: "এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহার করা হয়েছে!",
        },
        { status: 200 },
      );
    }

    // ✅ ৪. যদি আগে থেকে না থাকে
    return NextResponse.json({ exists: false }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
