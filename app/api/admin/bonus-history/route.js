import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import BonusRunLog from "@/models/BonusRunLog";
import { verifyAuth } from "@/utils/authCheck";

export async function GET(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const periodKey = searchParams.get("periodKey");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query = {};
    if (type && type !== "all") query.type = type;
    if (periodKey) query.periodKey = periodKey;

    const total = await BonusRunLog.countDocuments(query);

    const logs = await BonusRunLog.find(query)
      .sort({ runAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("runBy", "uid phone")
      .lean();

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Bonus History Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
