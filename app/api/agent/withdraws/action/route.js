// // import { NextResponse } from "next/server";
// // import mongoose from "mongoose";
// // import clientPromise from "@/lib/mongodb";
// // import Withdraw from "@/models/Withdraw";
// // import User from "@/models/User";
// // import Transaction from "@/models/Transaction";
// // import { verifyAuth } from "@/utils/authCheck";
// // import AuditLog from "@/models/AuditLog";

// // const calculateRefundAmount = (withdraw) => {
// //   if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
// //     return Number(withdraw.deductedBDT);
// //   }
// //   if (
// //     withdraw.originalCurrency === "USD" &&
// //     withdraw.exchangeRate &&
// //     Number(withdraw.exchangeRate) > 0
// //   ) {
// //     return Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate));
// //   }
// //   return Number(withdraw.amount) || 0;
// // };

// // export async function PATCH(req) {
// //   const session = await mongoose.startSession();
// //   try {
// //     await clientPromise;

// //     // ১. এজেন্ট লগইন চেক
// //     const auth = await verifyAuth("user");
// //     if (!auth.success || auth.user.role !== "agent") {
// //       return NextResponse.json(
// //         { success: false, message: "আপনি এজেন্ট নন!" },
// //         { status: 403 },
// //       );
// //     }

// //     const agentId = auth.user._id;
// //     const body = await req.json();
// //     const { withdrawId, status } = body || {};

// //     if (!withdrawId || !["approved", "rejected"].includes(status)) {
// //       return NextResponse.json(
// //         { success: false, message: "অবৈধ ডেটা!" },
// //         { status: 400 },
// //       );
// //     }

// //     // ২. উইথড্র চেক (এটি কি এই এজেন্টের?)
// //     const existingWithdraw = await Withdraw.findOne({
// //       _id: withdrawId,
// //       agentId,
// //     });
// //     if (!existingWithdraw) {
// //       return NextResponse.json(
// //         { success: false, message: "উইথড্র পাওয়া যায়নি বা এটি আপনার নয়।" },
// //         { status: 404 },
// //       );
// //     }
// //     if (existingWithdraw.status !== "pending") {
// //       return NextResponse.json(
// //         { success: false, message: "এই উইথড্র ইতিমধ্যে প্রসেস করা হয়েছে।" },
// //         { status: 400 },
// //       );
// //     }

// //     const targetUserId = existingWithdraw.uid;
// //     const walletType = existingWithdraw.walletType || "main";
// //     const balanceField =
// //       walletType === "referral" ? "referralBalance" : "balance";

// //     let agentUpdateInfo = null;
// //     let refundInfo = null;

// //     // ✅ ৩. ট্রানজেকশন শুরু
// //     await session.withTransaction(async () => {
// //       // উইথড্র স্ট্যাটাস আপডেট
// //       const updatedWithdraw = await Withdraw.findOneAndUpdate(
// //         { _id: withdrawId, status: "pending" },
// //         { $set: { status } },
// //         { returnDocument: "after", session },
// //       );
// //       if (!updatedWithdraw) throw new Error("উইথড্র আপডেট করা যায়নি!");

// //       if (status === "approved") {
// //         // ৪. এজেন্টের মূল ব্যালেন্সে টাকা যোগ এবং কমিশন যোগ
// //         const withdrawAmountBDT = calculateRefundAmount(updatedWithdraw);
// //         const commissionToAdd = Number(updatedWithdraw.agentCommission) || 0;

// //         const updatedAgent = await User.findOneAndUpdate(
// //           { _id: agentId },
// //           {
// //             $inc: {
// //               agentMainBalance: withdrawAmountBDT, // 👈 টাকা যোগ হচ্ছে
// //               agentCommissionBalance: commissionToAdd, // 👈 কমিশন যোগ হচ্ছে
// //             },
// //           },
// //           { returnDocument: "after", session },
// //         );

