import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// ✅ GET — অ্যাডমিনের সেভ করা অ্যাড্রেসগুলো লোড করা
// ==========================================
export async function GET() {
  try {
    await dbConnect();

    // ✅ [পরিবর্তন] এজেন্টরাও এই API কল করতে পারবে
    const auth = await verifyAuth("user");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    // ✅ অ্যাডমিনের প্রোফাইল খুঁজে বের করা
    const admin = await User.findOne({ role: "admin" })
      .select("agentPaymentAccounts")
      .lean();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "অ্যাডমিন পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      addresses: admin.agentPaymentAccounts || [],
    });
  } catch (error) {
    console.error("GET Payment Addresses Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ POST — নতুন অ্যাড্রেস সেভ করা (শুধু অ্যাডমিন)
// ==========================================
export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    const body = await req.json();
    const { method, accountNumber } = body || {};

    if (!method || !accountNumber || !accountNumber.trim()) {
      return NextResponse.json(
        { success: false, message: "মেথড এবং অ্যাড্রেস দুটোই দিতে হবে!" },
        { status: 400 },
      );
    }

    const cleanMethod = String(method).trim();
    const cleanAccountNumber = String(accountNumber).trim();

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "অ্যাডমিন পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const existing = (admin.agentPaymentAccounts || []).find(
      (acc) =>
        acc.method === cleanMethod && acc.accountNumber === cleanAccountNumber,
    );

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "এই অ্যাড্রেসটি ইতিমধ্যে সেভ করা আছে!",
        },
        { status: 400 },
      );
    }

    admin.agentPaymentAccounts = [
      ...(admin.agentPaymentAccounts || []),
      {
        method: cleanMethod,
        accountNumber: cleanAccountNumber,
      },
    ];

    await admin.save();

    return NextResponse.json({
      success: true,
      message: `✅ ${cleanMethod} অ্যাড্রেস সফলভাবে সেভ হয়েছে!`,
      addresses: admin.agentPaymentAccounts,
    });
  } catch (error) {
    console.error("POST Payment Addresses Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ DELETE — অ্যাড্রেস ডিলিট করা (শুধু অ্যাডমিন)
// ==========================================
export async function DELETE(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    const body = await req.json();
    const { accountNumber } = body || {};

    if (!accountNumber) {
      return NextResponse.json(
        { success: false, message: "অ্যাড্রেস আইডি দিতে হবে!" },
        { status: 400 },
      );
    }

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "অ্যাডমিন পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    admin.agentPaymentAccounts = (admin.agentPaymentAccounts || []).filter(
      (acc) => acc.accountNumber !== String(accountNumber).trim(),
    );

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "✅ অ্যাড্রেস ডিলিট হয়েছে!",
    });
  } catch (error) {
    console.error("DELETE Payment Addresses Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
