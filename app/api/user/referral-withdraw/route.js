// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import clientPromise from "@/lib/mongodb";
// import User from "@/models/User";
// import Withdraw from "@/models/Withdraw";
// import Setting from "@/models/Setting";
// import AgentSettings from "@/models/AgentSettings";
// import bcrypt from "bcryptjs";
// import { verifyAuth } from "@/utils/authCheck";

// const getMethodConfig = (method) => {
//   const upper = String(method || "").toUpperCase();
//   if (upper.includes("TRX") || upper.includes("TRON"))
//     return {
//       isCrypto: true,
//       currency: "USD",
//       minAmount: 5,
//       minAccountLength: 34,
//       maxAccountLength: 34,
//       accountOnlyDigits: false,
//       accountLabel: "TRX Wallet",
//     };
//   if (upper.includes("BINANCE") || upper.includes("USDT"))
//     return {
//       isCrypto: true,
//       currency: "USD",
//       minAmount: 5,
//       minAccountLength: 5,
//       maxAccountLength: 10,
//       accountOnlyDigits: true,
//       accountLabel: "Binance Pay ID",
//     };
//   if (upper.includes("BTC") || upper.includes("BITCOIN"))
//     return {
//       isCrypto: true,
//       currency: "USD",
//       minAmount: 5,
//       minAccountLength: 26,
//       maxAccountLength: 50,
//       accountOnlyDigits: false,
//       accountLabel: "BTC Address",
//     };
//   return {
//     isCrypto: false,
//     currency: "BDT",
//     minAmount: 500,
//     minAccountLength: 11,
//     maxAccountLength: 11,
//     accountOnlyDigits: true,
//     accountLabel: "Mobile Number",
//   };
// };

// export async function POST(request) {
//   const session = await mongoose.startSession();
//   try {
//     await clientPromise;
//     const auth = await verifyAuth("user");
//     if (!auth.success)
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         { status: auth.status },
//       );

//     const body = await request.json();
//     const method = typeof body.method === "string" ? body.method.trim() : "";
//     const rawAccountNumber =
//       typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
//     const parsedAmount = Number(body.amount);
//     const pin = typeof body.pin === "string" ? body.pin.trim() : "";

//     const cfg = getMethodConfig(method);
//     let accountNumber = cfg.accountOnlyDigits
//       ? rawAccountNumber.replace(/\D/g, "")
//       : rawAccountNumber.replace(/[^a-zA-Z0-9]/g, "");

//     if (!body.amount || !method || !accountNumber || !pin)
//       return NextResponse.json(
//         { success: false, message: "তথ্য অসম্পূর্ণ!" },
//         { status: 400 },
//       );
//     if (!/^\d{4}$/.test(pin))
//       return NextResponse.json(
//         { success: false, message: "পিন ৪ সংখ্যার হতে হবে!" },
//         { status: 400 },
//       );

//     const rateSetting = await Setting.findOne({ key: "usdToBdtRate" });
//     const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;
//     const balanceDeduction = cfg.isCrypto
//       ? Math.round(parsedAmount * USD_TO_BDT_RATE)
//       : parsedAmount;

//     if (isNaN(parsedAmount) || parsedAmount < cfg.minAmount)
//       return NextResponse.json(
//         {
//           success: false,
//           message: cfg.isCrypto
//             ? `সর্বনিম্ন $${cfg.minAmount}!`
//             : `সর্বনিম্ন ৳${cfg.minAmount}!`,
//         },
//         { status: 400 },
//       );
//     if (accountNumber.length < cfg.minAccountLength)
//       return NextResponse.json(
//         { success: false, message: `${cfg.accountLabel} সঠিক নয়!` },
//         { status: 400 },
//       );

//     const verifiedMethodName = method;
//     const user = await User.findById(auth.user._id || auth.user.userId);
//     if (!user || user.isBlocked)
//       return NextResponse.json(
//         { success: false, message: "ইউজার পাওয়া যায়নি বা ব্লকড!" },
//         { status: 403 },
//       );

//     const isPinMatch = await bcrypt.compare(pin, user.pin);
//     if (!isPinMatch)
//       return NextResponse.json(
//         { success: false, message: "পিন সঠিক নয়!" },
//         { status: 400 },
//       );

//     const registeredPhone = user.phone || user.uid;
//     if (!cfg.isCrypto && accountNumber !== registeredPhone)
//       return NextResponse.json(
//         { success: false, message: "শুধুমাত্র রেজিস্টার্ড নম্বরে উইথড্র!" },
//         { status: 400 },
//       );