// //         if (!updatedAgent) {
// //           throw new Error("আপনার ব্যালেন্স আপডেট করা যায়নি।");
// //         }

// //         await Withdraw.updateOne(
// //           { _id: updatedWithdraw._id },
// //           { $set: { agentCommissionPaid: true } },
// //           { session },
// //         );

// //         // ৫. কমিশন ট্রানজেকশন তৈরি
// //         if (commissionToAdd > 0) {
// //           await Transaction.create(
// //             [
// //               {
// //                 userId: updatedAgent._id,
// //                 agentId: updatedAgent._id,
// //                 type: "AGENT_COMMISSION",
// //                 method: "AGENT_COMMISSION",
// //                 phone: updatedAgent.agentPhone || updatedAgent.phone || "",
// //                 amount: commissionToAdd,
// //                 trxId: "",
// //                 status: "ACCEPTED",
// //                 comment: `উইথড্র কমিশন (৳${withdrawAmountBDT} × ${updatedWithdraw.agentCommissionRate}% = ৳${commissionToAdd})`,
// //                 relatedWithdrawId: updatedWithdraw._id,
// //               },
// //             ],
// //             { session },
// //           );
// //         }

// //         agentUpdateInfo = {
// //           addedToMain: withdrawAmountBDT,
// //           commissionAdded: commissionToAdd,
// //         };
// //       } else if (status === "rejected") {
// //         // ৬. বাতিল হলে ইউজারকে টাকা ফেরত
// //         const refundAmount = calculateRefundAmount(updatedWithdraw);

// //         if (targetUserId && refundAmount > 0) {
// //           const updatedUser = await User.findOneAndUpdate(
// //             { uid: targetUserId },
// //             { $inc: { [balanceField]: refundAmount } },
// //             { returnDocument: "after", session },
// //           );
// //           if (updatedUser) {
// //             refundInfo = { refundAmount };
// //           }
// //         }
// //       }
// //     });

// //     // ✅ ৭. অডিট লগ তৈরি
// //     await AuditLog.create({
// //       adminId: agentId,
// //       adminPhone: auth.user.phone || auth.user.uid,
// //       action:
// //         status === "approved"
// //           ? "AGENT_APPROVE_WITHDRAW"
// //           : "AGENT_REJECT_WITHDRAW",
// //       targetUser: targetUserId,
// //       details: `এজেন্ট (${auth.user.phone || auth.user.uid}) কর্তৃক ${existingWithdraw.amount} টাকার উইথড্র ${status === "approved" ? "অ্যাপ্রুভ" : "বাতিল"} করা হয়েছে।`,
// //       ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
// //     });

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message:
// //           status === "approved"
// //             ? "✅ উইথড্র অ্যাপ্রুভ হয়েছে!"
// //             : "❌ উইথড্র বাতিল ও ইউজারকে রিফান্ড করা হয়েছে!",
// //         agentUpdate: agentUpdateInfo,
// //         refundInfo,
// //       },
// //       { status: 200 },
// //     );
// //   } catch (error) {
// //     return NextResponse.json(
// //       { success: false, message: error.message || "সার্ভার এরর!" },
// //       { status: 400 },
// //     );
// //   } finally {
// //     await session.endSession();
// //   }
// // }
// // //////////////////////////////////////////////////////
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import clientPromise from "@/lib/mongodb";
// import Withdraw from "@/models/Withdraw";
// import User from "@/models/User";
// import Transaction from "@/models/Transaction";
// import { verifyAuth } from "@/utils/authCheck";
// import AuditLog from "@/models/AuditLog";

// const calculateRefundAmount = (withdraw) => {
//   if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
//     return Number(withdraw.deductedBDT);
//   }
//   if (
//     withdraw.originalCurrency === "USD" &&
//     withdraw.exchangeRate &&
//     Number(withdraw.exchangeRate) > 0
//   ) {
//     return Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate));
//   }
//   return Number(withdraw.amount) || 0;
// };

