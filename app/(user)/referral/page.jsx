// // // "use client";
// // // import { useState, useEffect, useRef } from "react";
// // // import { useRouter } from "next/navigation";
// // // import { createPortal } from "react-dom";
// // // import ActionButton from "./ActionButton";

// // // // ==========================================
// // // // ✅ Method-specific Config
// // // // ==========================================
// // // const getMethodConfig = (method) => {
// // //   const upper = String(method || "").toUpperCase();

// // //   if (upper.includes("TRX") || upper.includes("TRON")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 5",
// // //       accountLabel: "আপনার TRX Wallet Address",
// // //       accountPlaceholder: "TXYZ... (৩৪ character)",
// // //       accountLocked: false,
// // //       accountMinLength: 34,
// // //       accountMaxLength: 34,
// // //       accountOnlyDigits: false,
// // //     };
// // //   }

// // //   if (upper.includes("BINANCE") || upper.includes("USDT")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 5",
// // //       accountLabel: "আপনার Binance Pay ID",
// // //       accountPlaceholder: "541254656",
// // //       accountLocked: false,
// // //       accountMinLength: 5,
// // //       accountMaxLength: 10,
// // //       accountOnlyDigits: true,
// // //     };
// // //   }

// // //   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 5",
// // //       accountLabel: "আপনার Bitcoin Wallet Address",
// // //       accountPlaceholder: "bc1... or 1...",
// // //       accountLocked: false,
// // //       accountMinLength: 26,
// // //       accountMaxLength: 50,
// // //       accountOnlyDigits: false,
// // //     };
// // //   }

// // //   return {
// // //     isCrypto: false,
// // //     currency: "BDT",
// // //     amountLabel: "অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)",
// // //     amountPlaceholder: "সর্বনিম্ন ৫০০ টাকা লিখুন",
// // //     accountLabel: "একাউন্ট নাম্বার (রেজিস্টার্ড)",
// // //     accountPlaceholder: "01700000000",
// // //     accountLocked: true,
// // //     accountMinLength: 11,
// // //     accountMaxLength: 11,
// // //     accountOnlyDigits: true,
// // //   };
// // // };
// // // // ==========================================

// // // export default function ReferralPage() {
// // //   const [user, setUser] = useState({
// // //     uid: "",
// // //     phone: "",
// // //     referralBalance: 0,
// // //     referralCode: "",
// // //   });
// // //   const [amount, setAmount] = useState("");

// // //   // 🆕 এজেন্টের মেথড স্টেট
// // //   const [withdrawMethods, setWithdrawMethods] = useState([]);
// // //   const [method, setMethod] = useState("");

// // //   const [accountNumber, setAccountNumber] = useState("");
// // //   const [pin, setPin] = useState("");
// // //   const [toast, setToast] = useState({ show: false, text: "", success: false });
// // //   const [usdToBdtRate, setUsdToBdtRate] = useState(120);
// // //   const [mounted, setMounted] = useState(false);

// // //   const router = useRouter();
// // //   const methodConfig = getMethodConfig(method);

// // //   // ✅ Double-click protection (synchronous)
// // //   const submittingRef = useRef(false);
// // //   // ✅ Success lock (সফল হওয়ার পর ২.৫s ক্লিক আটকাবে)
// // //   const successLockRef = useRef(false);
// // //   // ✅ FIX: toast + success timer ref-এ track (memory leak fix)
// // //   const toastTimerRef = useRef(null);
// // //   const successTimerRef = useRef(null);

// // //   useEffect(() => {
// // //     setMounted(true);
// // //   }, []);

// // //   // ✅ FIX: unmount-এ সব timer clear
// // //   useEffect(() => {
// // //     return () => {
// // //       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// // //       if (successTimerRef.current) clearTimeout(successTimerRef.current);
// // //     };
// // //   }, []);

// // //   // ✅ FIX: showToast-এ previous timer clear (race condition fix)
// // //   const showToast = (text, success = true) => {
// // //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// // //     setToast({ show: true, text, success });
// // //     toastTimerRef.current = setTimeout(() => {
// // //       setToast({ show: false, text: "", success: false });
// // //       toastTimerRef.current = null;
// // //     }, 3500);
// // //   };

// // //   const handlePinChange = (e) => {
// // //     const val = e.target.value.replace(/\D/g, "");
// // //     if (val.length <= 4) setPin(val);
// // //   };

// // //   useEffect(() => {
// // //     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
// // //     if (!savedUser.uid && !savedUser.phone) {
// // //       router.push("/login");
// // //       return;
// // //     }

// // //     setUser({
// // //       ...savedUser,
// // //       balance: Number(savedUser.balance) || 0,
// // //       turnover: Number(savedUser.turnover) || 0,
// // //       referralBalance: Number(savedUser.referralBalance) || 0,
// // //     });

// // //     fetch("/api/game/get-user", { credentials: "include" })
// // //       .then((res) => res.json())
// // //       .then((data) => {
// // //         if (data.success) {
// // //           const freshUser = {
// // //             ...savedUser,
// // //             uid: data.uid,
// // //             phone: data.phone,
// // //             balance: Number(data.balance) || 0,
// // //             turnover: Number(data.turnover) || 0,
// // //             referralBalance: Number(data.referralBalance) || 0,
// // //             referralCode: data.referralCode || data.uid,
// // //           };
// // //           setUser(freshUser);
// // //           localStorage.setItem("user", JSON.stringify(freshUser));

// // //           if (data.usdToBdtRate) {
// // //             setUsdToBdtRate(Number(data.usdToBdtRate) || 120);
// // //           }
// // //         }
// // //       })
// // //       .catch((err) => console.error("Referral fetch error:", err));

// // //     // 🆕 এজেন্টদের সব মেথড লোড করা (শুধু মেথডের নাম, এজেন্টের নাম ছাড়া)
// // //     fetch("/api/user/agent-list", { credentials: "include" })
// // //       .then((res) => res.json())
// // //       .then((data) => {
// // //         if (data.success && data.agents && data.agents.length > 0) {
// // //           const uniqueMethods = [];
// // //           const seen = new Set();

// // //           // ✅ সব এজেন্টের সব মেথড একসাথে বের করা
// // //           data.agents.forEach((agent) => {
// // //             if (agent.paymentAccounts && agent.paymentAccounts.length > 0) {
// // //               agent.paymentAccounts.forEach((acc) => {
// // //                 const cleanMethod = String(acc.method || "").trim();

// // //                 // ❌ ভুল মেথড (শুধু সংখ্যা বা খুব ছোট) বাদ দেওয়া
// // //                 const isJustNumbers = /^\d+$/.test(cleanMethod);
// // //                 const isTooShort = cleanMethod.length < 3;

// // //                 // ✅ শুধু ইউনিক ও সঠিক মেথড লিস্টে যোগ করা
// // //                 if (!isJustNumbers && !isTooShort && !seen.has(cleanMethod)) {
// // //                   seen.add(cleanMethod);
// // //                   uniqueMethods.push(cleanMethod);
// // //                 }
// // //               });
// // //             }
// // //           });

// // //           setWithdrawMethods(uniqueMethods);

// // //           if (uniqueMethods.length > 0) {
// // //             const firstMethod = uniqueMethods[0];
// // //             const cfg = getMethodConfig(firstMethod);

// // //             setMethod(firstMethod);
// // //             setAccountNumber(
// // //               cfg.accountLocked ? savedUser.phone || savedUser.uid || "" : "",
// // //             );
// // //             setAmount("");
// // //             setPin("");
// // //           }
// // //         } else {
// // //           setWithdrawMethods([]);
// // //           setMethod("");
// // //         }
// // //       })
// // //       .catch((err) => {
// // //         console.error("❌ Agent methods fetch error:", err);
// // //         setWithdrawMethods([]);
// // //         setMethod("");
// // //       });
// // //   }, [router]);

// // //   const referralLink =
// // //     typeof window !== "undefined"
// // //       ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}`
// // //       : "";

// // //   const handleCopyLink = async () => {
// // //     try {
// // //       if (navigator.clipboard && window.isSecureContext) {
// // //         await navigator.clipboard.writeText(referralLink);
// // //       } else {
// // //         const textarea = document.createElement("textarea");
// // //         textarea.value = referralLink;
// // //         textarea.style.position = "fixed";
// // //         textarea.style.opacity = "0";
// // //         document.body.appendChild(textarea);
// // //         textarea.select();
// // //         document.execCommand("copy");
// // //         document.body.removeChild(textarea);
// // //       }
// // //       return true;
// // //     } catch (err) {
// // //       showToast("কপি ব্যর্থ হয়েছে!", false);
// // //       return false;
// // //     }
// // //   };

// // //   const handleMethodChange = (newMethod) => {
// // //     setMethod(newMethod);
// // //     const cfg = getMethodConfig(newMethod);

// // //     setAccountNumber(cfg.accountLocked ? user.phone || user.uid || "" : "");
// // //     setAmount("");
// // //     setPin("");
// // //   };

// // //   const handleAccountChange = (value) => {
// // //     let sanitized = value;
// // //     if (methodConfig.accountOnlyDigits) {
// // //       sanitized = value.replace(/\D/g, "");
// // //     } else {
// // //       sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
// // //     }
// // //     if (sanitized.length <= methodConfig.accountMaxLength) {
// // //       setAccountNumber(sanitized);
// // //     }
// // //   };

// // //   const handleReferralWithdraw = async () => {
// // //     // ✅ Synchronous lock
// // //     if (submittingRef.current || successLockRef.current) {
// // //       return { success: false };
// // //     }
// // //     submittingRef.current = true;

// // //     try {
// // //       if (pin.length !== 4) {
// // //         showToast(
// // //           "উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!",
// // //           false,
// // //         );
// // //         return { success: false };
// // //       }

// // //       const cleanAmount = Number(amount);
// // //       const cleanAccountNumber = accountNumber.trim();
// // //       const registeredNumber = user.phone || user.uid;

