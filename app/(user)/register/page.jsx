"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ১. মূল ফর্ম কম্পোনেন্ট যেখানে useSearchParams ব্যবহার করা হয়েছে
function RegisterForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");

  // ✅ FIX: Double-submit protection (synchronous ref)
  const isSubmittingRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ইউআরএল থেকে বা লোকালস্টোরেজ থেকে রেফারেল কোড ক্যাপচার করা
  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl) {
      setRefCode(refFromUrl);
      localStorage.setItem("referredBy", refFromUrl);
    } else {
      const savedRef = localStorage.getItem("referredBy");
      if (savedRef) setRefCode(savedRef);
    }
  }, [searchParams]);

  // [স্যানিটাইজেশন]: শুধুমাত্র সংখ্যা গ্রহণ করবে এবং ১১ ডিজিটের বেশি হতে দেবে না
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setPhone(val);
    }
  };

  // [স্যানিটাইজেশন]: পিনের জন্য শুধুমাত্র ৪ ডিজিটের সংখ্যা গ্রহণ করবে
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      setPin(val);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ FIX #1: আগেই সাবমিট হয়ে থাকলে সাথে সাথে রিটার্ন
    if (isSubmittingRef.current) return;

    setError("");

    // [ভ্যালিডেশন]: সাবমিট করার আগে ১১ ডিজিট ও ৪ ডিজিটের পিন শিওর করা
    if (phone.length !== 11) {
      setError("ফোন নম্বর বা ইউজার আইডি অবশ্যই ১১ ডিজিটের হতে হবে!");
      return;
    }

    if (pin.length !== 4) {
      setError("পাসওয়ার্ড রিসেট পিন অবশ্যই ৪ ডিজিটের হতে হবে!");
      return;
    }

    // ✅ FIX #2: ref লক + loading state (fetch শুরু হওয়ার আগেই)
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // ফোন, পাসওয়ার্ড, পিন এবং refCode ব্যাকএন্ডে পাঠানো হচ্ছে
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone,
          password,
          pin,
          refCode: refCode || localStorage.getItem("referredBy"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
      }

      // সফল হলে লোকালস্টোরেজে ইউজারের তথ্য সেভ করা এবং রেফারেল ডাটা ক্লিন করা
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("referredBy");
      }

      // ✅ FIX #3: Success lock আটকে থাকে (redirect পর্যন্ত)
      // ক্যাশ বাইপাস করে হোম বা গেম পেজে রিডাইরেক্ট করা
      window.location.replace("/");

      // ⚠️ Success হলে ref লক আটকে থাকে যাতে আর ক্লিক না হয়
      return;
    } catch (err) {
      setError(err.message);

      // ✅ FIX #4: Error হলে ref লক ছেড়ে দিন — আবার try করা যাবে
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400 text-center">
        নতুন অ্যাকাউন্ট তৈরি করুন
      </h2>

      {/* রেফারেল লিংকের মাধ্যমে আসলে নোটিফিকেশন প্রদর্শন */}
      {refCode && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-semibold">
          🎁 আপনি রেফারেল লিংকের মাধ্যমে রেজিস্ট্রেশন করছেন!
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-center text-xs text-rose-400 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">ফোন নম্বর / আইডি</label>
          <input
            type="text"
            inputMode="numeric"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={11}
            placeholder="আপনার ১১ ডিজিটের ফোন নম্বর দিন"
            disabled={loading}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="শক্তিশালী পাসওয়ার্ড দিন"
            disabled={loading}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* পাসওয়ার্ড রিসেট পিন ইনপুট ফিল্ড */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400">
            পাসওয়ার্ড রিসেট পিন (৪ ডিজিট)
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={handlePinChange}
            maxLength={4}
            placeholder="৪ ডিজিটের পিন দিন..."
            disabled={loading}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "প্রসেসিং হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link
          href="/login"
          className="text-emerald-400 font-bold hover:underline"
        >
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}

// ২. ডিফল্ট এক্সপোর্ট পেজ যা Suspense দিয়ে মোড়ানো থাকবে
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-emerald-400 mt-20 font-bold">
          লোড হচ্ছে...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
