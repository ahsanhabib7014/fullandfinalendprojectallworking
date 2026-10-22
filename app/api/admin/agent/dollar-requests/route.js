// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import dbConnect from "@/utils/db";
// import User from "@/models/User";
// import AgentDollarRequest from "@/models/AgentDollarRequest";
// import Transaction from "@/models/Transaction";
// import AuditLog from "@/models/AuditLog"; // 🆕 অডিট লগ ইমপোর্ট
// import { verifyAuth } from "@/utils/authCheck";

// // ==========================================
// // GET — ডলার লোড রিকোয়েস্টের লিস্ট
// // ==========================================
// export async function GET(req) {
//   try {
//     const auth = await verifyAuth("admin", "agent-requests", req);
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status || 401 },
//       );
//     }

//     await dbConnect();

//     const { searchParams } = new URL(req.url);
//     const status = searchParams.get("status");
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const limit = parseInt(searchParams.get("limit") || "20", 10);

//     const filter = {};
//     if (status && status !== "all") {
//       filter.status = status;
//     }

//     const total = await AgentDollarRequest.countDocuments(filter);

//     const requests = await AgentDollarRequest.find(filter)
//       .populate("agentId", "uid phone agentCode agentPhone agentMainBalance")
//       .populate("reviewedBy", "uid phone")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     return NextResponse.json({
//       success: true,
//       requests,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর: " + error.message },
//       { status: 500 },
//     );
//   }
// }

// // ==========================================
// // PATCH — রিকোয়েস্ট অ্যাপ্রুভ / রিজেক্ট
// // ==========================================
// export async function PATCH(req) {
//   try {
//     const auth = await verifyAuth(
//       "admin",
//       "agent-requests",
//       req,
//       "AGENT_DOLLAR_REQUEST_REVIEW",
//     );
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status || 401 },
//       );
//     }

//     await dbConnect();
//     const body = await req.json();
//     const { requestId, action, adminNote } = body;