// // //       if (methodConfig.accountLocked) {
// // //         if (cleanAccountNumber !== user.phone) {
// // //           showToast(
// // //             "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
// // //             false,
// // //           );
// // //           return { success: false };
// // //         }
// // //       } else {
// // //         if (cleanAccountNumber.length < methodConfig.accountMinLength) {
// // //           showToast(
// // //             `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
// // //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// // //             }!`,
// // //             false,
// // //           );
// // //           return { success: false };
// // //         }
// // //         if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
// // //           showToast(
// // //             `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
// // //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// // //             }!`,
// // //             false,
// // //           );
// // //           return { success: false };
// // //         }
// // //       }

// // //       const minAmount = methodConfig.isCrypto ? 5 : 500;
// // //       if (isNaN(cleanAmount) || cleanAmount < minAmount) {
// // //         showToast(
// // //           methodConfig.isCrypto
// // //             ? `সর্বনিম্ন উইথড্র $${minAmount}!`
// // //             : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
// // //           false,
// // //         );
// // //         return { success: false };
// // //       }

// // //       const bdtEquivalent = methodConfig.isCrypto
// // //         ? cleanAmount * usdToBdtRate
// // //         : cleanAmount;

// // //       if (bdtEquivalent > (Number(user.referralBalance) || 0)) {
// // //         showToast(
// // //           methodConfig.isCrypto
// // //             ? `পর্যাপ্ত বোনাস নেই! প্রয়োজন ৳${bdtEquivalent.toFixed(0)} ($${cleanAmount} × ৳${usdToBdtRate}), আছে ৳${user.referralBalance}`
// // //             : "আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!",
// // //           false,
// // //         );
// // //         return { success: false };
// // //       }

// // //       const res = await fetch("/api/user/referral-withdraw", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         credentials: "include",
// // //         body: JSON.stringify({
// // //           amount: cleanAmount,
// // //           method, // 🆕 এজেন্টের মেথডের নাম
// // //           accountNumber: methodConfig.accountLocked
// // //             ? registeredNumber
// // //             : cleanAccountNumber,
// // //           pin,
// // //         }),
// // //       });

// // //       const data = await res.json();
// // //       if (data.success) {
// // //         // ✅ SUCCESS LOCK
// // //         successLockRef.current = true;

// // //         setAmount("");
// // //         setPin("");

// // //         if (!methodConfig.accountLocked) {
// // //           setAccountNumber("");
// // //         } else {
// // //           setAccountNumber(user.phone || user.uid || "");
// // //         }

// // //         if (data.newReferralBalance !== undefined) {
// // //           const updatedUser = {
// // //             ...user,
// // //             referralBalance: Number(data.newReferralBalance) || 0,
// // //           };
// // //           setUser(updatedUser);
// // //           localStorage.setItem("user", JSON.stringify(updatedUser));
// // //         } else {
// // //           const updatedBalance =
// // //             (Number(user.referralBalance) || 0) - bdtEquivalent;
// // //           const updatedUser = { ...user, referralBalance: updatedBalance };
// // //           setUser(updatedUser);
// // //           localStorage.setItem("user", JSON.stringify(updatedUser));
// // //         }

// // //         // ✅ FIX: success timer ref-এ track
// // //         successTimerRef.current = setTimeout(() => {
// // //           successLockRef.current = false;
// // //           successTimerRef.current = null;
// // //         }, 2500);

// // //         return {
// // //           success: true,
// // //           message:
// // //             data.message ||
// // //             `উইথড্র সফল! $${cleanAmount} (ব্যালেন্স থেকে ৳${bdtEquivalent.toFixed(0)} কেটেছে)`,
// // //         };
// // //       } else {
// // //         showToast(data.message || "উইথড্র ব্যর্থ হয়েছে।", false);
// // //         return { success: false };
// // //       }
// // //     } catch (err) {
// // //       showToast("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false);
// // //       return { success: false };
// // //     } finally {
// // //       submittingRef.current = false;
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
// // //       {/* ✅ React Portal দিয়ে toast */}
// // //       {mounted &&
// // //         toast.show &&
// // //         createPortal(
// // //           <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none px-4">
// // //             <div
// // //               className={`flex flex-col items-center gap-3 border-2 rounded-2xl backdrop-blur-md px-6 py-5 shadow-2xl w-full max-w-[320px] ${
// // //                 toast.success
// // //                   ? "border-emerald-500 bg-slate-900/95 shadow-emerald-500/40"
// // //                   : "border-rose-500 bg-slate-900/95 shadow-rose-500/40"
// // //               }`}
// // //             >
// // //               <div
// // //                 className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
// // //                   toast.success
// // //                     ? "bg-emerald-500 shadow-emerald-500/50"
// // //                     : "bg-rose-500 shadow-rose-500/50"
// // //                 }`}
// // //               >
// // //                 {toast.success ? (
// // //                   <svg
// // //                     className="w-5 h-5 text-white"
// // //                     fill="none"
// // //                     stroke="currentColor"
// // //                     strokeWidth="3"
// // //                     viewBox="0 0 24 24"
// // //                   >
// // //                     <path
// // //                       strokeLinecap="round"
// // //                       strokeLinejoin="round"
// // //                       d="M5 13l4 4L19 7"
// // //                     />
// // //                   </svg>
// // //                 ) : (
// // //                   <svg
// // //                     className="w-5 h-5 text-white"
// // //                     fill="none"
// // //                     stroke="currentColor"
// // //                     strokeWidth="2.5"
// // //                     viewBox="0 0 24 24"
// // //                   >
// // //                     <path
// // //                       strokeLinecap="round"
// // //                       strokeLinejoin="round"
// // //                       d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// // //                     />
// // //                   </svg>
// // //                 )}
// // //               </div>
// // //               <p
// // //                 className={`font-bold text-sm text-center leading-snug ${
// // //                   toast.success ? "text-emerald-400" : "text-rose-400"
// // //                 }`}
// // //               >
// // //                 {toast.text}
// // //               </p>
// // //             </div>
// // //           </div>,
// // //           document.body,
// // //         )}

// // //       <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
// // //         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
// // //           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
// // //             <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
// // //           </h2>
// // //           <button
// // //             // ✅ FIX: history না থাকলে home-এ fallback
// // //             onClick={() => {
// // //               if (typeof window !== "undefined" && window.history.length > 1) {
// // //                 router.back();
// // //               } else {
// // //                 router.push("/");
// // //               }
// // //             }}
// // //             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
// // //           >
// // //             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
// // //           </button>
// // //         </div>

// // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
// // //           <div className="space-y-4 md:space-y-6">
// // //             <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
// // //               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
// // //               <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">
// // //                 উপলব্ধ রেফারেল বোনাস
// // //               </p>
// // //               {/* ✅ ফন্ট সাইজ ছোট করা হয়েছে */}
// // //               <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-2 truncate">
// // //                 ৳{Number(user.referralBalance || 0).toFixed(2)}
// // //               </h1>
// // //             </div>

// // //             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
// // //               <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
// // //                 <i className="fa-solid fa-link text-emerald-400"></i> আপনার
// // //                 রেফারেল লিংক
// // //               </h3>
// // //               <div className="flex flex-col gap-2">
// // //                 <input
// // //                   type="text"
// // //                   readOnly
// // //                   value={referralLink}
// // //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
// // //                 />

// // //                 <ActionButton
// // //                   onClick={handleCopyLink}
// // //                   successCard={{ text: "রেফারেল সফলভাবে কপি হয়েছে!" }}
// // //                   successFloating={true}
// // //                   icon={<i className="fa-solid fa-copy"></i>}
// // //                   loadingText="কপি হচ্ছে..."
// // //                   className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer"
// // //                 >
// // //                   কপি করুন
// // //                 </ActionButton>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
// // //             <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
// // //               <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস
// // //               উইথড্র
// // //             </h3>

// // //             <div className="space-y-4">
// // //               <div className="space-y-1.5">
// // //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// // //                   উইথড্র পদ্ধতি
// // //                 </label>
// // //                 <select
// // //                   value={method}
// // //                   onChange={(e) => handleMethodChange(e.target.value)}
// // //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
// // //                 >
// // //                   {withdrawMethods.length === 0 ? (
// // //                     <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
// // //                   ) : (
// // //                     withdrawMethods.map((m, index) => (
// // //                       <option key={index} value={m}>
// // //                         {m}
// // //                       </option>
// // //                     ))
// // //                   )}
// // //                 </select>
// // //               </div>

// // //               <div className="space-y-1.5">
// // //                 <div className="flex justify-between items-center">
// // //                   <label className="text-xs md:text-sm text-slate-400 font-semibold">
// // //                     {methodConfig.accountLabel}
// // //                   </label>
// // //                   {methodConfig.accountLocked ? (
// // //                     <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
// // //                       <i className="fa-solid fa-lock"></i> লক
// // //                     </span>
// // //                   ) : (
// // //                     <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
// // //                       {methodConfig.accountMinLength}-
// // //                       {methodConfig.accountMaxLength}{" "}
// // //                       {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
// // //                     </span>
// // //                   )}
// // //                 </div>
// // //                 <input
// // //                   type="text"
// // //                   value={accountNumber}
// // //                   onChange={(e) => handleAccountChange(e.target.value)}
// // //                   readOnly={methodConfig.accountLocked}
// // //                   maxLength={methodConfig.accountMaxLength}
// // //                   placeholder={methodConfig.accountPlaceholder}
// // //                   className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs md:text-sm font-mono ${
// // //                     methodConfig.accountLocked
// // //                       ? "text-slate-400 cursor-not-allowed select-none"
// // //                       : "text-white focus:outline-none focus:border-emerald-500"
// // //                   }`}
// // //                 />

