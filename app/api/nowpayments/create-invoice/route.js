import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import User from "@/models/User";
import Deposit from "@/models/Deposit";
import Setting from "@/models/Setting";
import { verifyAuth } from "@/utils/authCheck";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ✅ Allowed currencies
const ALLOWED_CURRENCIES = [
  "usdttrc20",
  "usdterc20",
  "usdtbsc",
  "btc",
  "eth",
  "trx",
  "bnbbsc",
  "sol",
  "ltc",
  "doge",
];

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ ১. Auth check
    const auth = await verifyAuth("user");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status },
      );
    }

    const user = auth.user;
    const {
      amount,
      currency = "usd",
      payCurrency = "usdttrc20",
    } = await req.json();

    // ✅ ২. Amount validation (basic)
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক পরিমাণ দিন!" },
        { status: 400 },
      );
    }

    // ✅ ৩. Currency validation
    if (!ALLOWED_CURRENCIES.includes(payCurrency)) {
      return NextResponse.json(
        { success: false, message: "ভুল currency সিলেক্ট করা হয়েছে!" },
        { status: 400 },
      );
    }

    // ✅ ৪. Rate fetch (BDT conversion)
    const rateSetting = await Setting.findOne({ key: "usdToBdtRate" });
    const USD_TO_BDT_RATE = Number(rateSetting?.value) || 120;
    const bdtAmount = Math.round(cleanAmount * USD_TO_BDT_RATE);

    // ✅ ৫. Unique order_id
    const orderId = `DEP-${user.uid}-${Date.now()}`;

    // ✅ ৬. NowPayments API call — Fixed Rate ছাড়া
    const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: cleanAmount,
        price_currency: currency,
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: `Deposit for ${user.uid}`,
        ipn_callback_url: `${APP_URL}/api/nowpayments/webhook`,
        success_url: `${APP_URL}/wallet?payment=success`,
        cancel_url: `${APP_URL}/deposit?payment=cancelled`,
        // ❌ is_fixed_rate সরানো
        // ❌ is_fee_paid_by_user সরানো
        // ❌ MIN_AMOUNTS check সরানো — Frontend API থেকে dynamic minimum আসছে
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NowPayments API error:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "NowPayments API error",
        },
        { status: 400 },
      );
    }

    // ✅ ৭. Pending Deposit record তৈরি
    const existingDeposit = await Deposit.findOne({ transactionId: orderId });
    if (!existingDeposit) {
      await Deposit.create({
        uid: user.uid,
        amount: bdtAmount,
        originalAmount: cleanAmount,
        originalCurrency: "USD",
        exchangeRate: USD_TO_BDT_RATE,
        method: "NowPayments",
        senderNumber: data.pay_address || "PENDING",
        transactionId: orderId,
        status: "pending",
        adminNote: `Invoice created (${payCurrency}) — awaiting payment`,
      });
    }

    // ✅ ৮. Success response
    return NextResponse.json(
      {
        success: true,
        invoice_url: data.invoice_url,
        invoice_id: data.id,
        order_id: orderId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি!" },
      { status: 500 },
    );
  }
}
