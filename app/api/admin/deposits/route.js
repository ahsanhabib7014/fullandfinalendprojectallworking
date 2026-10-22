// // import { NextResponse } from "next/server";
// // import mongoose from "mongoose";
// // import clientPromise from "@/lib/mongodb";
// // import Deposit from "@/models/Deposit";
// // import User from "@/models/User";
// // import Setting from "@/models/Setting";
// // import Transaction from "@/models/Transaction";
// // import { verifyAuth } from "@/utils/authCheck";
// // import { calculateVipLevel } from "@/utils/vipLevel";
// // import AuditLog from "@/models/AuditLog";

// // const VALID_STATUSES = ["pending", "approved", "rejected"];

// // export async function GET(request) {
// //   try {
// //     await clientPromise;

// //     const auth = await verifyAuth("admin");
// //     if (!auth.success) {
// //       return NextResponse.json(
// //         { success: false, message: auth.message },
// //         { status: auth.status },
// //       );
// //     }

// //     let deposits = await Deposit.find({}).lean();

// //     deposits = deposits.map((item) => {
// //       let itemDate = item.createdAt || item.date || item.timestamp;

// //       if (!itemDate && item._id) {
// //         try {
// //           itemDate = new Date(
// //             parseInt(item._id.toString().substring(0, 8), 16) * 1000,
// //           );
// //         } catch (e) {
// //           itemDate = new Date(0);
// //         }
// //       }

// //       return { ...item, createdAt: itemDate };
// //     });

// //     deposits.sort((a, b) => {
// //       const timeA = new Date(a.createdAt || 0).getTime();
// //       const timeB = new Date(b.createdAt || 0).getTime();
// //       return timeB - timeA;
// //     });

// //     return NextResponse.json({ success: true, deposits }, { status: 200 });
// //   } catch (error) {
// //     console.error("Deposit GET Error");
// //     return NextResponse.json(
// //       { success: false, deposits: [], error: "Server Error" },
// //       { status: 500 },
// //     );
// //   }
// // }

// // export async function PATCH(request) {
// //   try {
// //     await clientPromise;

// //     const auth = await verifyAuth("admin");
// //     if (!auth.success) {
// //       return NextResponse.json(
// //         { success: false, message: auth.message },
// //         { status: auth.status },
// //       );
// //     }

// //     const adminUser = auth.user;
// //     let body;
// //     try {
// //       body = await request.json();
// //     } catch (e) {
// //       return NextResponse.json(
// //         { success: false, message: "Invalid JSON" },
// //         { status: 400 },
// //       );
// //     }

// //     const { depositId, status, adminNote } = body || {};

// //     if (!depositId || !mongoose.isValidObjectId(depositId)) {
// //       return NextResponse.json(
// //         { success: false, message: "Invalid deposit ID" },
// //         { status: 400 },
// //       );
// //     }

// //     const cleanNote =
// //       typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : "";

// //     // শুধু নোট আপডেট
// //     if (!status) {
// //       const updatedDeposit = await Deposit.findByIdAndUpdate(
// //         depositId,
// //         { $set: { adminNote: cleanNote } },
// //         { returnDocument: "after" },
// //       );

// //       if (!updatedDeposit) {
// //         return NextResponse.json(
// //           { success: false, message: "Deposit not found" },
// //           { status: 404 },
// //         );
// //       }

// //       if (adminUser) {
// //         await AuditLog.create({
// //           adminId: adminUser._id,
// //           adminPhone: adminUser.phone || adminUser.uid,
// //           action: "UPDATE_DEPOSIT_NOTE",
// //           targetUser: updatedDeposit.uid || updatedDeposit.userId,
// //           oldData: { adminNote: updatedDeposit.adminNote },
// //           newData: { adminNote: cleanNote },
// //           details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) ডিপোজিটে নোট আপডেট করেছেন।`,
// //           ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
// //         });
// //       }

// //       return NextResponse.json(
// //         {
// //           success: true,
// //           message: "✅ নোট সফলভাবে আপডেট হয়েছে!",
// //           deposit: updatedDeposit,
// //         },
// //         {
// //           status: 200,
// //           headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
// //         },
// //       );
// //     }

// //     if (!VALID_STATUSES.includes(status)) {
// //       return NextResponse.json(
// //         { success: false, message: "Invalid status" },
// //         { status: 400 },
// //       );
// //     }

// //     const existingDeposit = await Deposit.findById(depositId);
// //     if (!existingDeposit) {
// //       return NextResponse.json(
// //         { success: false, message: "Deposit not found" },
// //         { status: 404 },
// //       );
// //     }