// // //                 {/* ✅✅✅ NEW: Live Counter — শুধু TRX এবং Binance এর জন্য */}
// // //                 {!methodConfig.accountLocked &&
// // //                   (() => {
// // //                     const upper = String(method || "").toUpperCase();
// // //                     const isTRX =
// // //                       upper.includes("TRX") || upper.includes("TRON");
// // //                     const isBinance =
// // //                       upper.includes("BINANCE") || upper.includes("USDT");
// // //                     if (!isTRX && !isBinance) return null;

// // //                     return (
// // //                       <div className="flex items-center justify-between mt-1.5 px-1">
// // //                         <span className="text-[10px] text-slate-500">
// // //                           {methodConfig.accountOnlyDigits
// // //                             ? "শুধু সংখ্যা গ্রহণযোগ্য"
// // //                             : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
// // //                         </span>
// // //                         <span
// // //                           className={`text-[10px] font-mono font-bold transition-colors ${
// // //                             accountNumber.length ===
// // //                             methodConfig.accountMaxLength
// // //                               ? "text-emerald-400"
// // //                               : accountNumber.length > 0
// // //                                 ? "text-amber-400"
// // //                                 : "text-slate-500"
// // //                           }`}
// // //                         >
// // //                           {accountNumber.length}/{methodConfig.accountMaxLength}
// // //                         </span>
// // //                       </div>
// // //                     );
// // //                   })()}
// // //               </div>

// // //               <div className="space-y-1.5">
// // //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// // //                   {methodConfig.amountLabel}
// // //                 </label>
// // //                 <input
// // //                   type="number"
// // //                   step="any"
// // //                   min="1"
// // //                   placeholder={methodConfig.amountPlaceholder}
// // //                   value={amount}
// // //                   onChange={(e) => {
// // //                     const val = e.target.value;
// // //                     if (val === "" || Number(val) >= 0) setAmount(val);
// // //                   }}
// // //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
// // //                 />
// // //                 {methodConfig.isCrypto && amount && (
// // //                   <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
// // //                     ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 =
// // //                     ৳{usdToBdtRate})
// // //                   </p>
// // //                 )}
// // //               </div>

// // //               <div className="space-y-1.5">
// // //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// // //                   ৪ ডিজিটের সিকিউরিটি পিন
// // //                 </label>
// // //                 <input
// // //                   type="password"
// // //                   inputMode="numeric"
// // //                   maxLength={4}
// // //                   placeholder="আপনার ৪ ডিজিটের পিন দিন"
// // //                   value={pin}
// // //                   onChange={handlePinChange}
// // //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
// // //                 />
// // //               </div>

// // //               <ActionButton
// // //                 type="button"
// // //                 disabled={withdrawMethods.length === 0}
// // //                 onClick={handleReferralWithdraw}
// // //                 successCard={{ text: "উইথড্র সফল হয়েছে!" }}
// // //                 successFloating={true}
// // //                 icon={<i className="fa-solid fa-paper-plane"></i>}
// // //                 loadingText="প্রসেসিং হচ্ছে..."
// // //                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-950/50 cursor-pointer mt-2"
// // //               >
// // //                 উইথড্র রিকোয়েস্ট পাঠান
// // //               </ActionButton>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // ///////////////////////////////////////////////////////////////////////////
// // "use client";
// // import { useState, useEffect, useRef } from "react";
// // import { useRouter } from "next/navigation";
// // import { createPortal } from "react-dom";
// // import ActionButton from "./ActionButton";

// // // ==========================================
// // // ✅ Method-specific Config
// // // ==========================================
// // const getMethodConfig = (method) => {
// //   const upper = String(method || "").toUpperCase();

// //   // ✅ ১. TRX / TRON / USDT TRC20
// //   if (
// //     upper.includes("TRX") ||
// //     upper.includes("TRON") ||
// //     (upper.includes("USDT") && upper.includes("TRC20"))
// //   ) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার TRX/USDT (TRC20) Wallet Address",
// //       accountPlaceholder: "TXYZ... (৩৪ character)",
// //       accountLocked: false,
// //       accountMinLength: 34,
// //       accountMaxLength: 34,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ২. BINANCE / USDT
// //   if (upper.includes("BINANCE")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার Binance Pay ID",
// //       accountPlaceholder: "541254656",
// //       accountLocked: false,
// //       accountMinLength: 5,
// //       accountMaxLength: 15,
// //       accountOnlyDigits: true,
// //     };
// //   }

// //   // ✅ ৩. BNB / BSC / BEP20 / USDT BEP20
// //   if (
// //     upper.includes("BNB") ||
// //     upper.includes("BSC") ||
// //     upper.includes("BEP20") ||
// //     (upper.includes("USDT") && upper.includes("BEP20"))
// //   ) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার BNB/BEP20 Wallet Address",
// //       accountPlaceholder: "BNB Wallet Address",
// //       accountLocked: false,
// //       accountMinLength: 26,
// //       accountMaxLength: 50,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৪. BTC
// //   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার Bitcoin Wallet Address",
// //       accountPlaceholder: "bc1... or 1...",
// //       accountLocked: false,
// //       accountMinLength: 26,
// //       accountMaxLength: 50,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৫. ETH
// //   if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার ETH Wallet Address",
// //       accountPlaceholder: "0x...",
// //       accountLocked: false,
// //       accountMinLength: 40,
// //       accountMaxLength: 50,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৬. Mobile Banking (default)
// //   return {
// //     isCrypto: false,
// //     currency: "BDT",
// //     amountLabel: "অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)",
// //     amountPlaceholder: "সর্বনিম্ন ৫০০ টাকা লিখুন",
// //     accountLabel: "একাউন্ট নাম্বার (রেজিস্টার্ড)",
// //     accountPlaceholder: "01700000000",
// //     accountLocked: true,
// //     accountMinLength: 11,
// //     accountMaxLength: 11,
// //     accountOnlyDigits: true,
// //   };
// // };
// // // ==========================================

// // export default function ReferralPage() {
// //   const [user, setUser] = useState({
// //     uid: "",
// //     phone: "",
// //     referralBalance: 0,
// //     referralCode: "",
// //   });
// //   const [amount, setAmount] = useState("");

// //   // 🆕 এজেন্টের মেথড স্টেট
// //   const [withdrawMethods, setWithdrawMethods] = useState([]);
// //   const [method, setMethod] = useState("");

// //   const [accountNumber, setAccountNumber] = useState("");
// //   const [pin, setPin] = useState("");
// //   const [toast, setToast] = useState({ show: false, text: "", success: false });
// //   const [usdToBdtRate, setUsdToBdtRate] = useState(120);
// //   const [mounted, setMounted] = useState(false);

// //   const router = useRouter();
// //   const methodConfig = getMethodConfig(method);

// //   // ✅ Double-click protection (synchronous)
// //   const submittingRef = useRef(false);
// //   // ✅ Success lock (সফল হওয়ার পর ২.৫s ক্লিক আটকাবে)
// //   const successLockRef = useRef(false);
// //   // ✅ FIX: toast + success timer ref-এ track (memory leak fix)
// //   const toastTimerRef = useRef(null);
// //   const successTimerRef = useRef(null);

// //   useEffect(() => {
// //     setMounted(true);
// //   }, []);

// //   // ✅ FIX: unmount-এ সব timer clear
// //   useEffect(() => {
// //     return () => {
// //       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //       if (successTimerRef.current) clearTimeout(successTimerRef.current);
// //     };
// //   }, []);

// //   // ✅ FIX: showToast-এ previous timer clear (race condition fix)
// //   const showToast = (text, success = true) => {
// //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //     setToast({ show: true, text, success });
// //     toastTimerRef.current = setTimeout(() => {
// //       setToast({ show: false, text: "", success: false });
// //       toastTimerRef.current = null;
// //     }, 3500);
// //   };

// //   const handlePinChange = (e) => {
// //     const val = e.target.value.replace(/\D/g, "");
// //     if (val.length <= 4) setPin(val);
// //   };

// //   useEffect(() => {
// //     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
// //     if (!savedUser.uid && !savedUser.phone) {
// //       router.push("/login");
// //       return;
// //     }

// //     setUser({
// //       ...savedUser,
// //       balance: Number(savedUser.balance) || 0,
// //       turnover: Number(savedUser.turnover) || 0,
// //       referralBalance: Number(savedUser.referralBalance) || 0,
// //     });

// //     fetch("/api/game/get-user", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success) {
// //           const freshUser = {
// //             ...savedUser,
// //             uid: data.uid,
// //             phone: data.phone,
// //             balance: Number(data.balance) || 0,
// //             turnover: Number(data.turnover) || 0,
// //             referralBalance: Number(data.referralBalance) || 0,
// //             referralCode: data.referralCode || data.uid,
// //           };
// //           setUser(freshUser);
// //           localStorage.setItem("user", JSON.stringify(freshUser));

// //           if (data.usdToBdtRate) {
// //             setUsdToBdtRate(Number(data.usdToBdtRate) || 120);
// //           }
// //         }
// //       })
// //       .catch((err) => console.error("Referral fetch error:", err));

// //     // 🆕 এজেন্টদের সব মেথড লোড করা (শুধু মেথডের নাম, এজেন্টের নাম ছাড়া)
// //     fetch("/api/user/agent-list", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.agents && data.agents.length > 0) {
// //           const uniqueMethods = [];
// //           const seen = new Set();

// //           data.agents.forEach((agent) => {
// //             if (agent.paymentAccounts && agent.paymentAccounts.length > 0) {
// //               agent.paymentAccounts.forEach((acc) => {
// //                 const cleanMethod = String(acc.method || "").trim();
// //                 const isJustNumbers = /^\d+$/.test(cleanMethod);
// //                 const isTooShort = cleanMethod.length < 3;

// //                 if (!isJustNumbers && !isTooShort && !seen.has(cleanMethod)) {
// //                   seen.add(cleanMethod);
// //                   uniqueMethods.push(cleanMethod);
// //                 }
// //               });
// //             }
// //           });