// export async function PATCH(req) {
//   const session = await mongoose.startSession();
//   try {
//     await clientPromise;

//     // ১. এজেন্ট লগইন চেক
//     const auth = await verifyAuth("user");
//     if (!auth.success || auth.user.role !== "agent") {
//       return NextResponse.json(
//         { success: false, message: "আপনি এজেন্ট নন!" },
//         { status: 403 },
//       );
//     }

//     const agentId = auth.user._id;
//     const body = await req.json();
//     const { withdrawId, status } = body || {};

//     if (!withdrawId || !["approved", "rejected"].includes(status)) {
//       return NextResponse.json(
//         { success: false, message: "অবৈধ ডেটা!" },
//         { status: 400 },
//       );
//     }

//     // ২. উইথড্র চেক (এটি কি এই এজেন্টের?)
//     const existingWithdraw = await Withdraw.findOne({
//       _id: withdrawId,
//       agentId,
//     });
//     if (!existingWithdraw) {
//       return NextResponse.json(
//         { success: false, message: "উইথড্র পাওয়া যায়নি বা এটি আপনার নয়।" },
//         { status: 404 },
//       );
//     }
//     if (existingWithdraw.status !== "pending") {
//       return NextResponse.json(
//         { success: false, message: "এই উইথড্র ইতিমধ্যে প্রসেস করা হয়েছে।" },
//         { status: 400 },
//       );
//     }

//     const targetUserId = existingWithdraw.uid;
//     const walletType = existingWithdraw.walletType || "main";
//     const balanceField =
//       walletType === "referral" ? "referralBalance" : "balance";

//     let agentUpdateInfo = null;
//     let refundInfo = null;

//     // ✅ ৩. ট্রানজেকশন শুরু
//     await session.withTransaction(async () => {
//       // উইথড্র স্ট্যাটাস আপডেট
//       const updatedWithdraw = await Withdraw.findOneAndUpdate(
//         { _id: withdrawId, status: "pending" },
//         { $set: { status } },
//         { returnDocument: "after", session },
//       );
//       if (!updatedWithdraw) throw new Error("উইথড্র আপডেট করা যায়নি!");

//       if (status === "approved") {
//         // ৪. এজেন্টের মূল ব্যালেন্সে টাকা যোগ এবং কমিশন যোগ
//         const withdrawAmountBDT = calculateRefundAmount(updatedWithdraw);
//         const commissionToAdd = Number(updatedWithdraw.agentCommission) || 0;

//         const updatedAgent = await User.findOneAndUpdate(
//           { _id: agentId },
//           {
//             $inc: {
//               agentMainBalance: withdrawAmountBDT, // 👈 টাকা যোগ হচ্ছে
//               agentCommissionBalance: commissionToAdd, // 👈 কমিশন যোগ হচ্ছে
//             },
//           },
//           { returnDocument: "after", session },
//         );

//         if (!updatedAgent) {
//           throw new Error("আপনার ব্যালেন্স আপডেট করা যায়নি।");
//         }

//         await Withdraw.updateOne(
//           { _id: updatedWithdraw._id },
//           { $set: { agentCommissionPaid: true } },
//           { session },
//         );

//         // ৫. কমিশন ট্রানজেকশন তৈরি
//         if (commissionToAdd > 0) {
//           await Transaction.create(
//             [
//               {
//                 userId: updatedAgent._id,
//                 agentId: updatedAgent._id,
//                 type: "AGENT_COMMISSION",
//                 method: "AGENT_COMMISSION",
//                 phone: updatedAgent.agentPhone || updatedAgent.phone || "",
//                 amount: commissionToAdd,
//                 trxId: "",
//                 status: "ACCEPTED",
//                 comment: `উইথড্র কমিশন (৳${withdrawAmountBDT} × ${updatedWithdraw.agentCommissionRate}% = ৳${commissionToAdd})`,
//                 relatedWithdrawId: updatedWithdraw._id,
//               },
//             ],
//             { session },
//           );
//         }