//     if (!requestId || !["approve", "reject"].includes(action)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "requestId এবং action ('approve'/'reject') প্রয়োজন।",
//         },
//         { status: 400 },
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(requestId)) {
//       return NextResponse.json(
//         { success: false, message: "অবৈধ requestId।" },
//         { status: 400 },
//       );
//     }

//     const request = await AgentDollarRequest.findById(requestId);
//     if (!request) {
//       return NextResponse.json(
//         { success: false, message: "রিকোয়েস্ট পাওয়া যায়নি।" },
//         { status: 404 },
//       );
//     }

//     // ✅ ডাবল রিভিউ প্রতিরোধ
//     if (request.status !== "pending") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `এই রিকোয়েস্ট ইতিমধ্যে ${request.status} হয়েছে।`,
//         },
//         { status: 400 },
//       );
//     }

//     // ==========================================
//     // ✅ রিজেক্ট
//     // ==========================================
//     if (action === "reject") {
//       request.status = "rejected";
//       request.adminNote = adminNote || "";
//       request.reviewedBy = auth.user._id;
//       request.reviewedAt = new Date();
//       await request.save();

//       // 🆕 অডিট লগ তৈরি (রিজেক্টের জন্য)
//       try {
//         await AuditLog.create({
//           adminId: auth.user._id,
//           adminPhone: auth.user.phone || auth.user.uid,
//           action: "AGENT_DOLLAR_REQUEST_REJECT",
//           targetUser: request.agentId.toString(),
//           details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক $${request.amountUSD} (৳${request.amountBDT}) ডলার লোড রিকোয়েস্ট রিজেক্ট করা হয়েছে।`,
//           ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
//         });
//       } catch (auditErr) {
//         console.error("Audit log error:", auditErr);
//       }

//       return NextResponse.json({
//         success: true,
//         message: "রিকোয়েস্ট রিজেক্ট করা হয়েছে।",
//       });
//     }

//     // ==========================================
//     // ✅ অ্যাপ্রুভ — ট্রানজেকশন দিয়ে
//     // ==========================================
//     const agent = await User.findById(request.agentId);
//     if (!agent) {
//       return NextResponse.json(
//         { success: false, message: "এজেন্ট পাওয়া যায়নি।" },
//         { status: 404 },
//       );
//     }

//     if (agent.role !== "agent") {
//       return NextResponse.json(
//         { success: false, message: "এই ইউজার আর এজেন্ট নয়।" },
//         { status: 400 },
//       );
//     }

//     if (agent.agentIsBlocked) {
//       return NextResponse.json(
//         { success: false, message: "এজেন্ট ব্লকড, অ্যাপ্রুভ করা যাবে না।" },
//         { status: 400 },
//       );
//     }

//     const session = await mongoose.startSession();
//     try {
//       await session.withTransaction(async () => {
//         // ১. এজেন্টের মূল ব্যালেন্সে টাকা যোগ (amountBDT)
//         agent.agentMainBalance =
//           (agent.agentMainBalance || 0) + request.amountBDT;
//         await agent.save({ session });

//         // ২. রিকোয়েস্ট আপডেট
//         request.status = "approved";
//         request.adminNote = adminNote || "";
//         request.reviewedBy = auth.user._id;
//         request.reviewedAt = new Date();
//         await request.save({ session });

//         // ৩. ট্রানজেকশন এন্ট্রি (amount = টাকায়)
//         await Transaction.create(
//           [
//             {
//               userId: agent._id,
//               agentId: agent._id,
//               type: "AGENT_LOAD",
//               method: request.paymentMethod || "AGENT_LOAD",
//               phone: agent.agentPhone || agent.phone || "",
//               amount: request.amountBDT,
//               trxId: request.transactionId || "",
//               status: "ACCEPTED",
//               comment: `ডলার লোড ($${request.amountUSD} × ৳${request.dollarRate} = ৳${request.amountBDT})`,
//               relatedDollarRequestId: request._id,
//             },
//           ],
//           { session },
//         );
//       });
//     } finally {
//       await session.endSession();
//     }

//     // 🆕 অডিট লগ তৈরি (অ্যাপ্রুভের জন্য)
//     try {
//       await AuditLog.create({
//         adminId: auth.user._id,
//         adminPhone: auth.user.phone || auth.user.uid,
//         action: "AGENT_DOLLAR_REQUEST_APPROVE",
//         targetUser: request.agentId.toString(),
//         details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক $${request.amountUSD} (৳${request.amountBDT}) ডলার লোড রিকোয়েস্ট অ্যাপ্রুভ করা হয়েছে।`,
//         ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
//       });
//     } catch (auditErr) {
//       console.error("Audit log error:", auditErr);
//     }

//     return NextResponse.json({
//       success: true,
//       message: `রিকোয়েস্ট অ্যাপ্রুভ হয়েছে। ৳${request.amountBDT.toFixed(2)} এজেন্টের মূল ব্যালেন্সে যোগ হয়েছে।`,
//       amountBDT: request.amountBDT,
//       amountUSD: request.amountUSD,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: "সার্ভার এরর: " + error.message },
//       { status: 500 },
//     );
//   }
// }
// //////////////////////////////////////////////////////////////////////////
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import AgentDollarRequest from "@/models/AgentDollarRequest";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";
import { verifyAuth } from "@/utils/authCheck";

// ==========================================
// GET — ডলার লোড রিকোয়েস্টের লিস্ট
// ==========================================
export async function GET(req) {
  try {
    const auth = await verifyAuth("admin", "agent-requests", req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const total = await AgentDollarRequest.countDocuments(filter);

    const requests = await AgentDollarRequest.find(filter)
      .populate("agentId", "uid phone agentCode agentPhone agentMainBalance")
      .populate("reviewedBy", "uid phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}

// ==========================================
// PATCH — রিকোয়েস্ট অ্যাপ্রুভ / রিজেক্ট
// ==========================================
export async function PATCH(req) {
  try {
    const auth = await verifyAuth(
      "admin",
      "agent-requests",
      req,
      "AGENT_DOLLAR_REQUEST_REVIEW",
    );
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status || 401 },
      );
    }

    await dbConnect();
    const body = await req.json();
    const { requestId, action, adminNote } = body;

    if (!requestId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "requestId এবং action ('approve'/'reject') প্রয়োজন।",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ requestId।" },
        { status: 400 },
      );
    }

    const request = await AgentDollarRequest.findById(requestId);
    if (!request) {
      return NextResponse.json(
        { success: false, message: "রিকোয়েস্ট পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // ✅ ডাবল রিভিউ প্রতিরোধ
    if (request.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `এই রিকোয়েস্ট ইতিমধ্যে ${request.status} হয়েছে।`,
        },
        { status: 400 },
      );
    }

    // ==========================================
    // ✅ রিজেক্ট
    // ==========================================
    if (action === "reject") {
      request.status = "rejected";
      request.adminNote = adminNote || "";
      request.reviewedBy = auth.user._id;
      request.reviewedAt = new Date();
      await request.save();

      // 🆕 অডিট লগ তৈরি (রিজেক্টের জন্য)
      try {
        await AuditLog.create({
          adminId: auth.user._id,
          adminPhone: auth.user.phone || auth.user.uid,
          action: "AGENT_DOLLAR_REQUEST_REJECT",
          targetUser: request.agentId.toString(),
          details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক $${request.amountUSD} (৳${request.amountBDT}) ডলার লোড রিকোয়েস্ট রিজেক্ট করা হয়েছে।`,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      } catch (auditErr) {
        console.error("Audit log error:", auditErr);
      }

      return NextResponse.json({
        success: true,
        message: "রিকোয়েস্ট রিজেক্ট করা হয়েছে।",
      });
    }

    // ==========================================
    // ✅ অ্যাপ্রুভ — ট্রানজেকশন দিয়ে
    // ==========================================
    const agent = await User.findById(request.agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, message: "এজেন্ট পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (agent.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "এই ইউজার আর এজেন্ট নয়।" },
        { status: 400 },
      );
    }

    if (agent.agentIsBlocked) {
      return NextResponse.json(
        { success: false, message: "এজেন্ট ব্লকড, অ্যাপ্রুভ করা যাবে না।" },
        { status: 400 },
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // ১. এজেন্টের মূল ব্যালেন্সে টাকা যোগ (atomic operation - $inc ব্যবহার করে)
        const updatedAgent = await User.findByIdAndUpdate(
          request.agentId,
          { $inc: { agentMainBalance: request.amountBDT } },
          { session, new: true },
        );

        if (!updatedAgent) throw new Error("এজেন্ট আপডেট করা যায়নি।");

        // ২. রিকোয়েস্ট আপডেট (adminNote সহ)
        await AgentDollarRequest.findByIdAndUpdate(
          request._id,
          {
            status: "approved",
            adminNote: adminNote || "",
            reviewedBy: auth.user._id,
            reviewedAt: new Date(),
          },
          { session },
        );

        // ৩. ট্রানজেকশন এন্ট্রি (amount = টাকায়)
        await Transaction.create(
          [
            {
              userId: request.agentId,
              agentId: request.agentId,
              type: "AGENT_LOAD",
              method: request.paymentMethod || "AGENT_LOAD",
              phone: updatedAgent.agentPhone || updatedAgent.phone || "",
              amount: request.amountBDT,
              trxId: request.transactionId || "",
              status: "ACCEPTED",
              comment: `ডলার লোড ($${request.amountUSD} × ৳${request.dollarRate} = ৳${request.amountBDT})`,
              relatedDollarRequestId: request._id,
            },
          ],
          { session },
        );
      });
    } catch (txnErr) {
      console.error("Transaction error:", txnErr);
      return NextResponse.json(
        {
          success: false,
          message: "ডাটাবেস ট্রানজেকশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        },
        { status: 500 },
      );
    } finally {
      await session.endSession();
    }

    // 🆕 অডিট লগ তৈরি (অ্যাপ্রুভের জন্য)
    try {
      await AuditLog.create({
        adminId: auth.user._id,
        adminPhone: auth.user.phone || auth.user.uid,
        action: "AGENT_DOLLAR_REQUEST_APPROVE",
        targetUser: request.agentId.toString(),
        details: `অ্যাডমিন (${auth.user.phone || auth.user.uid}) কর্তৃক $${request.amountUSD} (৳${request.amountBDT}) ডলার লোড রিকোয়েস্ট অ্যাপ্রুভ করা হয়েছে।`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `রিকোয়েস্ট অ্যাপ্রুভ হয়েছে। ৳${request.amountBDT.toFixed(2)} এজেন্টের মূল ব্যালেন্সে যোগ হয়েছে।`,
      amountBDT: request.amountBDT,
      amountUSD: request.amountUSD,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর: " + error.message },
      { status: 500 },
    );
  }
}