// //           setWithdrawMethods(uniqueMethods);

// //           if (uniqueMethods.length > 0) {
// //             const firstMethod = uniqueMethods[0];
// //             const cfg = getMethodConfig(firstMethod);

// //             setMethod(firstMethod);
// //             setAccountNumber(
// //               cfg.accountLocked ? savedUser.phone || savedUser.uid || "" : "",
// //             );
// //             setAmount("");
// //             setPin("");
// //           }
// //         } else {
// //           setWithdrawMethods([]);
// //           setMethod("");
// //         }
// //       })
// //       .catch((err) => {
// //         console.error("❌ Agent methods fetch error:", err);
// //         setWithdrawMethods([]);
// //         setMethod("");
// //       });
// //   }, [router]);

// //   const referralLink =
// //     typeof window !== "undefined"
// //       ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}`
// //       : "";

// //   const handleCopyLink = async () => {
// //     try {
// //       if (navigator.clipboard && window.isSecureContext) {
// //         await navigator.clipboard.writeText(referralLink);
// //       } else {
// //         const textarea = document.createElement("textarea");
// //         textarea.value = referralLink;
// //         textarea.style.position = "fixed";
// //         textarea.style.opacity = "0";
// //         document.body.appendChild(textarea);
// //         textarea.select();
// //         document.execCommand("copy");
// //         document.body.removeChild(textarea);
// //       }
// //       return true;
// //     } catch (err) {
// //       showToast("কপি ব্যর্থ হয়েছে!", false);
// //       return false;
// //     }
// //   };

// //   const handleMethodChange = (newMethod) => {
// //     setMethod(newMethod);
// //     const cfg = getMethodConfig(newMethod);

// //     setAccountNumber(cfg.accountLocked ? user.phone || user.uid || "" : "");
// //     setAmount("");
// //     setPin("");
// //   };

// //   const handleAccountChange = (value) => {
// //     let sanitized = value;
// //     if (methodConfig.accountOnlyDigits) {
// //       sanitized = value.replace(/\D/g, "");
// //     } else {
// //       sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
// //     }
// //     if (sanitized.length <= methodConfig.accountMaxLength) {
// //       setAccountNumber(sanitized);
// //     }
// //   };

// //   const handleReferralWithdraw = async () => {
// //     if (submittingRef.current || successLockRef.current) {
// //       return { success: false };
// //     }
// //     submittingRef.current = true;

// //     try {
// //       if (pin.length !== 4) {
// //         showToast(
// //           "উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!",
// //           false,
// //         );
// //         return { success: false };
// //       }

// //       const cleanAmount = Number(amount);
// //       const cleanAccountNumber = accountNumber.trim();
// //       const registeredNumber = user.phone || user.uid;

// //       if (methodConfig.accountLocked) {
// //         if (cleanAccountNumber !== user.phone) {
// //           showToast(
// //             "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
// //             false,
// //           );
// //           return { success: false };
// //         }
// //       } else {
// //         if (cleanAccountNumber.length < methodConfig.accountMinLength) {
// //           showToast(
// //             `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
// //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// //             }!`,
// //             false,
// //           );
// //           return { success: false };
// //         }
// //         if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
// //           showToast(
// //             `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
// //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// //             }!`,
// //             false,
// //           );
// //           return { success: false };
// //         }
// //       }

// //       const minAmount = methodConfig.isCrypto ? 5 : 500;
// //       if (isNaN(cleanAmount) || cleanAmount < minAmount) {
// //         showToast(
// //           methodConfig.isCrypto
// //             ? `সর্বনিম্ন উইথড্র $${minAmount}!`
// //             : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
// //           false,
// //         );
// //         return { success: false };
// //       }

// //       const bdtEquivalent = methodConfig.isCrypto
// //         ? cleanAmount * usdToBdtRate
// //         : cleanAmount;

// //       if (bdtEquivalent > (Number(user.referralBalance) || 0)) {
// //         showToast(
// //           methodConfig.isCrypto
// //             ? `পর্যাপ্ত বোনাস নেই! প্রয়োজন ৳${bdtEquivalent.toFixed(0)} ($${cleanAmount} × ৳${usdToBdtRate}), আছে ৳${user.referralBalance}`
// //             : "আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!",
// //           false,
// //         );
// //         return { success: false };
// //       }

// //       const res = await fetch("/api/user/referral-withdraw", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({
// //           amount: cleanAmount,
// //           method,
// //           accountNumber: methodConfig.accountLocked
// //             ? registeredNumber
// //             : cleanAccountNumber,
// //           pin,
// //         }),
// //       });

// //       const data = await res.json();
// //       if (data.success) {
// //         successLockRef.current = true;

// //         setAmount("");
// //         setPin("");

// //         if (!methodConfig.accountLocked) {
// //           setAccountNumber("");
// //         } else {
// //           setAccountNumber(user.phone || user.uid || "");
// //         }

// //         if (data.newReferralBalance !== undefined) {
// //           const updatedUser = {
// //             ...user,
// //             referralBalance: Number(data.newReferralBalance) || 0,
// //           };
// //           setUser(updatedUser);
// //           localStorage.setItem("user", JSON.stringify(updatedUser));
// //         } else {
// //           const updatedBalance =
// //             (Number(user.referralBalance) || 0) - bdtEquivalent;
// //           const updatedUser = { ...user, referralBalance: updatedBalance };
// //           setUser(updatedUser);
// //           localStorage.setItem("user", JSON.stringify(updatedUser));
// //         }

// //         successTimerRef.current = setTimeout(() => {
// //           successLockRef.current = false;
// //           successTimerRef.current = null;
// //         }, 2500);

// //         return {
// //           success: true,
// //           message:
// //             data.message ||
// //             `উইথড্র সফল! $${cleanAmount} (ব্যালেন্স থেকে ৳${bdtEquivalent.toFixed(0)} কেটেছে)`,
// //         };
// //       } else {
// //         showToast(data.message || "উইথড্র ব্যর্থ হয়েছে।", false);
// //         return { success: false };
// //       }
// //     } catch (err) {
// //       showToast("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false);
// //       return { success: false };
// //     } finally {
// //       submittingRef.current = false;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
// //       {mounted &&
// //         toast.show &&
// //         createPortal(
// //           <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none px-4">
// //             <div
// //               className={`flex flex-col items-center gap-3 border-2 rounded-2xl backdrop-blur-md px-6 py-5 shadow-2xl w-full max-w-[320px] ${
// //                 toast.success
// //                   ? "border-emerald-500 bg-slate-900/95 shadow-emerald-500/40"
// //                   : "border-rose-500 bg-slate-900/95 shadow-rose-500/40"
// //               }`}
// //             >
// //               <div
// //                 className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
// //                   toast.success
// //                     ? "bg-emerald-500 shadow-emerald-500/50"
// //                     : "bg-rose-500 shadow-rose-500/50"
// //                 }`}
// //               >
// //                 {toast.success ? (
// //                   <svg
// //                     className="w-5 h-5 text-white"
// //                     fill="none"
// //                     stroke="currentColor"
// //                     strokeWidth="3"
// //                     viewBox="0 0 24 24"
// //                   >
// //                     <path
// //                       strokeLinecap="round"
// //                       strokeLinejoin="round"
// //                       d="M5 13l4 4L19 7"
// //                     />
// //                   </svg>
// //                 ) : (
// //                   <svg
// //                     className="w-5 h-5 text-white"
// //                     fill="none"
// //                     stroke="currentColor"
// //                     strokeWidth="2.5"
// //                     viewBox="0 0 24 24"
// //                   >
// //                     <path
// //                       strokeLinecap="round"
// //                       strokeLinejoin="round"
// //                       d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //                     />
// //                   </svg>
// //                 )}
// //               </div>
// //               <p
// //                 className={`font-bold text-sm text-center leading-snug ${
// //                   toast.success ? "text-emerald-400" : "text-rose-400"
// //                 }`}
// //               >
// //                 {toast.text}
// //               </p>
// //             </div>
// //           </div>,
// //           document.body,
// //         )}

// //       <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
// //         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
// //           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
// //             <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
// //           </h2>
// //           <button
// //             onClick={() => {
// //               if (typeof window !== "undefined" && window.history.length > 1) {
// //                 router.back();
// //               } else {
// //                 router.push("/");
// //               }
// //             }}
// //             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
// //           >
// //             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
// //           </button>
// //         </div>

// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
// //           <div className="space-y-4 md:space-y-6">
// //             <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
// //               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
// //               <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">
// //                 উপলব্ধ রেফারেল বোনাস
// //               </p>
// //               <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-2 truncate">
// //                 ৳{Number(user.referralBalance || 0).toFixed(2)}
// //               </h1>
// //             </div>

// //             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
// //               <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
// //                 <i className="fa-solid fa-link text-emerald-400"></i> আপনার
// //                 রেফারেল লিংক
// //               </h3>
// //               <div className="flex flex-col gap-2">
// //                 <input
// //                   type="text"
// //                   readOnly
// //                   value={referralLink}
// //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
// //                 />

// //                 <ActionButton
// //                   onClick={handleCopyLink}
// //                   successCard={{ text: "রেফারেল সফলভাবে কপি হয়েছে!" }}
// //                   successFloating={true}
// //                   icon={<i className="fa-solid fa-copy"></i>}
// //                   loadingText="কপি হচ্ছে..."
// //                   className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer"
// //                 >
// //                   কপি করুন
// //                 </ActionButton>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
// //             <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
// //               <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস
// //               উইথড্র
// //             </h3>

// //             <div className="space-y-4">
// //               <div className="space-y-1.5">
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// //                   উইথড্র পদ্ধতি
// //                 </label>
// //                 <select
// //                   value={method}
// //                   onChange={(e) => handleMethodChange(e.target.value)}
// //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
// //                 >
// //                   {withdrawMethods.length === 0 ? (
// //                     <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
// //                   ) : (
// //                     withdrawMethods.map((m, index) => (
// //                       <option key={index} value={m}>
// //                         {m}
// //                       </option>
// //                     ))
// //                   )}
// //                 </select>
// //               </div>

