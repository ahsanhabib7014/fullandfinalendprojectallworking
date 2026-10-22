import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog"; // ✅ অডিট লগ মডেল ইমপোর্ট করা হলো

export async function POST(request) {
  try {
    // ১. ডাটাবেজ কানেকশন পদ্ধতি[cite: 12]
    await clientPromise;

    // ২. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 12]
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        { status: auth.status },
      );
    }

    const adminUser = auth.user; //[cite: 12]

    const body = await request.json();

    const uid = typeof body.uid === "string" ? body.uid.trim() : "";
    const parsedRate = Number(body.commissionRate);

    if (!uid || body.commissionRate === undefined) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি এবং কমিশন রেট আবশ্যক।" },
        { status: 400 },
      );
    }

    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "সঠিক কমিশন রেট (০ থেকে ১০০ এর মধ্যে) প্রদান করুন।",
        },
        { status: 400 },
      );
    }

    // ৩. আপডেট করার আগে ইউজারের আগের কাস্টম কমিশন রেট ধরে রাখা
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি।" },
        { status: 404 },
      );
    }
    const oldCommission =
      existingUser.customCommission !== undefined
        ? existingUser.customCommission
        : 0;

    // ৪. ইউজারের customCommission আপডেট করা[cite: 12]
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { customCommission: parsedRate },
      { returnDocument: "after" },
    );

    // ==========================================
    // ✅ সকল অ্যাডমিন ও সাব-অ্যাডমিন অ্যাকশনের অডিট লগ সেভ করা
    // ==========================================
    if (adminUser) {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_USER_COMMISSION",
        targetUser: uid,
        oldData: {
          uid: uid,
          customCommission: oldCommission,
        },
        newData: {
          uid: uid,
          customCommission: parsedRate,
        },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${uid}) এর কাস্টম কমিশন রেট ${oldCommission}% থেকে পরিবর্তন করে ${parsedRate}% করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "ইউজারের রেফারেল কমিশন সফলভাবে আপডেট করা হয়েছে!",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Commission Update Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