// //     const targetUserId = existingDeposit.uid || existingDeposit.userId;
// //     let oldUserBalance = 0;
// //     let newUserBalance = 0;
// //     let agentUpdateInfo = null;

// //     if (targetUserId) {
// //       const targetUserDoc = await User.findOne({ uid: targetUserId });
// //       if (targetUserDoc) {
// //         oldUserBalance = targetUserDoc.balance || 0;
// //       }
// //     }

// //     const updateData = { status };
// //     if (cleanNote) updateData.adminNote = cleanNote;

// //     // ✅ MongoDB Transaction শুরু
// //     const session = await mongoose.startSession();
// //     try {
// //       await session.withTransaction(async () => {
// //         // ১. ডিপোজিট স্ট্যাটাস পেন্ডিং থেকে অ্যাপ্রুভ/রিজেক্ট করা
// //         const updatedDeposit = await Deposit.findOneAndUpdate(
// //           { _id: depositId, status: "pending" },
// //           { $set: updateData },
// //           { returnDocument: "after", session },
// //         );

// //         if (!updatedDeposit) {
// //           throw new Error(
// //             `এই ডিপোজিট ইতিমধ্যে ${existingDeposit.status} অবস্থায় আছে!`,
// //           );
// //         }

// //         if (status === "approved") {
// //           const depositAmount = Number(updatedDeposit.amount) || 0;

// //           if (targetUserId && depositAmount > 0) {
// //             // ২. ইউজারের ব্যালেন্স বাড়ানো
// //             const user = await User.findOneAndUpdate(
// //               { uid: targetUserId },
// //               {
// //                 $inc: {
// //                   balance: depositAmount,
// //                   turnover: depositAmount,
// //                   weeklyDeposit: depositAmount,
// //                   monthlyTurnover: depositAmount,
// //                   totalDeposit: depositAmount,
// //                 },
// //               },
// //               { returnDocument: "after", session },
// //             );

// //             if (user) {
// //               newUserBalance = user.balance || 0;
// //               const newLevel = calculateVipLevel(user.totalDeposit || 0);
// //               if (newLevel !== user.vipLevel) {
// //                 await User.updateOne(
// //                   { _id: user._id },
// //                   {
// //                     $set: { vipLevel: newLevel, vipLevelUpdatedAt: new Date() },
// //                   },
// //                   { session },
// //                 );
// //               }
// //             }

// //             // ৩. রেফারেল কমিশন (যদি থাকে)
// //             if (user && user.referredBy) {
// //               try {
// //                 const referrer = await User.findOne({
// //                   uid: user.referredBy,
// //                 }).session(session);
// //                 if (referrer) {
// //                   let commissionRate = 10;
// //                   if (
// //                     referrer.customCommission !== null &&
// //                     referrer.customCommission !== undefined
// //                   ) {
// //                     commissionRate = Number(referrer.customCommission);
// //                   } else {
// //                     const globalSetting = await Setting.findOne({
// //                       key: {
// //                         $in: [
// //                           "referralPercentage",
// //                           "defaultReferralCommission",
// //                         ],
// //                       },
// //                     }).session(session);
// //                     if (globalSetting && globalSetting.value !== undefined) {
// //                       const parsed = Number(globalSetting.value);
// //                       if (!isNaN(parsed) && parsed >= 0 && parsed <= 100)
// //                         commissionRate = parsed;
// //                     }
// //                   }
// //                   if (commissionRate < 0 || commissionRate > 100)
// //                     commissionRate = 10;
// //                   const commissionBonus =
// //                     (depositAmount * commissionRate) / 100;
// //                   if (commissionBonus > 0) {
// //                     await User.updateOne(
// //                       { uid: referrer.uid },
// //                       { $inc: { referralBalance: commissionBonus } },
// //                       { session },
// //                     );
// //                   }
// //                 }
// //               } catch (refErr) {
// //                 console.error("Referral commission error", refErr);
// //               }
// //             }
// //           }

// //           // ৪. এজেন্টের ব্যালেন্স কাটা (Atomic Check)
// //           if (updatedDeposit.agentId && depositAmount > 0) {
// //             const commissionToAdd = Number(updatedDeposit.agentCommission) || 0;