//     if ((Number(user.referralBalance) || 0) < balanceDeduction) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `পর্যাপ্ত রেফারেল বোনাস নেই! আছে ৳${user.referralBalance}`,
//         },
//         { status: 400 },
//       );
//     }

//     let agentUpdateInfo = null;
//     let newReferralBalance = 0;

//     // ✅ ট্রানজেকশন শুরু
//     await session.withTransaction(async () => {
//       // ১. ইউজারের রেফারেল ব্যালেন্স কাটা
//       const updatedUser = await User.findOneAndUpdate(
//         { _id: user._id, referralBalance: { $gte: balanceDeduction } },
//         { $inc: { referralBalance: -balanceDeduction } },
//         { returnDocument: "after", session },
//       );
//       if (!updatedUser) throw new Error("ব্যালেন্স কাটতে সমস্যা!");
//       newReferralBalance = updatedUser.referralBalance;

//       // ২. এজেন্ট খোঁজা (যার এই মেথড আছে এবং পর্যাপ্ত ব্যালেন্স আছে)
//       const availableAgents = await User.find({
//         role: "agent",
//         agentIsActive: true,
//         agentIsBlocked: false,
//         agentPhone: { $ne: "" },
//         "agentPaymentAccounts.method": {
//           $regex: new RegExp(`^${verifiedMethodName}$`, "i"),
//         },
//         agentMainBalance: { $gte: balanceDeduction },
//       })
//         .select("_id agentMainBalance agentWithdrawCommission")
//         .sort({ agentMainBalance: -1 })
//         .limit(1)
//         .session(session);

//       if (!availableAgents || availableAgents.length === 0) {
//         throw new Error(
//           `দুঃখিত! এই মেথডে পর্যাপ্ত ব্যালেন্সওয়ালা এজেন্ট নেই।`,
//         );
//       }
//       const selectedAgent = availableAgents[0];

//       // ৩. এজেন্টের ব্যালেন্স কাটা এবং কমিশন যোগ
//       const agentSettings = await AgentSettings.getSettings();
//       const withdrawCommissionRate =
//         selectedAgent.agentWithdrawCommission ??
//         agentSettings.defaultWithdrawCommission ??
//         0;
//       const agentCommission = Math.round(
//         (balanceDeduction * withdrawCommissionRate) / 100,
//       );

//       const updatedAgent = await User.findOneAndUpdate(
//         {
//           _id: selectedAgent._id,
//           agentMainBalance: { $gte: balanceDeduction },
//         },
//         {
//           $inc: {
//             agentMainBalance: -balanceDeduction,
//             agentCommissionBalance: agentCommission,
//           },
//         },
//         { session },
//       );
//       if (!updatedAgent) throw new Error("এজেন্টের ব্যালেন্স আপডেট সমস্যা!");

//       agentUpdateInfo = {
//         agentId: selectedAgent._id,
//         agentCommissionRate: withdrawCommissionRate,
//         agentCommission: agentCommission,
//       };

//       // ৪. ✅ Withdraw রেকর্ড তৈরি (ট্রানজেকশনের ভেতরেই)
//       await Withdraw.create(
//         [
//           {
//             uid: user.uid,
//             phone: user.phone,
//             amount: parsedAmount,
//             deductedBDT: balanceDeduction,
//             originalAmount: parsedAmount,
//             originalCurrency: cfg.currency,
//             exchangeRate: cfg.isCrypto ? USD_TO_BDT_RATE : 1,
//             currency: cfg.currency,
//             isCrypto: cfg.isCrypto,
//             method: verifiedMethodName,
//             accountNumber: cfg.isCrypto ? accountNumber : registeredPhone,
//             walletType: "referral",
//             status: "pending",
//             agentId: agentUpdateInfo.agentId,
//             agentCommissionRate: agentUpdateInfo.agentCommissionRate,
//             agentCommission: agentUpdateInfo.agentCommission,
//             agentCommissionPaid: true,
//           },
//         ],
//         { session },
//       ); // 👈 session পাস করা হয়েছে
//     });

//     return NextResponse.json(
//       { success: true, message: "✅ রেফারেল উইথড্র সফল!", newReferralBalance },
//       { status: 200 },
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message || "সার্ভার ত্রুটি!" },
//       { status: 400 },
//     );
//   } finally {
//     await session.endSession();
//   }
// }
// /////////////////////////////////////////////////////////////////////
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";
import Withdraw from "@/models/Withdraw";
import Setting from "@/models/Setting";
import AgentSettings from "@/models/AgentSettings";
import bcrypt from "bcryptjs";
import { verifyAuth } from "@/utils/authCheck";