// //               <div className="space-y-1.5">
// //                 <div className="flex justify-between items-center">
// //                   <label className="text-xs md:text-sm text-slate-400 font-semibold">
// //                     {methodConfig.accountLabel}
// //                   </label>
// //                   {methodConfig.accountLocked ? (
// //                     <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
// //                       <i className="fa-solid fa-lock"></i> লক
// //                     </span>
// //                   ) : (
// //                     <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
// //                       {methodConfig.accountMinLength}-
// //                       {methodConfig.accountMaxLength}{" "}
// //                       {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
// //                     </span>
// //                   )}
// //                 </div>
// //                 <input
// //                   type="text"
// //                   value={accountNumber}
// //                   onChange={(e) => handleAccountChange(e.target.value)}
// //                   readOnly={methodConfig.accountLocked}
// //                   maxLength={methodConfig.accountMaxLength}
// //                   placeholder={methodConfig.accountPlaceholder}
// //                   className={`w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs md:text-sm font-mono ${
// //                     methodConfig.accountLocked
// //                       ? "text-slate-400 cursor-not-allowed select-none"
// //                       : "text-white focus:outline-none focus:border-emerald-500"
// //                   }`}
// //                 />

// //                 {/* ✅ আপডেটেড কাউন্টার: BNB / BEP20 সহ সব মেথডের জন্য */}
// //                 {!methodConfig.accountLocked &&
// //                   (() => {
// //                     const upper = String(method || "").toUpperCase();
// //                     const isTRX =
// //                       upper.includes("TRX") || upper.includes("TRON");
// //                     const isBinance = upper.includes("BINANCE");
// //                     const isBnb =
// //                       upper.includes("BNB") || upper.includes("BEP20");

// //                     if (!isTRX && !isBinance && !isBnb) return null;

// //                     return (
// //                       <div className="flex items-center justify-between mt-1.5 px-1">
// //                         <span className="text-[10px] text-slate-500">
// //                           {methodConfig.accountOnlyDigits
// //                             ? "শুধু সংখ্যা গ্রহণযোগ্য"
// //                             : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
// //                         </span>
// //                         <span
// //                           className={`text-[10px] font-mono font-bold transition-colors ${
// //                             accountNumber.length ===
// //                             methodConfig.accountMaxLength
// //                               ? "text-emerald-400"
// //                               : accountNumber.length > 0
// //                                 ? "text-amber-400"
// //                                 : "text-slate-500"
// //                           }`}
// //                         >
// //                           {accountNumber.length}/{methodConfig.accountMaxLength}
// //                         </span>
// //                       </div>
// //                     );
// //                   })()}
// //               </div>

// //               <div className="space-y-1.5">
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// //                   {methodConfig.amountLabel}
// //                 </label>
// //                 <input
// //                   type="number"
// //                   step="any"
// //                   min="1"
// //                   placeholder={methodConfig.amountPlaceholder}
// //                   value={amount}
// //                   onChange={(e) => {
// //                     const val = e.target.value;
// //                     if (val === "" || Number(val) >= 0) setAmount(val);
// //                   }}
// //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
// //                 />
// //                 {methodConfig.isCrypto && amount && (
// //                   <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
// //                     ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 =
// //                     ৳{usdToBdtRate})
// //                   </p>
// //                 )}
// //               </div>

// //               <div className="space-y-1.5">
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
// //                   ৪ ডিজিটের সিকিউরিটি পিন
// //                 </label>
// //                 <input
// //                   type="password"
// //                   inputMode="numeric"
// //                   maxLength={4}
// //                   placeholder="আপনার ৪ ডিজিটের পিন দিন"
// //                   value={pin}
// //                   onChange={handlePinChange}
// //                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
// //                 />
// //               </div>

// //               <ActionButton
// //                 type="button"
// //                 disabled={withdrawMethods.length === 0}
// //                 onClick={handleReferralWithdraw}
// //                 successCard={{ text: "উইথড্র সফল হয়েছে!" }}
// //                 successFloating={true}
// //                 icon={<i className="fa-solid fa-paper-plane"></i>}
// //                 loadingText="প্রসেসিং হচ্ছে..."
// //                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-950/50 cursor-pointer mt-2"
// //               >
// //                 উইথড্র রিকোয়েস্ট পাঠান
// //               </ActionButton>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // /////////////////////////////////////////////////////////////////////////////
// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { createPortal } from "react-dom";
// import ActionButton from "./ActionButton";

// // ==========================================
// // ✅ Method-specific Config (আপডেট করা হয়েছে)
// // ==========================================
// const getMethodConfig = (method) => {
//   const upper = String(method || "").toUpperCase();

//   // ✅ ১. USDT TRC20 (এটি সবার আগে চেক করতে হবে)
//   if (upper.includes("TRC20")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার USDT (TRC20) Wallet Address",
//       accountPlaceholder: "TXYZ... (৩৪ character)",
//       accountLocked: false,
//       accountMinLength: 34,
//       accountMaxLength: 34,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ২. BNB / BSC / BEP20
//   if (
//     upper.includes("BEP20") ||
//     upper.includes("BSC") ||
//     upper.includes("BNB")
//   ) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার BEP20 Wallet Address",
//       accountPlaceholder: "0x... (৪২ character)",
//       accountLocked: false,
//       accountMinLength: 42,
//       accountMaxLength: 42,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৩. TRX / TRON
//   if (upper.includes("TRX") || upper.includes("TRON")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার TRX Wallet Address",
//       accountPlaceholder: "TXYZ... (৩৪ character)",
//       accountLocked: false,
//       accountMinLength: 34,
//       accountMaxLength: 34,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৪. BINANCE PAY ID
//   if (upper.includes("BINANCE")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার Binance Pay ID",
//       accountPlaceholder: "541254656",
//       accountLocked: false,
//       accountMinLength: 5,
//       accountMaxLength: 15,
//       accountOnlyDigits: true,
//     };
//   }

//   // ✅ ৫. BTC
//   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার Bitcoin Wallet Address",
//       accountPlaceholder: "bc1... or 1...",
//       accountLocked: false,
//       accountMinLength: 26,
//       accountMaxLength: 50,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৬. ETH
//   if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার ETH Wallet Address",
//       accountPlaceholder: "0x... (৪২ character)",
//       accountLocked: false,
//       accountMinLength: 42,
//       accountMaxLength: 42,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৭. Mobile Banking (default)
//   return {
//     isCrypto: false,
//     currency: "BDT",
//     amountLabel: "অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)",
//     amountPlaceholder: "সর্বনিম্ন ৫০০ টাকা লিখুন",
//     accountLabel: "একাউন্ট নাম্বার (রেজিস্টার্ড)",
//     accountPlaceholder: "01700000000",
//     accountLocked: true,
//     accountMinLength: 11,
//     accountMaxLength: 11,
//     accountOnlyDigits: true,
//   };
// };
// // ==========================================

// export default function ReferralPage() {
//   const [user, setUser] = useState({
//     uid: "",
//     phone: "",
//     referralBalance: 0,
//     referralCode: "",
//   });
//   const [amount, setAmount] = useState("");

//   // 🆕 এজেন্টের মেথড স্টেট
//   const [withdrawMethods, setWithdrawMethods] = useState([]);
//   const [method, setMethod] = useState("");

//   const [accountNumber, setAccountNumber] = useState("");
//   const [pin, setPin] = useState("");
//   const [toast, setToast] = useState({ show: false, text: "", success: false });
//   const [usdToBdtRate, setUsdToBdtRate] = useState(120);
//   const [mounted, setMounted] = useState(false);

//   const router = useRouter();
//   const methodConfig = getMethodConfig(method);

//   // 🆕 লাইভ ভ্যালিডেশন চেক
//   const isAccountLengthValid =
//     methodConfig.accountLocked ||
//     (accountNumber.length >= methodConfig.accountMinLength &&
//       accountNumber.length <= methodConfig.accountMaxLength);

//   // ✅ Double-click protection (synchronous)
//   const submittingRef = useRef(false);
//   // ✅ Success lock (সফল হওয়ার পর ২.৫s ক্লিক আটকাবে)
//   const successLockRef = useRef(false);
//   // ✅ FIX: toast + success timer ref-এ track (memory leak fix)
//   const toastTimerRef = useRef(null);
//   const successTimerRef = useRef(null);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ✅ FIX: unmount-এ সব timer clear
//   useEffect(() => {
//     return () => {
//       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//       if (successTimerRef.current) clearTimeout(successTimerRef.current);
//     };
//   }, []);

//   // ✅ FIX: showToast-এ previous timer clear (race condition fix)
//   const showToast = (text, success = true) => {
//     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     setToast({ show: true, text, success });
//     toastTimerRef.current = setTimeout(() => {
//       setToast({ show: false, text: "", success: false });
//       toastTimerRef.current = null;
//     }, 3500);
//   };

//   const handlePinChange = (e) => {
//     const val = e.target.value.replace(/\D/g, "");
//     if (val.length <= 4) setPin(val);
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//     if (!savedUser.uid && !savedUser.phone) {
//       router.push("/login");
//       return;
//     }

//     setUser({
//       ...savedUser,
//       balance: Number(savedUser.balance) || 0,
//       turnover: Number(savedUser.turnover) || 0,
//       referralBalance: Number(savedUser.referralBalance) || 0,
//     });

//     fetch("/api/game/get-user", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           const freshUser = {
//             ...savedUser,
//             uid: data.uid,
//             phone: data.phone,
//             balance: Number(data.balance) || 0,
//             turnover: Number(data.turnover) || 0,
//             referralBalance: Number(data.referralBalance) || 0,
//             referralCode: data.referralCode || data.uid,
//           };
//           setUser(freshUser);
//           localStorage.setItem("user", JSON.stringify(freshUser));