// //             // ডাটাবেস লেভেলেই চেক হবে এজেন্টের কাছে টাকা আছে কি না
// //             const updatedAgent = await User.findOneAndUpdate(
// //               {
// //                 _id: updatedDeposit.agentId,
// //                 agentMainBalance: { $gte: depositAmount }, // 👈 এখানেই রেস কন্ডিশন আটকে যাবে
// //               },
// //               {
// //                 $inc: {
// //                   agentMainBalance: -depositAmount,
// //                   agentCommissionBalance: commissionToAdd,
// //                 },
// //               },
// //               { returnDocument: "after", session },
// //             );

// //             if (!updatedAgent) {
// //               // এজেন্টের টাকা কম থাকলে পুরো ট্রানজেকশন বাতিল হবে
// //               throw new Error(
// //                 "এজেন্টের ব্যালেন্স কম! ডিপোজিট অ্যাপ্রুভ করা যাবে না।",
// //               );
// //             }

// //             await Deposit.updateOne(
// //               { _id: updatedDeposit._id },
// //               { $set: { agentCommissionPaid: true } },
// //               { session },
// //             );

// //             if (commissionToAdd > 0) {
// //               await Transaction.create(
// //                 [
// //                   {
// //                     userId: updatedAgent._id,
// //                     agentId: updatedAgent._id,
// //                     type: "AGENT_COMMISSION",
// //                     method: "AGENT_COMMISSION",
// //                     phone: updatedAgent.agentPhone || updatedAgent.phone || "",
// //                     amount: commissionToAdd,
// //                     trxId: updatedDeposit.transactionId || "",
// //                     status: "ACCEPTED",
// //                     comment: `ডিপোজিট কমিশন (৳${depositAmount} × ${updatedDeposit.agentCommissionRate}% = ৳${commissionToAdd})`,
// //                     relatedDepositId: updatedDeposit._id,
// //                   },
// //                 ],
// //                 { session },
// //               );
// //             }

// //             agentUpdateInfo = {
// //               agentId: updatedAgent._id,
// //               agentUid: updatedAgent.uid,
// //               deductedFromMain: depositAmount,
// //               commissionAdded: commissionToAdd,
// //             };
// //           }
// //         } else {
// //           newUserBalance = oldUserBalance;
// //         }
// //       });
// //     } catch (err) {
// //       return NextResponse.json(
// //         { success: false, message: err.message },
// //         { status: 400 },
// //       );
// //     } finally {
// //       await session.endSession();
// //     }

// //     // ✅ ট্রানজেকশন সফল হলে Audit Log তৈরি হবে
// //     if (adminUser) {
// //       const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
// //       const agentDetail = agentUpdateInfo
// //         ? ` | এজেন্ট ${agentUpdateInfo.agentUid}: ব্যালেন্স থেকে ৳${agentUpdateInfo.deductedFromMain} কাটা, কমিশন ৳${agentUpdateInfo.commissionAdded} যোগ।`
// //         : "";

// //       await AuditLog.create({
// //         adminId: adminUser._id,
// //         adminPhone: adminUser.phone || adminUser.uid,
// //         action: status === "approved" ? "APPROVE_DEPOSIT" : "REJECT_DEPOSIT",
// //         targetUser: targetUserId,
// //         oldData: {
// //           depositId: existingDeposit._id,
// //           amount: existingDeposit.amount,
// //           status: existingDeposit.status,
// //           balance: oldUserBalance,
// //         },
// //         newData: {
// //           depositId: depositId,
// //           amount: existingDeposit.amount,
// //           status: status,
// //           balance: newUserBalance,
// //         },
// //         details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ${existingDeposit.amount} টাকা ডিপোজিট ${status === "approved" ? `এপ্রুভ করা হয়েছে। ইউজারের ব্যালেন্স ৳${oldUserBalance} থেকে বেড়ে ৳${newUserBalance} হয়েছে।${agentDetail}` : "বাতিল করা হয়েছে।"}`,
// //         ipAddress: ip,
// //       });
// //     }

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message:
// //           status === "approved"
// //             ? "ডিপোজিট কনফার্ম হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে"
// //             : "ডিপোজিট বাতিল করা হয়েছে",
// //         agentUpdate: agentUpdateInfo,
// //       },
// //       {
// //         status: 200,
// //         headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
// //       },
// //     );
// //   } catch (error) {
// //     console.error("Deposit PATCH Error", error);
// //     return NextResponse.json(
// //       { success: false, message: "Server Error" },
// //       { status: 500 },
// //     );
// //   }
// // }
// // //////////////////////////////////////////////////////////////////////////////
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import clientPromise from "@/lib/mongodb";
// import Deposit from "@/models/Deposit";
// import User from "@/models/User";
// import Setting from "@/models/Setting";
// import Transaction from "@/models/Transaction";
// import { verifyAuth } from "@/utils/authCheck";
// import { calculateVipLevel } from "@/utils/vipLevel";
// import AuditLog from "@/models/AuditLog";

