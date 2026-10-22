import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

// ✅ Supported currencies
const CURRENCIES = ["usdttrc20", "trx", "bnbbsc", "sol"];

export async function GET() {
  try {
    await dbConnect();

    // ✅ Fetch minimums dynamically from NowPayments
    const results = await Promise.all(
      CURRENCIES.map(async (currency) => {
        try {
          const url = `${NOWPAYMENTS_API_URL}/min-amount?currency_from=${currency}&currency_to=usd&fiat_equivalent=usd`;

          const res = await fetch(url, {
            headers: {
              "x-api-key": NOWPAYMENTS_API_KEY,
            },
            cache: "no-store", // ✅ ক্যাশ আটকানোর জন্য
          });

          if (!res.ok) {
            console.warn(
              `Min amount fetch failed for ${currency}:`,
              res.status,
            );
            return { currency, min: null };
          }

          const data = await res.json();

          // ✅ min_amount (crypto) এর বদলে fiat_equivalent (USD) দেখানো হচ্ছে
          const minUsd = Math.ceil(Number(data.fiat_equivalent) || 0);

          return { currency, min: minUsd };
        } catch (err) {
          console.error(`Error for ${currency}:`, err);
          return { currency, min: null };
        }
      }),
    );

    const minimums = {};
    results.forEach(({ currency, min }) => {
      minimums[currency] = min;
    });

    return NextResponse.json({
      success: true,
      minimums,
    });
  } catch (err) {
    console.error("Min amount API error:", err);
    return NextResponse.json({ success: false, minimums: {} }, { status: 500 });
  }
}
