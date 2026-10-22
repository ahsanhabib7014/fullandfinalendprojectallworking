import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog"; // ✅ অডিট লগ মডেল ইমপোর্ট করা হলো

// অ্যাডমিন প্যানেলের ডেটা ফেচ করা (ইউজার লিস্ট ও ট্রানজেকশন রিকোয়েস্ট)
export async function GET(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 15]
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

    const users = await User.find({}).select("-password");
    const transactions = await Transaction.find({ status: "pending" });

    return NextResponse.json(
      { success: true, users, transactions },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin Panel GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// অ্যাডমিন অ্যাকশন হ্যান্ডেল করা (ব্যালেন্স আপডেট বা ট্রানজেকশন অ্যাপ্রুভ/রিজেক্ট)[cite: 15]
export async function POST(req) {
  try {
    await dbConnect();

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 15]
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

    const adminUser = auth.user; // ✅ অ্যাডমিন বা সাব-অ্যাডমিন ইউজার অবজেক্ট

    const { action, targetUid, amount, txId, status } = await req.json();

    // ==========================================
    // ✅✅✅ ঠিক করা হলো: atomic balance update[cite: 15]
    // ==========================================
    if (action === "updateBalance") {
      const parsedAmount = Number(amount);

      // ✅ Input validation[cite: 15]
      if (!targetUid || isNaN(parsedAmount) || parsedAmount === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "ইউজার আইডি বা সঠিক পরিমাণ প্রদান করুন!",
          },
          { status: 400 },
        );
      }

      // আপডেট করার আগে ইউজারের আগের ব্যালেন্স বা ডেটা ধরে রাখা
      const existingUser = await User.findOne({ uid: targetUid });
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "ইউজার পাওয়া যায়নি",
          },
          { status: 404 },
        );
      }

      const oldBalance = Number(existingUser.balance) || 0;

      // ✅ findOneAndUpdate + $inc = atomic operation[cite: 15]
      const updatedUser = await User.findOneAndUpdate(
        { uid: targetUid },
        { $inc: { balance: parsedAmount } },
        { returnDocument: "after" },
      );

      const newBalance = Number(updatedUser.balance) || 0;

      // ==========================================
      // ✅ অডিট লগ সেভ করা (Balance Update - oldData ও newData সহ)
      // ==========================================
      if (adminUser) {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        await AuditLog.create({
          adminId: adminUser._id,
          adminPhone: adminUser.phone || adminUser.uid,
          action: "MANUAL_BALANCE_UPDATE",
          targetUser: targetUid,
          oldData: {
            uid: targetUid,
            balance: oldBalance,
          },
          newData: {
            uid: targetUid,
            balance: newBalance,
            changeAmount: parsedAmount,
          },
          details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ইউজার (${targetUid}) এর ব্যালেন্স ম্যানুয়ালি ৳${oldBalance} থেকে পরিবর্তন করে ৳${newBalance} করা হয়েছে।`,
          ipAddress: ip,
        });
      }

      // ✅ Response format আগের মতোই[cite: 15]
      return NextResponse.json(
        {
          success: true,
          message: "ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!",
        },
        { status: 200 },
      );
    }
    // ==========================================

    // ৪. ডিপোজিট বা উইথড্র রিকোয়েস্ট অ্যাপ্রুভ/রিজেক্ট করা[cite: 15]
    if (action === "handleTransaction") {
      const tx = await Transaction.findById(txId);
      if (!tx) {
        return NextResponse.json(
          { success: false, message: "ট্রানজেকশন পাওয়া যায়নি" },
          { status: 404 },
        );
      }

      const oldTxStatus = tx.status;

      tx.status = status;
      await tx.save();

      // যদি ডিপোজিট অ্যাপ্রুভ হয়, তবে ইউজারের ব্যালেন্স বাড়িয়ে দেওয়া[cite: 15]
      if (
        String(status).toLowerCase() === "approved" &&
        String(tx.type).toLowerCase() === "deposit"
      ) {
        const user = await User.findOne({ uid: tx.uid });
        if (user) {
          user.balance = (Number(user.balance) || 0) + Number(tx.amount);
          await user.save();
        }
      }

      // ==========================================
      // ✅ অডিট লগ সেভ করা (Handle Transaction - oldData ও newData সহ)
      // ==========================================
      if (adminUser) {
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        await AuditLog.create({
          adminId: adminUser._id,
          adminPhone: adminUser.phone || adminUser.uid,
          action: "HANDLE_ADMIN_TRANSACTION",
          targetUser: tx.uid,
          oldData: {
            transactionId: tx._id,
            type: tx.type,
            amount: tx.amount,
            status: oldTxStatus,
          },
          newData: {
            transactionId: tx._id,
            type: tx.type,
            amount: tx.amount,
            status: status,
          },
          details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ${tx.amount} টাকার ট্রানজেকশন রিকোয়েস্ট স্ট্যাটাস '${oldTxStatus}' থেকে পরিবর্তন করে '${status}' করা হয়েছে।`,
          ipAddress: ip,
        });
      }

      return NextResponse.json(
        { success: true, message: `ট্রানজেকশন ${status} করা হয়েছে!` },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: "সঠিক অ্যাকশন নির্বাচন করা হয়নি" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Admin Panel POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Error processing admin action" },
      { status: 500 },
    );
  }
}
