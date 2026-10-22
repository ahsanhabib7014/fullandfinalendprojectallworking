// app/api/admin/settings/auto-crypto/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import AuditLog from "@/models/AuditLog"; // ✅ অডিট লগ মডেল ইমপোর্ট করা হলো

// ==========================================
// ✅ Helper: Admin verify (Support both admin & sub-admin with role check)
// ==========================================
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "sub-admin"))
      return null;

    return decoded;
  } catch (err) {
    return null;
  }
}

// ==========================================
// ✅ GET: Auto Crypto status (public — user-ও access করবে)
// ==========================================
export async function GET() {
  try {
    await dbConnect();

    const setting = await Setting.findOne({ key: "autoCryptoEnabled" });

    return NextResponse.json({
      success: true,
      enabled: setting ? setting.value === true : true, // ✅ default ON
    });
  } catch (err) {
    console.error("Auto crypto status error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর", enabled: true },
      { status: 500 },
    );
  }
}

// ==========================================
// ✅ POST: Auto Crypto ON/OFF (admin/sub-admin only)
// ==========================================
export async function POST(req) {
  try {
    // ✅ Admin verify
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "অনুমোদিত নয়!" },
        { status: 401 },
      );
    }

    await dbConnect();

    const body = await req.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "enabled (true/false) দিতে হবে!" },
        { status: 400 },
      );
    }

    // আপডেট করার আগের বর্তমান সেটিং বা স্ট্যাটাস ধরে রাখা
    const existingSetting = await Setting.findOne({ key: "autoCryptoEnabled" });
    const oldEnabledStatus = existingSetting
      ? existingSetting.value === true
      : true;

    // ✅ Upsert
    const setting = await Setting.findOneAndUpdate(
      { key: "autoCryptoEnabled" },
      { value: enabled },
      { upsert: true, returnDocument: "after" },
    );

    // ==========================================
    // ✅ অডিট লগ সেভ করা (oldData এবং newData সহ)
    // ==========================================
    if (admin) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: admin.userId || admin.id,
        adminPhone: admin.phone || admin.uid || "Admin",
        action: "TOGGLE_AUTO_CRYPTO",
        targetUser: "SYSTEM_SETTINGS",
        oldData: {
          key: "autoCryptoEnabled",
          enabled: oldEnabledStatus,
        },
        newData: {
          key: "autoCryptoEnabled",
          enabled: setting.value,
        },
        details: `অ্যাডমিন (${admin.phone || admin.uid || "Admin"}) কর্তৃক অটো ক্রিপ্টো স্ট্যাটাস ${oldEnabledStatus ? "চালু" : "বন্ধ"} থেকে পরিবর্তন করে ${setting.value ? "চালু" : "বন্ধ"} করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json({
      success: true,
      enabled: setting.value,
      message: enabled
        ? "✅ Auto Crypto চালু করা হয়েছে!"
        : "🔴 Auto Crypto বন্ধ করা হয়েছে!",
    });
  } catch (err) {
    console.error("Auto crypto update error:", err);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