//           if (data.usdToBdtRate) {
//             setUsdToBdtRate(Number(data.usdToBdtRate) || 120);
//           }
//         }
//       })
//       .catch((err) => console.error("Referral fetch error:", err));

//     // 🆕 এজেন্টদের সব মেথড লোড করা (শুধু মেথডের নাম, এজেন্টের নাম ছাড়া)
//     fetch("/api/user/agent-list", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.agents && data.agents.length > 0) {
//           const uniqueMethods = [];
//           const seen = new Set();

//           data.agents.forEach((agent) => {
//             if (agent.paymentAccounts && agent.paymentAccounts.length > 0) {
//               agent.paymentAccounts.forEach((acc) => {
//                 const cleanMethod = String(acc.method || "").trim();
//                 const isJustNumbers = /^\d+$/.test(cleanMethod);
//                 const isTooShort = cleanMethod.length < 3;

//                 if (!isJustNumbers && !isTooShort && !seen.has(cleanMethod)) {
//                   seen.add(cleanMethod);
//                   uniqueMethods.push(cleanMethod);
//                 }
//               });
//             }
//           });

//           setWithdrawMethods(uniqueMethods);

//           if (uniqueMethods.length > 0) {
//             const firstMethod = uniqueMethods[0];
//             const cfg = getMethodConfig(firstMethod);

//             setMethod(firstMethod);
//             setAccountNumber(
//               cfg.accountLocked ? savedUser.phone || savedUser.uid || "" : "",
//             );
//             setAmount("");
//             setPin("");
//           }
//         } else {
//           setWithdrawMethods([]);
//           setMethod("");
//         }
//       })
//       .catch((err) => {
//         console.error("❌ Agent methods fetch error:", err);
//         setWithdrawMethods([]);
//         setMethod("");
//       });
//   }, [router]);

//   const referralLink =
//     typeof window !== "undefined"
//       ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}`
//       : "";

//   const handleCopyLink = async () => {
//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(referralLink);
//       } else {
//         const textarea = document.createElement("textarea");
//         textarea.value = referralLink;
//         textarea.style.position = "fixed";
//         textarea.style.opacity = "0";
//         document.body.appendChild(textarea);
//         textarea.select();
//         document.execCommand("copy");
//         document.body.removeChild(textarea);
//       }
//       return true;
//     } catch (err) {
//       showToast("কপি ব্যর্থ হয়েছে!", false);
//       return false;
//     }
//   };

//   const handleMethodChange = (newMethod) => {
//     setMethod(newMethod);
//     const cfg = getMethodConfig(newMethod);

//     setAccountNumber(cfg.accountLocked ? user.phone || user.uid || "" : "");
//     setAmount("");
//     setPin("");
//   };

//   const handleAccountChange = (value) => {
//     let sanitized = value;
//     if (methodConfig.accountOnlyDigits) {
//       sanitized = value.replace(/\D/g, "");
//     } else {
//       sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
//     }
//     if (sanitized.length <= methodConfig.accountMaxLength) {
//       setAccountNumber(sanitized);
//     }
//   };

//   const handleReferralWithdraw = async () => {
//     if (submittingRef.current || successLockRef.current) {
//       return { success: false };
//     }
//     submittingRef.current = true;

//     try {
//       if (pin.length !== 4) {
//         showToast(
//           "উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!",
//           false,
//         );
//         return { success: false };
//       }

//       const cleanAmount = Number(amount);
//       const cleanAccountNumber = accountNumber.trim();
//       const registeredNumber = user.phone || user.uid;

//       if (methodConfig.accountLocked) {
//         if (cleanAccountNumber !== user.phone) {
//           showToast(
//             "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
//             false,
//           );
//           return { success: false };
//         }
//       } else {
//         if (cleanAccountNumber.length < methodConfig.accountMinLength) {
//           showToast(
//             `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
//               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
//             }!`,
//             false,
//           );
//           return { success: false };
//         }
//         if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
//           showToast(
//             `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
//               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
//             }!`,
//             false,
//           );
//           return { success: false };
//         }
//       }

//       const minAmount = methodConfig.isCrypto ? 5 : 500;
//       if (isNaN(cleanAmount) || cleanAmount < minAmount) {
//         showToast(
//           methodConfig.isCrypto
//             ? `সর্বনিম্ন উইথড্র $${minAmount}!`
//             : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
//           false,
//         );
//         return { success: false };
//       }

//       const bdtEquivalent = methodConfig.isCrypto
//         ? cleanAmount * usdToBdtRate
//         : cleanAmount;

//       if (bdtEquivalent > (Number(user.referralBalance) || 0)) {
//         showToast(
//           methodConfig.isCrypto
//             ? `পর্যাপ্ত বোনাস নেই! প্রয়োজন ৳${bdtEquivalent.toFixed(0)} ($${cleanAmount} × ৳${usdToBdtRate}), আছে ৳${user.referralBalance}`
//             : "আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!",
//           false,
//         );
//         return { success: false };
//       }

//       const res = await fetch("/api/user/referral-withdraw", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           amount: cleanAmount,
//           method,
//           accountNumber: methodConfig.accountLocked
//             ? registeredNumber
//             : cleanAccountNumber,
//           pin,
//         }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         successLockRef.current = true;

//         setAmount("");
//         setPin("");

//         if (!methodConfig.accountLocked) {
//           setAccountNumber("");
//         } else {
//           setAccountNumber(user.phone || user.uid || "");
//         }

//         if (data.newReferralBalance !== undefined) {
//           const updatedUser = {
//             ...user,
//             referralBalance: Number(data.newReferralBalance) || 0,
//           };
//           setUser(updatedUser);
//           localStorage.setItem("user", JSON.stringify(updatedUser));
//         } else {
//           const updatedBalance =
//             (Number(user.referralBalance) || 0) - bdtEquivalent;
//           const updatedUser = { ...user, referralBalance: updatedBalance };
//           setUser(updatedUser);
//           localStorage.setItem("user", JSON.stringify(updatedUser));
//         }

//         successTimerRef.current = setTimeout(() => {
//           successLockRef.current = false;
//           successTimerRef.current = null;
//         }, 2500);

//         return {
//           success: true,
//           message:
//             data.message ||
//             `উইথড্র সফল! $${cleanAmount} (ব্যালেন্স থেকে ৳${bdtEquivalent.toFixed(0)} কেটেছে)`,
//         };
//       } else {
//         showToast(data.message || "উইথড্র ব্যর্থ হয়েছে।", false);
//         return { success: false };
//       }
//     } catch (err) {
//       showToast("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false);
//       return { success: false };
//     } finally {
//       submittingRef.current = false;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
//       {mounted &&
//         toast.show &&
//         createPortal(
//           <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none px-4">
//             <div
//               className={`flex flex-col items-center gap-3 border-2 rounded-2xl backdrop-blur-md px-6 py-5 shadow-2xl w-full max-w-[320px] ${
//                 toast.success
//                   ? "border-emerald-500 bg-slate-900/95 shadow-emerald-500/40"
//                   : "border-rose-500 bg-slate-900/95 shadow-rose-500/40"
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
//                   toast.success
//                     ? "bg-emerald-500 shadow-emerald-500/50"
//                     : "bg-rose-500 shadow-rose-500/50"
//                 }`}
//               >
//                 {toast.success ? (
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="3"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="w-5 h-5 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 )}
//               </div>
//               <p
//                 className={`font-bold text-sm text-center leading-snug ${
//                   toast.success ? "text-emerald-400" : "text-rose-400"
//                 }`}
//               >
//                 {toast.text}
//               </p>
//             </div>
//           </div>,
//           document.body,
//         )}

//       <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
//         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
//           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
//             <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
//           </h2>
//           <button
//             onClick={() => {
//               if (typeof window !== "undefined" && window.history.length > 1) {
//                 router.back();
//               } else {
//                 router.push("/");
//               }
//             }}
//             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
//           >
//             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//           <div className="space-y-4 md:space-y-6">
//             <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
//               <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
//               <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">
//                 উপলব্ধ রেফারেল বোনাস
//               </p>
//               <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-2 truncate">
//                 ৳{Number(user.referralBalance || 0).toFixed(2)}
//               </h1>
//             </div>

//             <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
//               <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
//                 <i className="fa-solid fa-link text-emerald-400"></i> আপনার
//                 রেফারেল লিংক
//               </h3>
//               <div className="flex flex-col gap-2">
//                 <input
//                   type="text"
//                   readOnly
//                   value={referralLink}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
//                 />

//                 <ActionButton
//                   onClick={handleCopyLink}
//                   successCard={{ text: "রেফারেল সফলভাবে কপি হয়েছে!" }}
//                   successFloating={true}
//                   icon={<i className="fa-solid fa-copy"></i>}
//                   loadingText="কপি হচ্ছে..."
//                   className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer"
//                 >
//                   কপি করুন
//                 </ActionButton>
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
//             <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
//               <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস
//               উইথড্র
//             </h3>