const getMethodConfig = (method) => {
  const upper = String(method || "").toUpperCase();

  // ✅ ১. USDT TRC20 / TRX TRON (৩৪ অক্ষর)
  if (
    (upper.includes("USDT") && upper.includes("TRC20")) ||
    upper.includes("TRX") ||
    upper.includes("TRON")
  ) {
    return {
      isCrypto: true,
      currency: "USD",
      minAmount: 5,
      minAccountLength: 34,
      maxAccountLength: 34,
      accountOnlyDigits: false,
      accountLabel: "TRX / USDT (TRC20) Wallet",
    };
  }

  // ✅ ২. BNB / BSC / BEP20 / USDT BEP20 (৪২ অক্ষর)
  if (
    (upper.includes("USDT") && upper.includes("BEP20")) ||
    upper.includes("BNB") ||
    upper.includes("BSC") ||
    upper.includes("BEP20")
  ) {
    return {
      isCrypto: true,
      currency: "USD",
      minAmount: 5,
      minAccountLength: 42,
      maxAccountLength: 42,
      accountOnlyDigits: false,
      accountLabel: "BNB / USDT (BEP20) Wallet",
    };
  }

  // ✅ ৩. BINANCE PAY ID
  if (upper.includes("BINANCE")) {
    return {
      isCrypto: true,
      currency: "USD",
      minAmount: 5,
      minAccountLength: 5,
      maxAccountLength: 15,
      accountOnlyDigits: true,
      accountLabel: "Binance Pay ID",
    };
  }

  // ✅ ৪. BTC
  if (upper.includes("BTC") || upper.includes("BITCOIN")) {
    return {
      isCrypto: true,
      currency: "USD",
      minAmount: 5,
      minAccountLength: 26,
      maxAccountLength: 50,
      accountOnlyDigits: false,
      accountLabel: "BTC Address",
    };
  }

  // ✅ ৫. ETH
  if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
    return {
      isCrypto: true,
      currency: "USD",
      minAmount: 5,
      minAccountLength: 42,
      maxAccountLength: 42,
      accountOnlyDigits: false,
      accountLabel: "ETH Wallet",
    };
  }

  // ✅ ৬. ডিফল্ট (Mobile Banking)
  return {
    isCrypto: false,
    currency: "BDT",
    minAmount: 500,
    minAccountLength: 11,
    maxAccountLength: 11,
    accountOnlyDigits: true,
    accountLabel: "Mobile Number",
  };
};