//         agentUpdateInfo = {
//           addedToMain: withdrawAmountBDT,
//           commissionAdded: commissionToAdd,
//         };
//       } else if (status === "rejected") {
//         // ৬. বাতিল হলে ইউজারকে টাকা ফেরত
//         const refundAmount = calculateRefundAmount(updatedWithdraw);

//         if (targetUserId && refundAmount > 0) {
//           const updatedUser = await User.findOneAndUpdate(
//             { uid: targetUserId },
//             { $inc: { [balanceField]: refundAmount } },
//             { returnDocument: "after", session },
//           );
//           if (updatedUser) {
//             refundInfo = { refundAmount };
//           }
//         }
//       }
//     });

//     // ✅ ৭. অডিট লগ তৈরি (সেফ মোড — যাতে অডিট লগের এররে ট্রানজেকশন বাতিল না হয়)
//     try {
//       await AuditLog.create({
//         adminId: agentId,
//         adminPhone: auth.user.phone || auth.user.uid,
//         action:
//           status === "approved"
//             ? "AGENT_APPROVE_WITHDRAW"
//             : "AGENT_REJECT_WITHDRAW",
//         targetUser: targetUserId,
//         details: `এজেন্ট (${auth.user.phone || auth.user.uid}) কর্তৃক ${existingWithdraw.amount} টাকার উইথড্র ${status === "approved" ? "অ্যাপ্রুভ" : "বাতিল"} করা হয়েছে।`,
//         ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
//       });
//     } catch (auditErr) {
//       console.error("Audit log error:", auditErr);
//       // অডিট লগ ফেইল করলেও মূল উইথড্র প্রসেস বাতিল হবে না
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           status === "approved"
//             ? "✅ উইথড্র অ্যাপ্রুভ হয়েছে!"
//             : "❌ উইথড্র বাতিল ও ইউজারকে রিফান্ড করা হয়েছে!",
//         agentUpdate: agentUpdateInfo,
//         refundInfo,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message || "সার্ভার এরর!" },
//       { status: 400 },
//     );
//   } finally {
//     await session.endSession();
//   }
// }
// //////////////////////////////////////////////////////////
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import Withdraw from "@/models/Withdraw";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";
import AuditLog from "@/models/AuditLog";

const calculateRefundAmount = (withdraw) => {
  if (withdraw.deductedBDT && Number(withdraw.deductedBDT) > 0) {
    return Number(withdraw.deductedBDT);
  }
  if (
    withdraw.originalCurrency === "USD" &&
    withdraw.exchangeRate &&
    Number(withdraw.exchangeRate) > 0
  ) {
    return Math.round(Number(withdraw.amount) * Number(withdraw.exchangeRate));
  }
  return Number(withdraw.amount) || 0;
};

