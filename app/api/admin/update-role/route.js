import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const { targetUid, newRole } = await request.json();
    if (!targetUid) {
      return NextResponse.json(
        { success: false, message: "ইউজার আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    // ইউজার খুঁজে রোল 'user' করা এবং পারমিশন ক্লিয়ার বা ফাঁকা করে দেওয়া
    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ uid: targetUid }, { phone: targetUid }] },
      {
        $set: { role: newRole || "user" },
        $unset: { permissions: "" }, // পারমিশন ফিল্ড রিমুভ করে সাধারণ ইউজার করা
      },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "টার্গেট ইউজার পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "সফলভাবে সাধারণ ইউজার করা হয়েছে!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}
