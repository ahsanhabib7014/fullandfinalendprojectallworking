import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import GameHistory from "@/models/GameHistory";
import { verifyAuth } from "@/utils/authCheck";

export async function GET() {
  try {
    // ১. ডেটাবেজ কানেকশন নিশ্চিত করা
    await dbConnect();

    // ✅ ২. Auth check — login করা user হলেই access
    const auth = await verifyAuth("user");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, history: [], message: auth.message },
        {
          status: auth.status,
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
          },
        },
      );
    }

    // ৩. সর্বশেষ ১০টি গেম হিস্ট্রি সংগ্রহ করা
    const history = await GameHistory.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    // ৪. সফল রেসপন্স
    return NextResponse.json(
      {
        success: true,
        history: history.map((h) => ({
          periodNumber: h.periodNumber,
          winningNumber: h.winningNumber,
          winningChoice: h.winningChoice,
          status: h.status,
        })),
      },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "সার্ভার এরর হয়েছে।",
        history: [],
      },
      {
        status: 500,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    );
  }
}
