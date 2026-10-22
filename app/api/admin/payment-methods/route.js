import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import PaymentMethod from "@/models/PaymentMethod";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

// GET: পেমেন্ট মেথডগুলো ফেচ করা (রোলভিত্তিক নিরাপদ ফিল্টারিং)
export async function GET(req) {
  try {
    await dbConnect();

    // অ্যাডমিন বা সাব-অ্যাডমিনের অথেন্টিকেশন চেক করা
    const auth = await verifyAuth("admin");

    let methods;

    // যদি সফলভাবে অ্যাডমিন বা সাব-অ্যাডমিন ভেরিফাই হয়
    if (auth.success && auth.user) {
      const userRole = auth.user.role;

      // সুনির্দিষ্টভাবে রোল চেক (সুপার অ্যাডমিন অথবা সাব-অ্যাডমিন)
      if (userRole === "admin" || userRole === "sub-admin") {
        // এরা প্যানেল থেকে সব মেথড (Active এবং Inactive উভয়ই) দেখতে পাবে
        methods = await PaymentMethod.find({}).sort({ createdAt: -1 });
      } else {
        // অন্য কেউ হলে শুধু সচল মেথড দেখবে
        methods = await PaymentMethod.find({ isActive: true }).sort({
          createdAt: -1,
        });
      }
    } else {
      // সাধারণ ইউজার বা লগইন ছাড়া ভিজিটর হলে শুধুমাত্র সচল (Active) মেথডগুলো পাবে
      methods = await PaymentMethod.find({ isActive: true }).sort({
        createdAt: -1,
      });
    }

    return NextResponse.json(
      {
        success: true,
        methods: Array.isArray(methods) ? methods : [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get Payment Methods Error:", error);
    return NextResponse.json(
      { success: false, methods: [], message: "সার্ভার ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}

// POST: নতুন পেমেন্ট মেথড যোগ করা
export async function POST(req) {
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
    const body = await req.json();
    const { methodName } = body;

    if (!methodName || !methodName.trim()) {
      return NextResponse.json(
        { success: false, message: "মেথডের নাম আবশ্যক!" },
        { status: 400 },
      );
    }

    const cleanName = methodName.trim();

    const existing = await PaymentMethod.findOne({
      methodName: new RegExp(`^${cleanName}$`, "i"),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "এই নামের পেমেন্ট মেথড ইতিমধ্যে রয়েছে!" },
        { status: 400 },
      );
    }

    const newMethod = await PaymentMethod.create({
      methodName: cleanName,
      isActive: true,
    });

    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "CREATE_PAYMENT_METHOD",
        targetUser: "PAYMENT_METHOD",
        oldData: {},
        newData: { methodName: cleanName },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক নতুন পেমেন্ট মেথড (${cleanName}) যুক্ত করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "পেমেন্ট মেথড সফলভাবে যোগ করা হয়েছে!",
        method: newMethod,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}

// PUT: স্ট্যাটাস অন/অফ করা
export async function PUT(req) {
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
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "আইডি পাওয়া যায়নি!" },
        { status: 400 },
      );
    }

    const existing = await PaymentMethod.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট মেথড পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { isActive },
      { returnDocument: "after" },
    );

    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "UPDATE_PAYMENT_METHOD",
        targetUser: "PAYMENT_METHOD",
        oldData: { id: existing._id, isActive: existing.isActive },
        newData: { id: updatedMethod._id, isActive: updatedMethod.isActive },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক পেমেন্ট মেথড (${updatedMethod.methodName}) স্ট্যাটাস ${isActive ? "চালু" : "বন্ধ"} করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `মেথডটি সফলভাবে ${isActive ? "চালু" : "বন্ধ"} করা হয়েছে!`,
        method: updatedMethod,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}

// DELETE: ডিলিট করা
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "আইডি প্রয়োজন!" },
        { status: 400 },
      );
    }

    const deleted = await PaymentMethod.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট মেথড পাওয়া যায়নি!" },
        { status: 404 },
      );
    }

    if (adminUser) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: "DELETE_PAYMENT_METHOD",
        targetUser: "PAYMENT_METHOD",
        oldData: { id: deleted._id, methodName: deleted.methodName },
        newData: { status: "deleted" },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক পেমেন্ট মেথড (${deleted.methodName}) ডিলিট করা হয়েছে।`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "পেমেন্ট মেথড সফলভাবে ডিলিট করা হয়েছে!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি ঘটেছে!" },
      { status: 500 },
    );
  }
}