export async function PATCH(req) {
  const session = await mongoose.startSession();
  try {
    await clientPromise;

    // ১. এজেন্ট লগইন চেক
    const auth = await verifyAuth("user");
    if (!auth.success || auth.user.role !== "agent") {
      return NextResponse.json(
        { success: false, message: "আপনি এজেন্ট নন!" },
        { status: 403 },
      );
    }

    const agentId = auth.user._id;
    const body = await req.json();
    const { withdrawId, status } = body || {};

    if (!withdrawId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ ডেটা!" },
        { status: 400 },
      );
    }

    // ২. উইথড্র চেক (এটি কি এই এজেন্টের?)
    const existingWithdraw = await Withdraw.findOne({
      _id: withdrawId,
      agentId,
    });
    if (!existingWithdraw) {
      return NextResponse.json(
        { success: false, message: "উইথড্র পাওয়া যায়নি বা এটি আপনার নয়।" },
        { status: 404 },
      );
    }
    if (existingWithdraw.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "এই উইথড্র ইতিমধ্যে প্রসেস করা হয়েছে।" },
        { status: 400 },
      );
    }

    const targetUserId = existingWithdraw.uid;
    const walletType = existingWithdraw.walletType || "main";
    const balanceField =
      walletType === "referral" ? "referralBalance" : "balance";

    let agentUpdateInfo = null;
    let refundInfo = null;

    // ✅ ৩. ট্রানজেকশন শুরু
    await session.withTransaction(async () => {
      // উইথড্র স্ট্যাটাস আপডেট
      const updatedWithdraw = await Withdraw.findOneAndUpdate(
        { _id: withdrawId, status: "pending" },
        { $set: { status } },
        { returnDocument: "after", session },
      );
      if (!updatedWithdraw) throw new Error("উইথড্র আপডেট করা যায়নি!");

      if (status === "approved") {
        // ✅ [ফিক্স] অ্যাপ্রুভ করার সময় এজেন্টের ব্যালেন্স বা কমিশন বাড়ানো বন্ধ করা হলো।
        // কারণ রিকোয়েস্টের সময়ই তা হোল্ড/কাটা হয়ে গেছে।

        // ডাটাবেসে শুধু আপডেট হবে যে কমিশন দেওয়া হয়ে গেছে (ট্র্যাকিংয়ের জন্য)
        await Withdraw.updateOne(
          { _id: updatedWithdraw._id },
          { $set: { agentCommissionPaid: true } },
          { session },
        );

        // রেসপন্স মেসেজের জন্য ইনফো সেট করা (ব্যালেন্স কিন্তু বাড়বে না)
        agentUpdateInfo = {
          addedToMain: 0,
          commissionAdded: 0,
          message: "ব্যালেন্স ইতিমধ্যে রিকোয়েস্টের সময় হোল্ড করা হয়েছে।",
        };
      } else if (status === "rejected") {
        // ✅ [ফিক্স] বাতিল হলে ইউজার এবং এজেন্ট উভয়ের টাকা ফেরত দিতে হবে

        const refundAmount = calculateRefundAmount(updatedWithdraw);

        if (targetUserId && refundAmount > 0) {
          // ১. ইউজারের টাকা ফেরত
          const updatedUser = await User.findOneAndUpdate(
            { uid: targetUserId },
            { $inc: { [balanceField]: refundAmount } },
            { returnDocument: "after", session },
          );

          // ২. এজেন্টের টাকা ও কমিশন ফেরত (যেহেতু রিকোয়েস্টের সময় কাটা হয়েছিল)
          await User.findOneAndUpdate(
            { _id: agentId },
            {
              $inc: {
                agentMainBalance: refundAmount, // এজেন্টের কাটা টাকা ফেরত
                agentCommissionBalance: -(
                  Number(updatedWithdraw.agentCommission) || 0
                ), // কমিশন বাতিল
              },
            },
            { session },
          );

          if (updatedUser) {
            refundInfo = { refundAmount };
          }
        }
      }
    });

    // ✅ ৭. অডিট লগ তৈরি (সেফ মোড)
    try {
      await AuditLog.create({
        adminId: agentId,
        adminPhone: auth.user.phone || auth.user.uid,
        action:
          status === "approved"
            ? "AGENT_APPROVE_WITHDRAW"
            : "AGENT_REJECT_WITHDRAW",
        targetUser: targetUserId,
        details: `এজেন্ট (${auth.user.phone || auth.user.uid}) কর্তৃক ${existingWithdraw.amount} টাকার উইথড্র ${status === "approved" ? "অ্যাপ্রুভ" : "বাতিল"} করা হয়েছে।`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          status === "approved"
            ? "✅ উইথড্র অ্যাপ্রুভ হয়েছে!"
            : "❌ উইথড্র বাতিল ও ইউজারকে রিফান্ড করা হয়েছে!",
        agentUpdate: agentUpdateInfo,
        refundInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "সার্ভার এরর!" },
      { status: 400 },
    );
  } finally {
    await session.endSession();
  }
}
