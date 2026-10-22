import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog"; // ✅ অডিট লগ মডেল ইমপোর্ট করা হলো

// GET: সমস্ত ইউজার বা নির্দিষ্ট ইউজার খোঁজার জন্য (শুধুমাত্র অ্যাডমিন)
export async function GET(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
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

    const adminUser = auth.user;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query = {
        $or: [
          { phone: { $regex: search, $options: "i" } },
          { uid: { $regex: search, $options: "i" } },
          { ipAddress: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Admin Users GET Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}

// PATCH: ইউজারের তথ্য (ব্যালেন্স, টার্নওভার, ব্লক স্ট্যাটাস, কমিশন ইত্যাদি) আপডেট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function PATCH(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const adminUser = auth.user;

    const {
      userId,
      balance,
      turnover,
      isBlocked,
      ipAddress,
      customCommission,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    // ✅ ১. আপডেট করার ঠিক পূর্বে ইউজারের পুরনো তথ্য ডাটাবেজ থেকে নিয়ে নেওয়া (Old Data)
    const oldUser = await User.findOne({ uid: userId });
    if (!oldUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    const updateData = {};
    if (balance !== undefined) updateData.balance = Number(balance);
    if (turnover !== undefined) updateData.turnover = Number(turnover);
    if (isBlocked !== undefined) updateData.isBlocked = Boolean(isBlocked);
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;

    if (customCommission !== undefined) {
      updateData.customCommission =
        customCommission === "" || customCommission === null
          ? null
          : Number(customCommission);
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: userId },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    // ==========================================
    // ✅ ২. অডিট লগে oldData এবং newData সহ সেভ করা
    // ==========================================
    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_USER_PROFILE",
        targetUser: userId,
        // 🔽 পরিবর্তনের আগের মানগুলো
        oldData: {
          balance: oldUser.balance,
          turnover: oldUser.turnover,
          isBlocked: oldUser.isBlocked,
          customCommission: oldUser.customCommission,
        },
        // 🔽 পরিবর্তনের পরের নতুন মানগুলো
        newData: {
          balance: updatedUser.balance,
          turnover: updatedUser.turnover,
          isBlocked: updatedUser.isBlocked,
          customCommission: updatedUser.customCommission,
        },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${userId}) এর তথ্য আপডেট করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "ইউজার সফলভাবে আপডেট করা হয়েছে!",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin User Update Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}

// DELETE: ইউজার ডিলিট করার জন্য (শুধুমাত্র অ্যাডমিন)
export async function DELETE(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const adminUser = auth.user;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    const deletedUser = await User.findOneAndDelete({ uid: userId });
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    // ==========================================
    // ✅ অডিট লগ সেভ করা (DELETE)
    // ==========================================
    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "DELETE_USER",
        targetUser: userId,
        oldData: { userId, phone: deletedUser.phone },
        newData: null,
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${userId}) ডিলিট করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      { success: true, message: "ইউজার সফলভাবে ডিলিট করা হয়েছে!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin User Delete Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}
