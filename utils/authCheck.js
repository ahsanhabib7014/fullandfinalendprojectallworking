// ////////////////////////////////////////////////////////////////////
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { cookies } from "next/headers";

// ==========================================
// ১. পুরনো ফাংশনসমূহ (backward compatibility)
// ==========================================

export function verifyJwtToken(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        message: "অনুমোদিত নয়! টোকেন পাওয়া যায়নি।",
      };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    return {
      success: true,
      userId: decoded.userId,
      uid: decoded.uid,
      phone: decoded.phone,
    };
  } catch (error) {
    return {
      success: false,
      message: "টোকেন মেয়াদোত্তীর্ণ বা অবৈধ।",
    };
  }
}

export async function verifyActiveUser(userIdOrUid) {
  try {
    await dbConnect();

    const query = userIdOrUid?.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: userIdOrUid }
      : { uid: userIdOrUid };

    const user = await User.findOne(query);

    if (!user) {
      return { success: false, message: "ইউজার পাওয়া যায়নি।" };
    }

    if (user.isBlocked) {
      return {
        success: false,
        isBlocked: true,
        message: "আপনার অ্যাকাউন্টটি ব্লক থাকায় এই সেবাটি বন্ধ রয়েছে।",
      };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, message: "সার্ভার এরর: " + error.message };
  }
}

// ==========================================
// ২. HttpOnly কুকি ভিত্তিক অথ ও পারমিশন হেল্পার (Secure, RBAC & Auto Audit Log)
// ==========================================

export async function verifyAuth(
  requiredRole = "user",
  requiredPermission = null,
  req = null,
  customAction = null,
) {
  try {
    await dbConnect();
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        status: 401,
        message: "অনুমোদিত নয়! কোনো বৈধ সেশন কুকি পাওয়া যায়নি।",
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch (err) {
      return {
        success: false,
        status: 401,
        message: "মেয়াদোত্তীর্ণ বা অবৈধ সেশন টোকেন!",
      };
    }

    const userId = decoded.userId || decoded.id;
    const userUid = decoded.uid;
    const userPhone = decoded.phone;

    const conditions = [];
    if (userId) conditions.push({ _id: userId });
    if (userUid) conditions.push({ uid: userUid });
    if (userPhone) conditions.push({ phone: userPhone });

    if (conditions.length === 0) {
      return {
        success: false,
        status: 401,
        message: "টোকেনে কোনো বৈধ ইউজার আইডি নেই!",
      };
    }

    const dbUser = await User.findOne({ $or: conditions }).lean();

    if (!dbUser) {
      return {
        success: false,
        status: 401,
        message: "ইউজার ডাটাবেজে খুঁজে পাওয়া যায়নি।",
      };
    }

    // 🛑 কঠোর ব্লক চেক: ইউজার বা সাব-অ্যাডমিন ব্লক থাকলে 403 স্ট্যাটাস ও isBlocked: true রিটার্ন করবে
    if (dbUser.isBlocked === true) {
      return {
        success: false,
        status: 403,
        isBlocked: true, // ✅ ফ্রন্টএন্ড বা এপিআই হ্যান্ডলারের জন্য জরুরি
        message: "আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।",
      };
    }

    // 🌟 ৩. রোল ও পারমিশন লজিক (Role & Permission Check)
    if (requiredRole === "admin") {
      if (dbUser.role === "admin") {
        await handleAutoAuditLog(req, dbUser, customAction);
        return { success: true, user: dbUser };
      }

      if (dbUser.role === "sub-admin") {
        if (requiredPermission) {
          if (
            dbUser.permissions &&
            dbUser.permissions.includes(requiredPermission)
          ) {
            await handleAutoAuditLog(req, dbUser, customAction);
            return { success: true, user: dbUser };
          } else {
            return {
              success: false,
              status: 403,
              message: "অ্যাক্সেস ডিনাইড! এই সেকশনটি দেখার আপনার অনুমতি নেই।",
            };
          }
        }
        await handleAutoAuditLog(req, dbUser, customAction);
        return { success: true, user: dbUser };
      }

      return {
        success: false,
        status: 403,
        message: "প্রবেশাধিকার নিষিদ্ধ! আপনার অ্যাডমিন পারমিশন নেই।",
      };
    }

    return { success: true, user: dbUser };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      success: false,
      status: 401,
      message: "মেয়াদোত্তীর্ণ বা অবৈধ সেশন টোকেন!",
    };
  }
}

// 🌟 ৪. হেল্পার ফাংশন: সাব-অ্যাডমিনের অ্যাকশন অটো-লগ করার জন্য
async function handleAutoAuditLog(req, dbUser, customAction) {
  try {
    if (!req) return;
    const method = req.method || "UNKNOWN";

    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";
      const pathname = req.nextUrl ? req.nextUrl.pathname : "API_ACTION";

      await AuditLog.create({
        adminId: dbUser._id,
        adminPhone: dbUser.phone || dbUser.uid || "Admin",
        action: customAction || `${method}_${pathname}`,
        targetUser: "N/A",
        details: `${dbUser.role === "sub-admin" ? "সাব-অ্যাডমিন" : "অ্যাডমিন"} (${dbUser.phone}) কর্তৃক ${pathname} এ রিকোয়েস্ট সম্পন্ন হয়েছে।`,
        ipAddress: ip,
      });
    }
  } catch (logErr) {
    console.error("Auto audit log error:", logErr);
  }
}
