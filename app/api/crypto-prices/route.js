import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { verifyAuth } from "@/utils/authCheck";

// 🆕 এটি যোগ করলেই Dynamic Server Error চলে যাবে
export const dynamic = "force-dynamic";

// ক্যাশিংয়ের জন্য revalidate 60 রাখতে পারেন
export const revalidate = 60;

export async function GET() {
  try {
    // ✅ ১. Auth check
    await dbConnect();
    const auth = await verifyAuth("user");
    if (!auth.success) {
      return NextResponse.json(
        { success: false, prices: {}, message: auth.message },
        { status: auth.status },
      );
    }

    // ✅ ২. CoinGecko থেকে prices fetch
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tron,solana,binancecoin&vs_currencies=usd",
      { next: { revalidate: 60 } },
    );
    const data = await res.json();

    return NextResponse.json({
      success: true,
      prices: {
        TRX: data.tron?.usd || 0.15,
        SOL: data.solana?.usd || 150,
        BNB: data.binancecoin?.usd || 600,
      },
    });
  } catch (err) {
    console.error("Crypto price error:", err);
    return NextResponse.json({
      success: false,
      prices: { TRX: 0.15, SOL: 150, BNB: 600 },
    });
  }
}