// const VALID_STATUSES = ["pending", "approved", "rejected"];

// export async function GET(request) {
//   try {
//     await clientPromise;

//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );
//     }

//     // ✅ [পরিবর্তন] এজেন্টের ডেটা populate করা হলো
//     let deposits = await Deposit.find({})
//       .populate("agentId", "agentCode phone uid")
//       .lean();

//     deposits = deposits.map((item) => {
//       let itemDate = item.createdAt || item.date || item.timestamp;

//       if (!itemDate && item._id) {
//         try {
//           itemDate = new Date(
//             parseInt(item._id.toString().substring(0, 8), 16) * 1000,
//           );
//         } catch (e) {
//           itemDate = new Date(0);
//         }
//       }

//       return { ...item, createdAt: itemDate };
//     });

//     deposits.sort((a, b) => {
//       const timeA = new Date(a.createdAt || 0).getTime();
//       const timeB = new Date(b.createdAt || 0).getTime();
//       return timeB - timeA;
//     });

//     return NextResponse.json({ success: true, deposits }, { status: 200 });
//   } catch (error) {
//     console.error("Deposit GET Error");
//     return NextResponse.json(
//       { success: false, deposits: [], error: "Server Error" },
//       { status: 500 },
//     );
//   }
// }

// export async function PATCH(request) {
//   try {
//     await clientPromise;

//     const auth = await verifyAuth("admin");
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );
//     }

//     const adminUser = auth.user;
//     let body;
//     try {
//       body = await request.json();
//     } catch (e) {
//       return NextResponse.json(
//         { success: false, message: "Invalid JSON" },
//         { status: 400 },
//       );
//     }

//     const { depositId, status, adminNote } = body || {};

//     if (!depositId || !mongoose.isValidObjectId(depositId)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid deposit ID" },
//         { status: 400 },
//       );
//     }

//     const cleanNote =
//       typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : "";

//     // শুধু নোট আপডেট
//     if (!status) {
//       const updatedDeposit = await Deposit.findByIdAndUpdate(
//         depositId,
//         { $set: { adminNote: cleanNote } },
//         { returnDocument: "after" },
//       );

//       if (!updatedDeposit) {
//         return NextResponse.json(
//           { success: false, message: "Deposit not found" },
//           { status: 404 },
//         );
//       }

//       if (adminUser) {
//         await AuditLog.create({
//           adminId: adminUser._id,
//           adminPhone: adminUser.phone || adminUser.uid,
//           action: "UPDATE_DEPOSIT_NOTE",
//           targetUser: updatedDeposit.uid || updatedDeposit.userId,
//           oldData: { adminNote: updatedDeposit.adminNote },
//           newData: { adminNote: cleanNote },
//           details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) ডিপোজিটে নোট আপডেট করেছেন।`,
//           ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
//         });
//       }

//       return NextResponse.json(
//         {
//           success: true,
//           message: "✅ নোট সফলভাবে আপডেট হয়েছে!",
//           deposit: updatedDeposit,
//         },
//         {
//           status: 200,
//           headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//         },
//       );
//     }

//     if (!VALID_STATUSES.includes(status)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid status" },
//         { status: 400 },
//       );
//     }

//     const existingDeposit = await Deposit.findById(depositId);
//     if (!existingDeposit) {
//       return NextResponse.json(
//         { success: false, message: "Deposit not found" },
//         { status: 404 },
//       );
//     }

//     const targetUserId = existingDeposit.uid || existingDeposit.userId;
//     let oldUserBalance = 0;
//     let newUserBalance = 0;
//     let agentUpdateInfo = null;

//     if (targetUserId) {
//       const targetUserDoc = await User.findOne({ uid: targetUserId });
//       if (targetUserDoc) {
//         oldUserBalance = targetUserDoc.balance || 0;
//       }
//     }

//     const updateData = { status };
//     if (cleanNote) updateData.adminNote = cleanNote;

//     // ✅ MongoDB Transaction শুরু
//     const session = await mongoose.startSession();
//     try {
//       await session.withTransaction(async () => {
//         // ১. ডিপোজিট স্ট্যাটাস পেন্ডিং থেকে অ্যাপ্রুভ/রিজেক্ট করা
//         const updatedDeposit = await Deposit.findOneAndUpdate(
//           { _id: depositId, status: "pending" },
//           { $set: updateData },
//           { returnDocument: "after", session },
//         );

