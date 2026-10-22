import dbConnect from "@/utils/db";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    // অথেন্টিকেশন চেক (অ্যাডমিন বা সাব-অ্যাডমিন হতে হবে)
    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    // ডাটাবেজ থেকে যাদের রোল admin বা sub-admin (বা যাদের পারমিশন আছে) তাদের কুয়েরি করা
    const adminStaff = await User.find({
      $or: [
        { role: "admin" },
        { role: "sub-admin" },
        { permissions: { $exists: true, $not: { $size: 0 } } },
      ],
    })
      .select("uid phone role permissions createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        admins: adminStaff,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admins list fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "সার্ভার এরর!" },
      { status: 500 },
    );
  }
}