//             <div className="space-y-4">
//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
//                   উইথড্র পদ্ধতি
//                 </label>
//                 <select
//                   value={method}
//                   onChange={(e) => handleMethodChange(e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
//                 >
//                   {withdrawMethods.length === 0 ? (
//                     <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
//                   ) : (
//                     withdrawMethods.map((m, index) => (
//                       <option key={index} value={m}>
//                         {m}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <div className="flex justify-between items-center">
//                   <label className="text-xs md:text-sm text-slate-400 font-semibold">
//                     {methodConfig.accountLabel}
//                   </label>
//                   {methodConfig.accountLocked ? (
//                     <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
//                       <i className="fa-solid fa-lock"></i> লক
//                     </span>
//                   ) : (
//                     <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
//                       {methodConfig.accountMinLength}-
//                       {methodConfig.accountMaxLength}{" "}
//                       {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
//                     </span>
//                   )}
//                 </div>
//                 <input
//                   type="text"
//                   value={accountNumber}
//                   onChange={(e) => handleAccountChange(e.target.value)}
//                   readOnly={methodConfig.accountLocked}
//                   maxLength={methodConfig.accountMaxLength}
//                   placeholder={methodConfig.accountPlaceholder}
//                   className={`w-full bg-slate-950/60 border rounded-xl p-3 text-xs md:text-sm font-mono transition-colors ${
//                     methodConfig.accountLocked
//                       ? "border-slate-800 text-slate-400 cursor-not-allowed select-none"
//                       : !isAccountLengthValid && accountNumber.length > 0
//                         ? "border-rose-500 text-white focus:outline-none focus:border-rose-500 bg-rose-500/5" // 🆕 লাল বর্ডার
//                         : "border-slate-800 text-white focus:outline-none focus:border-emerald-500"
//                   }`}
//                 />

//                 {/* 🆕 লাইভ ভ্যালিডেশন মেসেজ */}
//                 {!methodConfig.accountLocked &&
//                   accountNumber.length > 0 &&
//                   !isAccountLengthValid && (
//                     <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
//                       <i className="fa-solid fa-circle-exclamation"></i>
//                       অ্যাড্রেসটি সঠিক নয়। এটি অবশ্যই{" "}
//                       {methodConfig.accountMinLength} থেকে{" "}
//                       {methodConfig.accountMaxLength} অক্ষরের হতে হবে।
//                     </p>
//                   )}

//                 {/* ✅ আপডেটেড কাউন্টার: BNB / BEP20 সহ সব মেথডের জন্য */}
//                 {!methodConfig.accountLocked &&
//                   (() => {
//                     const upper = String(method || "").toUpperCase();
//                     const isTRX =
//                       upper.includes("TRX") ||
//                       upper.includes("TRON") ||
//                       upper.includes("TRC20");
//                     const isBinance = upper.includes("BINANCE");
//                     const isBnb =
//                       upper.includes("BNB") || upper.includes("BEP20");

//                     if (!isTRX && !isBinance && !isBnb) return null;

//                     return (
//                       <div className="flex items-center justify-between mt-1.5 px-1">
//                         <span className="text-[10px] text-slate-500">
//                           {methodConfig.accountOnlyDigits
//                             ? "শুধু সংখ্যা গ্রহণযোগ্য"
//                             : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
//                         </span>
//                         <span
//                           className={`text-[10px] font-mono font-bold transition-colors ${
//                             accountNumber.length ===
//                             methodConfig.accountMaxLength
//                               ? "text-emerald-400"
//                               : accountNumber.length > 0
//                                 ? "text-amber-400"
//                                 : "text-slate-500"
//                           }`}
//                         >
//                           {accountNumber.length}/{methodConfig.accountMaxLength}
//                         </span>
//                       </div>
//                     );
//                   })()}
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
//                   {methodConfig.amountLabel}
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   min="1"
//                   placeholder={methodConfig.amountPlaceholder}
//                   value={amount}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     if (val === "" || Number(val) >= 0) setAmount(val);
//                   }}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
//                 />
//                 {methodConfig.isCrypto && amount && (
//                   <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
//                     ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 =
//                     ৳{usdToBdtRate})
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block">
//                   ৪ ডিজিটের সিকিউরিটি পিন
//                 </label>
//                 <input
//                   type="password"
//                   inputMode="numeric"
//                   maxLength={4}
//                   placeholder="আপনার ৪ ডিজিটের পিন দিন"
//                   value={pin}
//                   onChange={handlePinChange}
//                   className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
//                 />
//               </div>

//               <ActionButton
//                 type="button"
//                 disabled={
//                   withdrawMethods.length === 0 ||
//                   (!methodConfig.accountLocked && !isAccountLengthValid) // 🆕 অ্যাড্রেস ভুল হলে বাটন ডিজেবল
//                 }
//                 onClick={handleReferralWithdraw}
//                 successCard={{ text: "উইথড্র সফল হয়েছে!" }}
//                 successFloating={true}
//                 icon={<i className="fa-solid fa-paper-plane"></i>}
//                 loadingText="প্রসেসিং হচ্ছে..."
//                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-950/50 cursor-pointer mt-2"
//               >
//                 উইথড্র রিকোয়েস্ট পাঠান
//               </ActionButton>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// ////////////////////////////////////////////////////////////////////////////

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import ActionButton from "./ActionButton";

// ==========================================
// ✅ Method-specific Config (সংশোধিত)
// ==========================================
const getMethodConfig = (method) => {
  const upper = String(method || "").toUpperCase();

  // ✅ ১. USDT TRC20 (এটি সবার আগে চেক করতে হবে)
  if (upper.includes("TRC20")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার USDT (TRC20) Wallet Address",
      accountPlaceholder: "TXYZ... (৩৪ character)",
      accountLocked: false,
      accountMinLength: 34,
      accountMaxLength: 34,
      accountOnlyDigits: false,
    };
  }

  // ✅ ২. BNB / BSC / BEP20 (দৈর্ঘ্য ৪২)
  if (
    upper.includes("BEP20") ||
    upper.includes("BSC") ||
    upper.includes("BNB")
  ) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার BEP20 Wallet Address",
      accountPlaceholder: "0x... (৪২ character)",
      accountLocked: false,
      accountMinLength: 42,
      accountMaxLength: 42,
      accountOnlyDigits: false,
    };
  }

  // ✅ ৩. TRX / TRON
  if (upper.includes("TRX") || upper.includes("TRON")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার TRX Wallet Address",
      accountPlaceholder: "TXYZ... (৩৪ character)",
      accountLocked: false,
      accountMinLength: 34,
      accountMaxLength: 34,
      accountOnlyDigits: false,
    };
  }

  // ✅ ৪. BINANCE PAY ID
  if (upper.includes("BINANCE")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার Binance Pay ID",
      accountPlaceholder: "541254656",
      accountLocked: false,
      accountMinLength: 5,
      accountMaxLength: 15,
      accountOnlyDigits: true,
    };
  }

  // ✅ ৫. BTC
  if (upper.includes("BTC") || upper.includes("BITCOIN")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার Bitcoin Wallet Address",
      accountPlaceholder: "bc1... or 1...",
      accountLocked: false,
      accountMinLength: 26,
      accountMaxLength: 50,
      accountOnlyDigits: false,
    };
  }

  // ✅ ৬. ETH
  if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "উইথড্র পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 5",
      accountLabel: "আপনার ETH Wallet Address",
      accountPlaceholder: "0x... (৪২ character)",
      accountLocked: false,
      accountMinLength: 42,
      accountMaxLength: 42,
      accountOnlyDigits: false,
    };
  }

  // ✅ ৭. Mobile Banking (default)
  return {
    isCrypto: false,
    currency: "BDT",
    amountLabel: "অ্যামাউন্ট (সর্বনিম্ন ৫০০ টাকা)",
    amountPlaceholder: "সর্বনিম্ন ৫০০ টাকা লিখুন",
    accountLabel: "একাউন্ট নাম্বার (রেজিস্টার্ড)",
    accountPlaceholder: "01700000000",
    accountLocked: true,
    accountMinLength: 11,
    accountMaxLength: 11,
    accountOnlyDigits: true,
  };
};
// ==========================================