//         if (!updatedDeposit) {
//           throw new Error(
//             `এই ডিপোজিট ইতিমধ্যে ${existingDeposit.status} অবস্থায় আছে!`,
//           );
//         }

//         if (status === "approved") {
//           const depositAmount = Number(updatedDeposit.amount) || 0;

//           if (targetUserId && depositAmount > 0) {
//             // ২. ইউজারের ব্যালেন্স বাড়ানো
//             const user = await User.findOneAndUpdate(
//               { uid: targetUserId },
//               {
//                 $inc: {
//                   balance: depositAmount,
//                   turnover: depositAmount,
//                   weeklyDeposit: depositAmount,
//                   monthlyTurnover: depositAmount,
//                   totalDeposit: depositAmount,
//                 },
//               },
//               { returnDocument: "after", session },
//             );

//             if (user) {
//               newUserBalance = user.balance || 0;
//               const newLevel = calculateVipLevel(user.totalDeposit || 0);
//               if (newLevel !== user.vipLevel) {
//                 await User.updateOne(
//                   { _id: user._id },
//                   {
//                     $set: { vipLevel: newLevel, vipLevelUpdatedAt: new Date() },
//                   },
//                   { session },
//                 );
//               }
//             }

//             // ৩. রেফারেল কমিশন (যদি থাকে)
//             if (user && user.referredBy) {
//               try {
//                 const referrer = await User.findOne({
//                   uid: user.referredBy,
//                 }).session(session);
//                 if (referrer) {
//                   let commissionRate = 10;
//                   if (
//                     referrer.customCommission !== null &&
//                     referrer.customCommission !== undefined
//                   ) {
//                     commissionRate = Number(referrer.customCommission);
//                   } else {
//                     const globalSetting = await Setting.findOne({
//                       key: {
//                         $in: [
//                           "referralPercentage",
//                           "defaultReferralCommission",
//                         ],
//                       },
//                     }).session(session);
//                     if (globalSetting && globalSetting.value !== undefined) {
//                       const parsed = Number(globalSetting.value);
//                       if (!isNaN(parsed) && parsed >= 0 && parsed <= 100)
//                         commissionRate = parsed;
//                     }
//                   }
//                   if (commissionRate < 0 || commissionRate > 100)
//                     commissionRate = 10;
//                   const commissionBonus =
//                     (depositAmount * commissionRate) / 100;
//                   if (commissionBonus > 0) {
//                     await User.updateOne(
//                       { uid: referrer.uid },
//                       { $inc: { referralBalance: commissionBonus } },
//                       { session },
//                     );
//                   }
//                 }
//               } catch (refErr) {
//                 console.error("Referral commission error", refErr);
//               }
//             }
//           }

//           // ৪. এজেন্টের ব্যালেন্স কাটা (Atomic Check)
//           if (updatedDeposit.agentId && depositAmount > 0) {
//             const commissionToAdd = Number(updatedDeposit.agentCommission) || 0;

//             // ডাটাবেস লেভেলেই চেক হবে এজেন্টের কাছে টাকা আছে কি না
//             const updatedAgent = await User.findOneAndUpdate(
//               {
//                 _id: updatedDeposit.agentId,
//                 agentMainBalance: { $gte: depositAmount }, // 👈 এখানেই রেস কন্ডিশন আটকে যাবে
//               },
//               {
//                 $inc: {
//                   agentMainBalance: -depositAmount,
//                   agentCommissionBalance: commissionToAdd,
//                 },
//               },
//               { returnDocument: "after", session },
//             );

//             if (!updatedAgent) {
//               // এজেন্টের টাকা কম থাকলে পুরো ট্রানজেকশন বাতিল হবে
//               throw new Error(
//                 "এজেন্টের ব্যালেন্স কম! ডিপোজিট অ্যাপ্রুভ করা যাবে না।",
//               );
//             }

//             await Deposit.updateOne(
//               { _id: updatedDeposit._id },
//               { $set: { agentCommissionPaid: true } },
//               { session },
//             );

//             if (commissionToAdd > 0) {
//               await Transaction.create(
//                 [
//                   {
//                     userId: updatedAgent._id,
//                     agentId: updatedAgent._id,
//                     type: "AGENT_COMMISSION",
//                     method: "AGENT_COMMISSION",
//                     phone: updatedAgent.agentPhone || updatedAgent.phone || "",
//                     amount: commissionToAdd,
//                     trxId: updatedDeposit.transactionId || "",
//                     status: "ACCEPTED",
//                     comment: `ডিপোজিট কমিশন (৳${depositAmount} × ${updatedDeposit.agentCommissionRate}% = ৳${commissionToAdd})`,
//                     relatedDepositId: updatedDeposit._id,
//                   },
//                 ],
//                 { session },
//               );
//             }