export async function POST(request) {
  const session = await mongoose.startSession();
  try {
    await clientPromise;
    const auth = await verifyAuth("user");
    if (!auth.success)
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );

    const body = await request.json();
    const method = typeof body.method === "string" ? body.method.trim() : "";
    const rawAccountNumber =
      typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
    const parsedAmount = Number(body.amount);
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    const cfg = getMethodConfig(method);
    let accountNumber = cfg.accountOnlyDigits
      ? rawAccountNumber.replace(/\D/g, "")
      : rawAccountNumber.replace(/[^a-zA-Z0-9]/g, "");

    if (!body.amount || !method || !accountNumber || !pin)
      return NextResponse.json(
        { success: false, message: "তথ্য অসম্পূর্ণ!" },
        { status: 400 },
      );
    if (!/^\d{4}$/.test(pin))
      return NextResponse.json(
        { success: false, message: "পিন ৪ সংখ্যার হতে হবে!" },
        { status: 400 },
      );

    const rateSetting = await Setting.findOne({ key: "usdToBdtRate" });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;
    const balanceDeduction = cfg.isCrypto
      ? Math.round(parsedAmount * USD_TO_BDT_RATE)
      : parsedAmount;

    if (isNaN(parsedAmount) || parsedAmount < cfg.minAmount)
      return NextResponse.json(
        {
          success: false,
          message: cfg.isCrypto
            ? `সর্বনিম্ন $${cfg.minAmount}!`
            : `সর্বনিম্ন ৳${cfg.minAmount}!`,
        },
        { status: 400 },
      );
    if (accountNumber.length < cfg.minAccountLength)
      return NextResponse.json(
        { success: false, message: `${cfg.accountLabel} সঠিক নয়!` },
        { status: 400 },
      );

    const verifiedMethodName = method;
    const user = await User.findById(auth.user._id || auth.user.userId);
    if (!user || user.isBlocked)
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি বা ব্লকড!" },
        { status: 403 },
      );

    const isPinMatch = await bcrypt.compare(pin, user.pin);
    if (!isPinMatch)
      return NextResponse.json(
        { success: false, message: "পিন সঠিক নয়!" },
        { status: 400 },
      );

    const registeredPhone = user.phone || user.uid;
    if (!cfg.isCrypto && accountNumber !== registeredPhone)
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র রেজিস্টার্ড নম্বরে উইথড্র!" },
        { status: 400 },
      );

    if ((Number(user.referralBalance) || 0) < balanceDeduction) {
      return NextResponse.json(
        {
          success: false,
          message: `পর্যাপ্ত রেফারেল বোনাস নেই! আছে ৳${user.referralBalance}`,
        },
        { status: 400 },
      );
    }

    let agentUpdateInfo = null;
    let newReferralBalance = 0;

    // ✅ ট্রানজেকশন শুরু
    await session.withTransaction(async () => {
      // ১. ইউজারের রেফারেল ব্যালেন্স কাটা
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id, referralBalance: { $gte: balanceDeduction } },
        { $inc: { referralBalance: -balanceDeduction } },
        { returnDocument: "after", session },
      );
      if (!updatedUser) throw new Error("ব্যালেন্স কাটতে সমস্যা!");
      newReferralBalance = updatedUser.referralBalance;

      // ২. এজেন্ট খোঁজা (যার এই মেথড আছে এবং পর্যাপ্ত ব্যালেন্স আছে)
      const availableAgents = await User.find({
        role: "agent",
        agentIsActive: true,
        agentIsBlocked: false,
        agentPhone: { $ne: "" },
        "agentPaymentAccounts.method": {
          $regex: new RegExp(`^${verifiedMethodName}$`, "i"),
        },
        agentMainBalance: { $gte: balanceDeduction },
      })
        .select("_id agentMainBalance agentWithdrawCommission")
        .sort({ agentMainBalance: -1 })
        .limit(1)
        .session(session);

      if (!availableAgents || availableAgents.length === 0) {
        throw new Error(
          `দুঃখিত! এই মেথডে পর্যাপ্ত ব্যালেন্সওয়ালা এজেন্ট নেই।`,
        );
      }
      const selectedAgent = availableAgents[0];

      // ৩. এজেন্টের ব্যালেন্স কাটা এবং কমিশন যোগ
      const agentSettings = await AgentSettings.getSettings();
      const withdrawCommissionRate =
        selectedAgent.agentWithdrawCommission ??
        agentSettings.defaultWithdrawCommission ??
        0;
      const agentCommission = Math.round(
        (balanceDeduction * withdrawCommissionRate) / 100,
      );

      const updatedAgent = await User.findOneAndUpdate(
        {
          _id: selectedAgent._id,
          agentMainBalance: { $gte: balanceDeduction },
        },
        {
          $inc: {
            agentMainBalance: -balanceDeduction,
            agentCommissionBalance: agentCommission,
          },
        },
        { session },
      );
      if (!updatedAgent) throw new Error("এজেন্টের ব্যালেন্স আপডেট সমস্যা!");

      agentUpdateInfo = {
        agentId: selectedAgent._id,
        agentCommissionRate: withdrawCommissionRate,
        agentCommission: agentCommission,
      };

      // ৪. ✅ Withdraw রেকর্ড তৈরি (ট্রানজেকশনের ভেতরেই)
      await Withdraw.create(
        [
          {
            uid: user.uid,
            phone: user.phone,
            amount: parsedAmount,
            deductedBDT: balanceDeduction,
            originalAmount: parsedAmount,
            originalCurrency: cfg.currency,
            exchangeRate: cfg.isCrypto ? USD_TO_BDT_RATE : 1,
            currency: cfg.currency,
            isCrypto: cfg.isCrypto,
            method: verifiedMethodName,
            accountNumber: cfg.isCrypto ? accountNumber : registeredPhone,
            walletType: "referral",
            status: "pending",
            agentId: agentUpdateInfo.agentId,
            agentCommissionRate: agentUpdateInfo.agentCommissionRate,
            agentCommission: agentUpdateInfo.agentCommission,
            agentCommissionPaid: true,
          },
        ],
        { session },
      ); // 👈 session পাস করা হয়েছে
    });

    return NextResponse.json(
      { success: true, message: "✅ রেফারেল উইথড্র সফল!", newReferralBalance },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "সার্ভার ত্রুটি!" },
      { status: 400 },
    );
  } finally {
    await session.endSession();
  }
}