export default function ReferralPage() {
  const [user, setUser] = useState({
    uid: "",
    phone: "",
    referralBalance: 0,
    referralCode: "",
  });
  const [amount, setAmount] = useState("");

  const [withdrawMethods, setWithdrawMethods] = useState([]);
  const [method, setMethod] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [toast, setToast] = useState({ show: false, text: "", success: false });
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const methodConfig = getMethodConfig(method);

  // 🆕 লাইভ ভ্যালিডেশন চেক
  const isAccountLengthValid =
    methodConfig.accountLocked ||
    (accountNumber.length >= methodConfig.accountMinLength &&
      accountNumber.length <= methodConfig.accountMaxLength);

  const submittingRef = useRef(false);
  const successLockRef = useRef(false);
  const toastTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showToast = (text, success = true) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, text, success });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, text: "", success: false });
      toastTimerRef.current = null;
    }, 3500);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setPin(val);
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.uid && !savedUser.phone) {
      router.push("/login");
      return;
    }

    setUser({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
      referralBalance: Number(savedUser.referralBalance) || 0,
    });

    fetch("/api/game/get-user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const freshUser = {
            ...savedUser,
            uid: data.uid,
            phone: data.phone,
            balance: Number(data.balance) || 0,
            turnover: Number(data.turnover) || 0,
            referralBalance: Number(data.referralBalance) || 0,
            referralCode: data.referralCode || data.uid,
          };
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));

          if (data.usdToBdtRate) {
            setUsdToBdtRate(Number(data.usdToBdtRate) || 120);
          }
        }
      })
      .catch((err) => console.error("Referral fetch error:", err));

    fetch("/api/user/agent-list", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.agents && data.agents.length > 0) {
          const uniqueMethods = [];
          const seen = new Set();

          data.agents.forEach((agent) => {
            if (agent.paymentAccounts && agent.paymentAccounts.length > 0) {
              agent.paymentAccounts.forEach((acc) => {
                const cleanMethod = String(acc.method || "").trim();
                const isJustNumbers = /^\d+$/.test(cleanMethod);
                const isTooShort = cleanMethod.length < 3;

                if (!isJustNumbers && !isTooShort && !seen.has(cleanMethod)) {
                  seen.add(cleanMethod);
                  uniqueMethods.push(cleanMethod);
                }
              });
            }
          });

          setWithdrawMethods(uniqueMethods);

          if (uniqueMethods.length > 0) {
            const firstMethod = uniqueMethods[0];
            const cfg = getMethodConfig(firstMethod);

            setMethod(firstMethod);
            setAccountNumber(
              cfg.accountLocked ? savedUser.phone || savedUser.uid || "" : "",
            );
            setAmount("");
            setPin("");
          }
        } else {
          setWithdrawMethods([]);
          setMethod("");
        }
      })
      .catch((err) => {
        console.error("❌ Agent methods fetch error:", err);
        setWithdrawMethods([]);
        setMethod("");
      });
  }, [router]);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${user.referralCode || user.uid}`
      : "";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = referralLink;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      return true;
    } catch (err) {
      showToast("কপি ব্যর্থ হয়েছে!", false);
      return false;
    }
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    const cfg = getMethodConfig(newMethod);

    setAccountNumber(cfg.accountLocked ? user.phone || user.uid || "" : "");
    setAmount("");
    setPin("");
  };

  const handleAccountChange = (value) => {
    let sanitized = value;
    if (methodConfig.accountOnlyDigits) {
      sanitized = value.replace(/\D/g, "");
    } else {
      sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
    }
    if (sanitized.length <= methodConfig.accountMaxLength) {
      setAccountNumber(sanitized);
    }
  };

  const handleReferralWithdraw = async () => {
    if (submittingRef.current || successLockRef.current) {
      return { success: false };
    }
    submittingRef.current = true;

    try {
      if (pin.length !== 4) {
        showToast(
          "উইথড্র করার জন্য অবশ্যই সঠিক ৪ ডিজিটের পিন দিতে হবে!",
          false,
        );
        return { success: false };
      }

      const cleanAmount = Number(amount);
      const cleanAccountNumber = accountNumber.trim();
      const registeredNumber = user.phone || user.uid;

      if (methodConfig.accountLocked) {
        if (cleanAccountNumber !== user.phone) {
          showToast(
            "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
            false,
          );
          return { success: false };
        }
      } else {
        if (cleanAccountNumber.length < methodConfig.accountMinLength) {
          showToast(
            `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
              methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
            }!`,
            false,
          );
          return { success: false };
        }
        if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
          showToast(
            `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
              methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
            }!`,
            false,
          );
          return { success: false };
        }
      }

      const minAmount = methodConfig.isCrypto ? 5 : 500;
      if (isNaN(cleanAmount) || cleanAmount < minAmount) {
        showToast(
          methodConfig.isCrypto
            ? `সর্বনিম্ন উইথড্র $${minAmount}!`
            : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
          false,
        );
        return { success: false };
      }

      const bdtEquivalent = methodConfig.isCrypto
        ? cleanAmount * usdToBdtRate
        : cleanAmount;

      if (bdtEquivalent > (Number(user.referralBalance) || 0)) {
        showToast(
          methodConfig.isCrypto
            ? `পর্যাপ্ত বোনাস নেই! প্রয়োজন ৳${bdtEquivalent.toFixed(0)} ($${cleanAmount} × ৳${usdToBdtRate}), আছে ৳${user.referralBalance}`
            : "আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই!",
          false,
        );
        return { success: false };
      }

      const res = await fetch("/api/user/referral-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: cleanAmount,
          method,
          accountNumber: methodConfig.accountLocked
            ? registeredNumber
            : cleanAccountNumber,
          pin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        successLockRef.current = true;

        setAmount("");
        setPin("");

        if (!methodConfig.accountLocked) {
          setAccountNumber("");
        } else {
          setAccountNumber(user.phone || user.uid || "");
        }

        if (data.newReferralBalance !== undefined) {
          const updatedUser = {
            ...user,
            referralBalance: Number(data.newReferralBalance) || 0,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          const updatedBalance =
            (Number(user.referralBalance) || 0) - bdtEquivalent;
          const updatedUser = { ...user, referralBalance: updatedBalance };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        successTimerRef.current = setTimeout(() => {
          successLockRef.current = false;
          successTimerRef.current = null;
        }, 2500);

        return {
          success: true,
          message:
            data.message ||
            `উইথড্র সফল! $${cleanAmount} (ব্যালেন্স থেকে ৳${bdtEquivalent.toFixed(0)} কেটেছে)`,
        };
      } else {
        showToast(data.message || "উইথড্র ব্যর্থ হয়েছে।", false);
        return { success: false };
      }
    } catch (err) {
      showToast("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false);
      return { success: false };
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      {mounted &&
        toast.show &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none px-4">
            <div
              className={`flex flex-col items-center gap-3 border-2 rounded-2xl backdrop-blur-md px-6 py-5 shadow-2xl w-full max-w-[320px] ${
                toast.success
                  ? "border-emerald-500 bg-slate-900/95 shadow-emerald-500/40"
                  : "border-rose-500 bg-slate-900/95 shadow-rose-500/40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  toast.success
                    ? "bg-emerald-500 shadow-emerald-500/50"
                    : "bg-rose-500 shadow-rose-500/50"
                }`}
              >
                {toast.success ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <p
                className={`font-bold text-sm text-center leading-snug ${
                  toast.success ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {toast.text}
              </p>
            </div>
          </div>,
          document.body,
        )}

      <div className="w-full max-w-md md:max-w-4xl space-y-4 md:space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-share-nodes"></i> রেফারেল সিস্টেম ও বোনাস
          </h2>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-center">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">
                উপলব্ধ রেফারেল বোনাস
              </p>
              <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-2 truncate">
                ৳{Number(user.referralBalance || 0).toFixed(2)}
              </h1>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-link text-emerald-400"></i> আপনার
                রেফারেল লিংক
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />

                <ActionButton
                  onClick={handleCopyLink}
                  successCard={{ text: "রেফারেল সফলভাবে কপি হয়েছে!" }}
                  successFloating={true}
                  icon={<i className="fa-solid fa-copy"></i>}
                  loadingText="কপি হচ্ছে..."
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer"
                >
                  কপি করুন
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-lg space-y-5">
            <h3 className="text-sm md:text-base font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <i className="fa-solid fa-money-bill-transfer"></i> রেফারেল বোনাস
              উইথড্র
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">
                  উইথড্র পদ্ধতি
                </label>
                <select
                  value={method}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
                >
                  {withdrawMethods.length === 0 ? (
                    <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
                  ) : (
                    withdrawMethods.map((m, index) => (
                      <option key={index} value={m}>
                        {m}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs md:text-sm text-slate-400 font-semibold">
                    {methodConfig.accountLabel}
                  </label>
                  {methodConfig.accountLocked ? (
                    <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                      <i className="fa-solid fa-lock"></i> লক
                    </span>
                  ) : (
                    <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
                      {methodConfig.accountMinLength}-
                      {methodConfig.accountMaxLength}{" "}
                      {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  readOnly={methodConfig.accountLocked}
                  maxLength={methodConfig.accountMaxLength}
                  placeholder={methodConfig.accountPlaceholder}
                  className={`w-full bg-slate-950/60 border rounded-xl p-3 text-xs md:text-sm font-mono transition-colors ${
                    methodConfig.accountLocked
                      ? "border-slate-800 text-slate-400 cursor-not-allowed select-none"
                      : !isAccountLengthValid && accountNumber.length > 0
                        ? "border-rose-500 text-white focus:outline-none focus:border-rose-500 bg-rose-500/5" // 🆕 লাল বর্ডার
                        : "border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  }`}
                />

                {/* 🆕 লাইভ ভ্যালিডেশন মেসেজ */}
                {!methodConfig.accountLocked &&
                  accountNumber.length > 0 &&
                  !isAccountLengthValid && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      অ্যাড্রেসটি সঠিক নয়। এটি অবশ্যই{" "}
                      {methodConfig.accountMinLength} থেকে{" "}
                      {methodConfig.accountMaxLength} অক্ষরের হতে হবে।
                    </p>
                  )}

                {/* ✅ কাউন্টার */}
                {!methodConfig.accountLocked &&
                  (() => {
                    const upper = String(method || "").toUpperCase();
                    const isTRX =
                      upper.includes("TRX") ||
                      upper.includes("TRON") ||
                      upper.includes("TRC20");
                    const isBinance = upper.includes("BINANCE");
                    const isBnb =
                      upper.includes("BNB") || upper.includes("BEP20");

                    if (!isTRX && !isBinance && !isBnb) return null;

                    return (
                      <div className="flex items-center justify-between mt-1.5 px-1">
                        <span className="text-[10px] text-slate-500">
                          {methodConfig.accountOnlyDigits
                            ? "শুধু সংখ্যা গ্রহণযোগ্য"
                            : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold transition-colors ${
                            accountNumber.length ===
                            methodConfig.accountMaxLength
                              ? "text-emerald-400"
                              : accountNumber.length > 0
                                ? "text-amber-400"
                                : "text-slate-500"
                          }`}
                        >
                          {accountNumber.length}/{methodConfig.accountMaxLength}
                        </span>
                      </div>
                    );
                  })()}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">
                  {methodConfig.amountLabel}
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder={methodConfig.amountPlaceholder}
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) setAmount(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                {methodConfig.isCrypto && amount && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                    ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 =
                    ৳{usdToBdtRate})
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs md:text-sm text-slate-400 font-semibold block">
                  ৪ ডিজিটের সিকিউরিটি পিন
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="আপনার ৪ ডিজিটের পিন দিন"
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
                />
              </div>

              <ActionButton
                type="button"
                disabled={
                  withdrawMethods.length === 0 ||
                  (!methodConfig.accountLocked && !isAccountLengthValid) // 🆕 অ্যাড্রেস ভুল হলে বাটন ডিজেবল
                }
                onClick={handleReferralWithdraw}
                successCard={{ text: "উইথড্র সফল হয়েছে!" }}
                successFloating={true}
                icon={<i className="fa-solid fa-paper-plane"></i>}
                loadingText="প্রসেসিং হচ্ছে..."
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-950/50 cursor-pointer mt-2"
              >
                উইথড্র রিকোয়েস্ট পাঠান
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