//             agentUpdateInfo = {
//               agentId: updatedAgent._id,
//               agentUid: updatedAgent.uid,
//               deductedFromMain: depositAmount,
//               commissionAdded: commissionToAdd,
//             };
//           }
//         } else {
//           newUserBalance = oldUserBalance;
//         }
//       });
//     } catch (err) {
//       return NextResponse.json(
//         { success: false, message: err.message },
//         { status: 400 },
//       );
//     } finally {
//       await session.endSession();
//     }

//     // ✅ ট্রানজেকশন সফল হলে Audit Log তৈরি হবে
//     if (adminUser) {
//       const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
//       const agentDetail = agentUpdateInfo
//         ? ` | এজেন্ট ${agentUpdateInfo.agentUid}: ব্যালেন্স থেকে ৳${agentUpdateInfo.deductedFromMain} কাটা, কমিশন ৳${agentUpdateInfo.commissionAdded} যোগ।`
//         : "";

//       await AuditLog.create({
//         adminId: adminUser._id,
//         adminPhone: adminUser.phone || adminUser.uid,
//         action: status === "approved" ? "APPROVE_DEPOSIT" : "REJECT_DEPOSIT",
//         targetUser: targetUserId,
//         oldData: {
//           depositId: existingDeposit._id,
//           amount: existingDeposit.amount,
//           status: existingDeposit.status,
//           balance: oldUserBalance,
//         },
//         newData: {
//           depositId: depositId,
//           amount: existingDeposit.amount,
//           status: status,
//           balance: newUserBalance,
//         },
//         details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ${existingDeposit.amount} টাকা ডিপোজিট ${status === "approved" ? `এপ্রুভ করা হয়েছে। ইউজারের ব্যালেন্স ৳${oldUserBalance} থেকে বেড়ে ৳${newUserBalance} হয়েছে।${agentDetail}` : "বাতিল করা হয়েছে।"}`,
//         ipAddress: ip,
//       });
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           status === "approved"
//             ? "ডিপোজিট কনফার্ম হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে"
//             : "ডিপোজিট বাতিল করা হয়েছে",
//         agentUpdate: agentUpdateInfo,
//       },
//       {
//         status: 200,
//         headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//       },
//     );
//   } catch (error) {
//     console.error("Deposit PATCH Error", error);
//     return NextResponse.json(
//       { success: false, message: "Server Error" },
//       { status: 500 },
//     );
//   }
// }/////////////////////////////////////////////////////////////////////////
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
import User from "@/models/User";
import Setting from "@/models/Setting";
import Transaction from "@/models/Transaction";
import { verifyAuth } from "@/utils/authCheck";
import { calculateVipLevel } from "@/utils/vipLevel";
import AuditLog from "@/models/AuditLog";

const VALID_STATUSES = ["pending", "approved", "rejected"];

export async function GET(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    let deposits = await Deposit.find({})
      .populate("agentId", "agentCode phone uid")
      .lean();

    deposits = deposits.map((item) => {
      let itemDate = item.createdAt || item.date || item.timestamp;

      if (!itemDate && item._id) {
        try {
          itemDate = new Date(
            parseInt(item._id.toString().substring(0, 8), 16) * 1000,
          );
        } catch (e) {
          itemDate = new Date(0);
        }
      }

      return { ...item, createdAt: itemDate };
    });

    deposits.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // ✅ প্রতিটি ডিপোজিটের জন্য অডিট লগ খুঁজে বের করা
    const depositsWithAudit = await Promise.all(
      deposits.map(async (dep) => {
        const audit = await AuditLog.findOne({
          "newData.depositId": dep._id,
          action: { $in: ["APPROVE_DEPOSIT", "REJECT_DEPOSIT"] },
        })
          .sort({ createdAt: -1 })
          .lean();

        if (audit) {
          return {
            ...dep,
            auditInfo: {
              oldBalance: audit.oldData?.balance || 0,
              newBalance: audit.newData?.balance || 0,
              oldStatus: audit.oldData?.status || "pending",
              newStatus: audit.newData?.status || dep.status,
              auditTime: audit.createdAt,
            },
          };
        }
        return dep;
      }),
    );

    return NextResponse.json(
      { success: true, deposits: depositsWithAudit },
      { status: 200 },
    );
  } catch (error) {
    console.error("Deposit GET Error", error);
    return NextResponse.json(
      { success: false, deposits: [], error: "Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth("admin");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const adminUser = auth.user;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    const { depositId, status, adminNote } = body || {};

    if (!depositId || !mongoose.isValidObjectId(depositId)) {
      return NextResponse.json(
        { success: false, message: "Invalid deposit ID" },
        { status: 400 },
      );
    }

    const cleanNote =
      typeof adminNote === "string" ? adminNote.trim().slice(0, 500) : "";

    // শুধু নোট আপডেট
    if (!status) {
      const updatedDeposit = await Deposit.findByIdAndUpdate(
        depositId,
        { $set: { adminNote: cleanNote } },
        { returnDocument: "after" },
      );

      if (!updatedDeposit) {
        return NextResponse.json(
          { success: false, message: "Deposit not found" },
          { status: 404 },
        );
      }

      if (adminUser) {
        await AuditLog.create({
          adminId: adminUser._id,
          adminPhone: adminUser.phone || adminUser.uid,
          action: "UPDATE_DEPOSIT_NOTE",
          targetUser: updatedDeposit.uid || updatedDeposit.userId,
          oldData: { adminNote: updatedDeposit.adminNote },
          newData: { adminNote: cleanNote },
          details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) ডিপোজিটে নোট আপডেট করেছেন।`,
          ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "✅ নোট সফলভাবে আপডেট হয়েছে!",
          deposit: updatedDeposit,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        },
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const existingDeposit = await Deposit.findById(depositId);
    if (!existingDeposit) {
      return NextResponse.json(
        { success: false, message: "Deposit not found" },
        { status: 404 },
      );
    }

    const targetUserId = existingDeposit.uid || existingDeposit.userId;
    let oldUserBalance = 0;
    let newUserBalance = 0;
    let agentUpdateInfo = null;

    if (targetUserId) {
      const targetUserDoc = await User.findOne({ uid: targetUserId });
      if (targetUserDoc) {
        oldUserBalance = targetUserDoc.balance || 0;
      }
    }

    const updateData = { status };
    if (cleanNote) updateData.adminNote = cleanNote;

    // ✅ MongoDB Transaction শুরু
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // ১. ডিপোজিট স্ট্যাটাস পেন্ডিং থেকে অ্যাপ্রুভ/রিজেক্ট করা
        const updatedDeposit = await Deposit.findOneAndUpdate(
          { _id: depositId, status: "pending" },
          { $set: updateData },
          { returnDocument: "after", session },
        );

        if (!updatedDeposit) {
          throw new Error(
            `এই ডিপোজিট ইতিমধ্যে ${existingDeposit.status} অবস্থায় আছে!`,
          );
        }

        if (status === "approved") {
          const depositAmount = Number(updatedDeposit.amount) || 0;

          if (targetUserId && depositAmount > 0) {
            // ২. ইউজারের ব্যালেন্স বাড়ানো
            const user = await User.findOneAndUpdate(
              { uid: targetUserId },
              {
                $inc: {
                  balance: depositAmount,
                  turnover: depositAmount,
                  weeklyDeposit: depositAmount,
                  monthlyTurnover: depositAmount,
                  totalDeposit: depositAmount,
                },
              },
              { returnDocument: "after", session },
            );

            if (user) {
              newUserBalance = user.balance || 0;
              const newLevel = calculateVipLevel(user.totalDeposit || 0);
              if (newLevel !== user.vipLevel) {
                await User.updateOne(
                  { _id: user._id },
                  {
                    $set: { vipLevel: newLevel, vipLevelUpdatedAt: new Date() },
                  },
                  { session },
                );
              }
            }

            // ৩. রেফারেল কমিশন (যদি থাকে)
            if (user && user.referredBy) {
              try {
                const referrer = await User.findOne({
                  uid: user.referredBy,
                }).session(session);
                if (referrer) {
                  let commissionRate = 10;
                  if (
                    referrer.customCommission !== null &&
                    referrer.customCommission !== undefined
                  ) {
                    commissionRate = Number(referrer.customCommission);
                  } else {
                    const globalSetting = await Setting.findOne({
                      key: {
                        $in: [
                          "referralPercentage",
                          "defaultReferralCommission",
                        ],
                      },
                    }).session(session);
                    if (globalSetting && globalSetting.value !== undefined) {
                      const parsed = Number(globalSetting.value);
                      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100)
                        commissionRate = parsed;
                    }
                  }
                  if (commissionRate < 0 || commissionRate > 100)
                    commissionRate = 10;
                  const commissionBonus =
                    (depositAmount * commissionRate) / 100;
                  if (commissionBonus > 0) {
                    await User.updateOne(
                      { uid: referrer.uid },
                      { $inc: { referralBalance: commissionBonus } },
                      { session },
                    );
                  }
                }
              } catch (refErr) {
                console.error("Referral commission error", refErr);
              }
            }
          }

          // ৪. এজেন্টের ব্যালেন্স কাটা (Atomic Check)
          if (updatedDeposit.agentId && depositAmount > 0) {
            const commissionToAdd = Number(updatedDeposit.agentCommission) || 0;

            // ডাটাবেস লেভেলেই চেক হবে এজেন্টের কাছে টাকা আছে কি না
            const updatedAgent = await User.findOneAndUpdate(
              {
                _id: updatedDeposit.agentId,
                agentMainBalance: { $gte: depositAmount }, // 👈 এখানেই রেস কন্ডিশন আটকে যাবে
              },
              {
                $inc: {
                  agentMainBalance: -depositAmount,
                  agentCommissionBalance: commissionToAdd,
                },
              },
              { returnDocument: "after", session },
            );

            if (!updatedAgent) {
              // এজেন্টের টাকা কম থাকলে পুরো ট্রানজেকশন বাতিল হবে
              throw new Error(
                "এজেন্টের ব্যালেন্স কম! ডিপোজিট অ্যাপ্রুভ করা যাবে না।",
              );
            }

            await Deposit.updateOne(
              { _id: updatedDeposit._id },
              { $set: { agentCommissionPaid: true } },
              { session },
            );

            if (commissionToAdd > 0) {
              await Transaction.create(
                [
                  {
                    userId: updatedAgent._id,
                    agentId: updatedAgent._id,
                    type: "AGENT_COMMISSION",
                    method: "AGENT_COMMISSION",
                    phone: updatedAgent.agentPhone || updatedAgent.phone || "",
                    amount: commissionToAdd,
                    trxId: updatedDeposit.transactionId || "",
                    status: "ACCEPTED",
                    comment: `ডিপোজিট কমিশন (৳${depositAmount} × ${updatedDeposit.agentCommissionRate}% = ৳${commissionToAdd})`,
                    relatedDepositId: updatedDeposit._id,
                  },
                ],
                { session },
              );
            }

            agentUpdateInfo = {
              agentId: updatedAgent._id,
              agentUid: updatedAgent.uid,
              deductedFromMain: depositAmount,
              commissionAdded: commissionToAdd,
            };
          }
        } else {
          newUserBalance = oldUserBalance;
        }
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 },
      );
    } finally {
      await session.endSession();
    }

    // ✅ ট্রানজেকশন সফল হলে Audit Log তৈরি হবে
    if (adminUser) {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const agentDetail = agentUpdateInfo
        ? ` | এজেন্ট ${agentUpdateInfo.agentUid}: ব্যালেন্স থেকে ৳${agentUpdateInfo.deductedFromMain} কাটা, কমিশন ৳${agentUpdateInfo.commissionAdded} যোগ।`
        : "";

      await AuditLog.create({
        adminId: adminUser._id,
        adminPhone: adminUser.phone || adminUser.uid,
        action: status === "approved" ? "APPROVE_DEPOSIT" : "REJECT_DEPOSIT",
        targetUser: targetUserId,
        oldData: {
          depositId: existingDeposit._id,
          amount: existingDeposit.amount,
          status: existingDeposit.status,
          balance: oldUserBalance,
        },
        newData: {
          depositId: depositId,
          amount: existingDeposit.amount,
          status: status,
          balance: newUserBalance,
        },
        details: `অ্যাডমিন (${adminUser.phone || adminUser.uid}) কর্তৃক ${existingDeposit.amount} টাকা ডিপোজিট ${status === "approved" ? `এপ্রুভ করা হয়েছে। ইউজারের ব্যালেন্স ৳${oldUserBalance} থেকে বেড়ে ৳${newUserBalance} হয়েছে।${agentDetail}` : "বাতিল করা হয়েছে।"}`,
        ipAddress: ip,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          status === "approved"
            ? "ডিপোজিট কনফার্ম হয়েছে এবং ব্যালেন্স যোগ করা হয়েছে"
            : "ডিপোজিট বাতিল করা হয়েছে",
        agentUpdate: agentUpdateInfo,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      },
    );
  } catch (error) {
    console.error("Deposit PATCH Error", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
