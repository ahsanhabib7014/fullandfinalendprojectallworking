// // "use client";
// // import { useState, useEffect, useRef } from "react";
// // import { useRouter } from "next/navigation";

// // // ==========================================
// // // ✅ Method-specific Config
// // // ==========================================
// // const getMethodConfig = (method) => {
// //   const upper = String(method || "").toUpperCase();

// //   if (upper.includes("TRX") || upper.includes("TRON")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার TRX Wallet Address",
// //       accountPlaceholder: "TXYZ... (৩৪ character)",
// //       accountLocked: false,
// //       accountMinLength: 34,
// //       accountMaxLength: 34,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   if (upper.includes("BINANCE") || upper.includes("USDT")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 5",
// //       accountLabel: "আপনার Binance Pay ID",
// //       accountPlaceholder: "541254656",
// //       accountLocked: false,
// //       accountMinLength: 5,
// //       accountMaxLength: 10,
// //       accountOnlyDigits: true,
// //     };
// //   }

// //   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "উইথড্র পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       accountLabel: "আপনার Bitcoin Wallet Address",
// //       accountPlaceholder: "bc1... or 1...",
// //       accountLocked: false,
// //       accountMinLength: 26,
// //       accountMaxLength: 50,
// //       accountOnlyDigits: false,
// //     };
// //   }

// //   // Mobile Banking (default)
// //   return {
// //     isCrypto: false,
// //     currency: "BDT",
// //     amountLabel: "উইথড্র পরিমাণ (৳)",
// //     amountPlaceholder: "মিনিমাম ৫০০",
// //     accountLabel: "অ্যাকাউন্ট নম্বর (রেজিস্টার্ড)",
// //     accountPlaceholder: "01700000000",
// //     accountLocked: true,
// //     accountMinLength: 11,
// //     accountMaxLength: 11,
// //     accountOnlyDigits: true,
// //   };
// // };

// // export default function UserWithdrawPage() {
// //   const [user, setUser] = useState({
// //     balance: 0,
// //     turnover: 0,
// //     phone: "",
// //     uid: "",
// //   });

// //   // 🆕 এজেন্টের মেথড স্টেট
// //   const [withdrawMethods, setWithdrawMethods] = useState([]);
// //   const [method, setMethod] = useState("");

// //   const [accountNumber, setAccountNumber] = useState("");
// //   const [amount, setAmount] = useState("");
// //   const [pin, setPin] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [usdToBdtRate, setUsdToBdtRate] = useState(120);

// //   const [toast, setToast] = useState({ show: false, message: "", type: "" });
// //   const router = useRouter();

// //   const submittingRef = useRef(false);
// //   const successLockRef = useRef(false);
// //   const toastTimerRef = useRef(null);
// //   const successTimerRef = useRef(null);

// //   const methodConfig = getMethodConfig(method);

// //   const showToast = (message, type = "success") => {
// //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //     setToast({ show: true, message, type });
// //     toastTimerRef.current = setTimeout(() => {
// //       setToast({ show: false, message: "", type: "" });
// //       toastTimerRef.current = null;
// //     }, 3000);
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //       if (successTimerRef.current) clearTimeout(successTimerRef.current);
// //     };
// //   }, []);

// //   const handlePinChange = (e) => {
// //     const val = e.target.value.replace(/\D/g, "");
// //     if (val.length <= 4) {
// //       setPin(val);
// //     }
// //   };

// //   useEffect(() => {
// //     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
// //     if (!savedUser.uid) {
// //       router.push("/login");
// //       return;
// //     }

// //     setUser({
// //       ...savedUser,
// //       balance: Number(savedUser.balance) || 0,
// //       turnover: Number(savedUser.turnover) || 0,
// //     });

// //     if (savedUser.phone) {
// //       setAccountNumber(savedUser.phone);
// //     }

// //     fetch("/api/user/me", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.user) {
// //           const currentUser = {
// //             ...data.user,
// //             balance: Number(data.user.balance) || 0,
// //             turnover: Number(data.user.turnover) || 0,
// //           };
// //           setUser(currentUser);

// //           if (currentUser.phone) {
// //             setAccountNumber(currentUser.phone);
// //           }

// //           localStorage.setItem(
// //             "user",
// //             JSON.stringify({ ...savedUser, ...currentUser }),
// //           );
// //         }
// //       })
// //       .catch((err) => console.error(err));

// //     fetch("/api/admin/exchange-rate", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.rate) {
// //           setUsdToBdtRate(Number(data.rate) || 120);
// //         }
// //       })
// //       .catch((err) => console.error("Rate fetch error:", err));

// //     // 🆕 এজেন্টদের সব মেথড লোড করা (শুধু মেথডের নাম, এজেন্টের নাম ছাড়া)
// //     fetch("/api/user/agent-list", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.agents && data.agents.length > 0) {
// //           const uniqueMethods = [];
// //           const seen = new Set();

// //           // ✅ সব এজেন্টের সব মেথড একসাথে বের করা
// //           data.agents.forEach((agent) => {
// //             if (agent.paymentAccounts && agent.paymentAccounts.length > 0) {
// //               agent.paymentAccounts.forEach((acc) => {
// //                 const cleanMethod = String(acc.method || "").trim();

// //                 // ❌ ভুল মেথড (শুধু সংখ্যা বা খুব ছোট) বাদ দেওয়া
// //                 const isJustNumbers = /^\d+$/.test(cleanMethod);
// //                 const isTooShort = cleanMethod.length < 3;

// //                 // ✅ শুধু ইউনিক ও সঠিক মেথড লিস্টে যোগ করা
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
// //             setMethod(firstMethod);

// //             const cfg = getMethodConfig(firstMethod);
// //             if (cfg.accountLocked) {
// //               setAccountNumber(savedUser.phone || savedUser.uid || "");
// //             } else {
// //               setAccountNumber("");
// //             }
// //           }
// //         }
// //       })
// //       .catch((err) => console.error("Agent methods fetch error:", err));
// //   }, [router]);

// //   const handleMethodChange = (newMethod) => {
// //     setMethod(newMethod);

// //     const newConfig = getMethodConfig(newMethod);

// //     if (newConfig.accountLocked) {
// //       setAccountNumber(user.phone || user.uid || "");
// //     } else {
// //       setAccountNumber("");
// //     }

// //     setAmount("");
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

// //   const handleSubmitWithdraw = async (e) => {
// //     e.preventDefault();

// //     if (submittingRef.current || successLockRef.current) return;
// //     submittingRef.current = true;
// //     setLoading(true);

// //     try {
// //       if (user.turnover && user.turnover > 0) {
// //         showToast(
// //           `আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি!`,
// //           "error",
// //         );
// //         return;
// //       }

// //       const cleanAccountNumber = accountNumber.trim();

// //       if (methodConfig.accountLocked) {
// //         const targetNumber = user.phone;
// //         if (cleanAccountNumber !== targetNumber) {
// //           showToast(
// //             "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
// //             "error",
// //           );
// //           return;
// //         }
// //       } else {
// //         if (cleanAccountNumber.length < methodConfig.accountMinLength) {
// //           showToast(
// //             `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
// //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// //             }!`,
// //             "error",
// //           );
// //           return;
// //         }
// //         if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
// //           showToast(
// //             `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
// //               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
// //             }!`,
// //             "error",
// //           );
// //           return;
// //         }
// //       }

// //       if (pin.length !== 4) {
// //         showToast(
// //           "উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!",
// //           "error",
// //         );
// //         return;
// //       }

// //       const cleanAmount = Number(amount);
// //       if (isNaN(cleanAmount) || cleanAmount <= 0) {
// //         showToast("সঠিক পরিমাণ দিন!", "error");
// //         return;
// //       }

// //       const minAmount = methodConfig.isCrypto ? 5 : 500;
// //       if (cleanAmount < minAmount) {
// //         showToast(
// //           methodConfig.isCrypto
// //             ? `সর্বনিম্ন উইথড্র $${minAmount}!`
// //             : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
// //           "error",
// //         );
// //         return;
// //       }

// //       if (cleanAmount > user.balance) {
// //         showToast("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!", "error");
// //         return;
// //       }

// //       const res = await fetch("/api/game/withdraw", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({
// //           uid: user.uid,
// //           amount: cleanAmount,
// //           method, // 🆕 এজেন্টের মেথডের নাম
// //           accountNumber: cleanAccountNumber,
// //           pin,
// //           isCrypto: methodConfig.isCrypto,
// //           currency: methodConfig.currency,
// //         }),
// //       });
// //       const data = await res.json();

// //       if (data.success) {
// //         successLockRef.current = true;

// //         showToast(
// //           data.message || "উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!",
// //           "success",
// //         );

// //         setAmount("");
// //         setPin("");

// //         if (!methodConfig.accountLocked) {
// //           setAccountNumber("");
// //         } else {
// //           setAccountNumber(user.phone || user.uid || "");
// //         }

// //         if (data.newBalance !== undefined) {
// //           const cleanBalance = Number(data.newBalance) || 0;
// //           setUser((prev) => ({ ...prev, balance: cleanBalance }));
// //           const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
// //           savedUser.balance = cleanBalance;
// //           localStorage.setItem("user", JSON.stringify(savedUser));
// //         }

// //         successTimerRef.current = setTimeout(() => {
// //           successLockRef.current = false;
// //           successTimerRef.current = null;
// //         }, 2500);

// //         router.refresh();
// //       } else {
// //         showToast(data.message || "কিছু সমস্যা হয়েছে!", "error");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       showToast("সার্ভার এরর!", "error");
// //     } finally {
// //       submittingRef.current = false;
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
// //       {toast.show && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
// //           <div
// //             className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
// //               toast.type === "success"
// //                 ? "bg-slate-900 border-emerald-500 text-emerald-400"
// //                 : "bg-slate-900 border-rose-500 text-rose-400"
// //             }`}
// //           >
// //             <i
// //               className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-3xl" : "fa-circle-exclamation text-3xl"}`}
// //             ></i>
// //             <span className="leading-relaxed">{toast.message}</span>
// //           </div>
// //         </div>
// //       )}

// //       <div className="w-full max-w-md md:max-w-xl space-y-4">
// //         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
// //           <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
// //             <i className="fa-solid fa-arrow-up-from-bracket"></i> উইথড্র করুন
// //           </h2>
// //           <button
// //             onClick={() => {
// //               if (typeof window !== "undefined" && window.history.length > 1) {
// //                 router.back();
// //               } else {
// //                 router.push("/");
// //               }
// //             }}
// //             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
// //           >
// //             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
// //           </button>
// //         </div>

// //         <div className="flex flex-col gap-3 md:gap-4">
// //           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
// //             <div className="absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
// //             <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
// //               মূল ব্যালেন্স
// //             </p>
// //             <p className="text-base md:text-lg font-bold text-amber-400 font-mono mt-1 truncate">
// //               ৳{Number(user.balance || 0).toFixed(2)}
// //             </p>
// //           </div>

// //           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
// //             <div
// //               className={`absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 ${user.turnover > 0 ? "bg-rose-500/5" : "bg-emerald-500/5"} rounded-full blur-2xl pointer-events-none`}
// //             ></div>
// //             <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
// //               টার্নওভার বাকি
// //             </p>
// //             <p
// //               className={`text-base md:text-lg font-bold font-mono mt-1 truncate ${user.turnover > 0 ? "text-rose-400" : "text-emerald-400"}`}
// //             >
// //               ৳{Number(user.turnover || 0).toFixed(2)}
// //             </p>
// //           </div>
// //         </div>

// //         {user.turnover > 0 && (
// //           <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-400 shadow-lg">
// //             <i className="fa-solid fa-triangle-exclamation mt-0.5 text-base"></i>
// //             <p className="text-[11px] md:text-xs font-bold leading-relaxed">
// //               আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ
// //               রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
// //             </p>
// //           </div>
// //         )}

// //         <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
// //           <form
// //             onSubmit={handleSubmitWithdraw}
// //             className="space-y-4 md:space-y-5"
// //           >
// //             <div>
// //               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                 পেমেন্ট মেথড সিলেক্ট করুন
// //               </label>
// //               <select
// //                 value={method}
// //                 onChange={(e) => handleMethodChange(e.target.value)}
// //                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 cursor-pointer truncate"
// //               >
// //                 {withdrawMethods.length === 0 ? (
// //                   <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
// //                 ) : (
// //                   withdrawMethods.map((m, index) => (
// //                     <option key={index} value={m}>
// //                       {m}
// //                     </option>
// //                   ))
// //                 )}
// //               </select>
// //             </div>

// //             <div>
// //               <div className="flex justify-between items-center mb-2">
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold">
// //                   {methodConfig.accountLabel}
// //                 </label>
// //                 {methodConfig.accountLocked ? (
// //                   <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
// //                     <i className="fa-solid fa-lock"></i> লক করা
// //                   </span>
// //                 ) : (
// //                   <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
// //                     {methodConfig.accountMinLength}-
// //                     {methodConfig.accountMaxLength}{" "}
// //                     {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
// //                   </span>
// //                 )}
// //               </div>
// //               <input
// //                 type="text"
// //                 value={accountNumber}
// //                 onChange={(e) => handleAccountChange(e.target.value)}
// //                 readOnly={methodConfig.accountLocked}
// //                 maxLength={methodConfig.accountMaxLength}
// //                 placeholder={methodConfig.accountPlaceholder}
// //                 className={`w-full bg-slate-950/60 border border-slate-800 p-3 md:p-3.5 rounded-xl text-xs md:text-sm font-mono ${
// //                   methodConfig.accountLocked
// //                     ? "text-slate-400 cursor-not-allowed select-none"
// //                     : "text-white outline-none focus:border-rose-500"
// //                 }`}
// //               />

// //               {!methodConfig.accountLocked &&
// //                 (() => {
// //                   const upper = String(method || "").toUpperCase();
// //                   const isTRX = upper.includes("TRX") || upper.includes("TRON");
// //                   const isBinance =
// //                     upper.includes("BINANCE") || upper.includes("USDT");
// //                   if (!isTRX && !isBinance) return null;

// //                   return (
// //                     <div className="flex items-center justify-between mt-1.5 px-1">
// //                       <span className="text-[10px] text-slate-500">
// //                         {methodConfig.accountOnlyDigits
// //                           ? "শুধু সংখ্যা গ্রহণযোগ্য"
// //                           : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
// //                       </span>
// //                       <span
// //                         className={`text-[10px] font-mono font-bold transition-colors ${
// //                           accountNumber.length === methodConfig.accountMaxLength
// //                             ? "text-emerald-400"
// //                             : accountNumber.length > 0
// //                               ? "text-amber-400"
// //                               : "text-slate-500"
// //                         }`}
// //                       >
// //                         {accountNumber.length}/{methodConfig.accountMaxLength}
// //                       </span>
// //                     </div>
// //                   );
// //                 })()}
// //             </div>

// //             <div>
// //               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                 {methodConfig.amountLabel}
// //               </label>
// //               <input
// //                 type="number"
// //                 step="any"
// //                 min="1"
// //                 placeholder={methodConfig.amountPlaceholder}
// //                 value={amount}
// //                 onChange={(e) => {
// //                   const val = e.target.value;
// //                   if (val === "" || Number(val) >= 0) setAmount(val);
// //                 }}
// //                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono"
// //               />
// //               {methodConfig.isCrypto && amount && (
// //                 <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
// //                   ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 = ৳
// //                   {usdToBdtRate})
// //                 </p>
// //               )}
// //             </div>

// //             <div>
// //               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                 ৪ ডিজিটের সিকিউরিটি পিন
// //               </label>
// //               <input
// //                 type="password"
// //                 inputMode="numeric"
// //                 maxLength={4}
// //                 placeholder="• • • •"
// //                 value={pin}
// //                 onChange={handlePinChange}
// //                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono tracking-widest text-center"
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={
// //                 loading ||
// //                 (user.turnover && user.turnover > 0) ||
// //                 withdrawMethods.length === 0
// //               }
// //               className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 md:p-4 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
// //             >
// //               {loading ? (
// //                 <>
// //                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
// //                   প্রসেস হচ্ছে...
// //                 </>
// //               ) : (
// //                 <>
// //                   <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট
// //                   পাঠান
// //                 </>
// //               )}
// //             </button>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // /////////////////////////////////////////////////////////////////////////////////////

// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";

// // ==========================================
// // ✅ Method-specific Config
// // ==========================================
// const getMethodConfig = (method) => {
//   const upper = String(method || "").toUpperCase();

//   // ✅ ১. TRX / TRON / USDT TRC20
//   if (
//     upper.includes("TRX") ||
//     upper.includes("TRON") ||
//     (upper.includes("USDT") && upper.includes("TRC20"))
//   ) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার TRX/USDT (TRC20) Wallet Address",
//       accountPlaceholder: "TXYZ... (৩৪ character)",
//       accountLocked: false,
//       accountMinLength: 34,
//       accountMaxLength: 34,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ২. BINANCE PAY ID
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

//   // ✅ ৩. BNB / BSC / BEP20 / USDT BEP20
//   if (
//     upper.includes("BNB") ||
//     upper.includes("BSC") ||
//     upper.includes("BEP20") ||
//     (upper.includes("USDT") && upper.includes("BEP20"))
//   ) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 5",
//       accountLabel: "আপনার BNB/BEP20 Wallet Address",
//       accountPlaceholder: "BNB Wallet Address",
//       accountLocked: false,
//       accountMinLength: 26,
//       accountMaxLength: 50,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৪. BTC
//   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       accountLabel: "আপনার Bitcoin Wallet Address",
//       accountPlaceholder: "bc1... or 1...",
//       accountLocked: false,
//       accountMinLength: 26,
//       accountMaxLength: 50,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৫. ETH
//   if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "উইথড্র পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       accountLabel: "আপনার ETH Wallet Address",
//       accountPlaceholder: "0x...",
//       accountLocked: false,
//       accountMinLength: 40,
//       accountMaxLength: 50,
//       accountOnlyDigits: false,
//     };
//   }

//   // ✅ ৬. ডিফল্ট (Mobile Banking / BDT)
//   return {
//     isCrypto: false,
//     currency: "BDT",
//     amountLabel: "উইথড্র পরিমাণ (৳)",
//     amountPlaceholder: "মিনিমাম ৫০০",
//     accountLabel: "অ্যাকাউন্ট নম্বর (রেজিস্টার্ড)",
//     accountPlaceholder: "01700000000",
//     accountLocked: true,
//     accountMinLength: 11,
//     accountMaxLength: 11,
//     accountOnlyDigits: true,
//   };
// };

// export default function UserWithdrawPage() {
//   const [user, setUser] = useState({
//     balance: 0,
//     turnover: 0,
//     phone: "",
//     uid: "",
//   });

//   const [withdrawMethods, setWithdrawMethods] = useState([]);
//   const [method, setMethod] = useState("");

//   const [accountNumber, setAccountNumber] = useState("");
//   const [amount, setAmount] = useState("");
//   const [pin, setPin] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [usdToBdtRate, setUsdToBdtRate] = useState(120);

//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const router = useRouter();

//   const submittingRef = useRef(false);
//   const successLockRef = useRef(false);
//   const toastTimerRef = useRef(null);
//   const successTimerRef = useRef(null);

//   const methodConfig = getMethodConfig(method);

//   const showToast = (message, type = "success") => {
//     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     setToast({ show: true, message, type });
//     toastTimerRef.current = setTimeout(() => {
//       setToast({ show: false, message: "", type: "" });
//       toastTimerRef.current = null;
//     }, 3000);
//   };

//   useEffect(() => {
//     return () => {
//       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//       if (successTimerRef.current) clearTimeout(successTimerRef.current);
//     };
//   }, []);

//   const handlePinChange = (e) => {
//     const val = e.target.value.replace(/\D/g, "");
//     if (val.length <= 4) {
//       setPin(val);
//     }
//   };

//   useEffect(() => {
//     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//     if (!savedUser.uid) {
//       router.push("/login");
//       return;
//     }

//     setUser({
//       ...savedUser,
//       balance: Number(savedUser.balance) || 0,
//       turnover: Number(savedUser.turnover) || 0,
//     });

//     if (savedUser.phone) {
//       setAccountNumber(savedUser.phone);
//     }

//     fetch("/api/user/me", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.user) {
//           const currentUser = {
//             ...data.user,
//             balance: Number(data.user.balance) || 0,
//             turnover: Number(data.user.turnover) || 0,
//           };
//           setUser(currentUser);

//           if (currentUser.phone) {
//             setAccountNumber(currentUser.phone);
//           }

//           localStorage.setItem(
//             "user",
//             JSON.stringify({ ...savedUser, ...currentUser }),
//           );
//         }
//       })
//       .catch((err) => console.error(err));

//     fetch("/api/admin/exchange-rate", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.rate) {
//           setUsdToBdtRate(Number(data.rate) || 120);
//         }
//       })
//       .catch((err) => console.error("Rate fetch error:", err));

//     // 🆕 এজেন্টদের সব মেথড লোড করা
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
//             setMethod(firstMethod);

//             const cfg = getMethodConfig(firstMethod);
//             if (cfg.accountLocked) {
//               setAccountNumber(savedUser.phone || savedUser.uid || "");
//             } else {
//               setAccountNumber("");
//             }
//           }
//         }
//       })
//       .catch((err) => console.error("Agent methods fetch error:", err));
//   }, [router]);

//   const handleMethodChange = (newMethod) => {
//     setMethod(newMethod);

//     const newConfig = getMethodConfig(newMethod);

//     if (newConfig.accountLocked) {
//       setAccountNumber(user.phone || user.uid || "");
//     } else {
//       setAccountNumber("");
//     }

//     setAmount("");
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

//   const handleSubmitWithdraw = async (e) => {
//     e.preventDefault();

//     if (submittingRef.current || successLockRef.current) return;
//     submittingRef.current = true;
//     setLoading(true);

//     try {
//       if (user.turnover && user.turnover > 0) {
//         showToast(
//           `আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি!`,
//           "error",
//         );
//         return;
//       }

//       const cleanAccountNumber = accountNumber.trim();

//       if (methodConfig.accountLocked) {
//         const targetNumber = user.phone;
//         if (cleanAccountNumber !== targetNumber) {
//           showToast(
//             "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
//             "error",
//           );
//           return;
//         }
//       } else {
//         if (cleanAccountNumber.length < methodConfig.accountMinLength) {
//           showToast(
//             `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
//               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
//             }!`,
//             "error",
//           );
//           return;
//         }
//         if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
//           showToast(
//             `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
//               methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
//             }!`,
//             "error",
//           );
//           return;
//         }
//       }

//       if (pin.length !== 4) {
//         showToast(
//           "উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!",
//           "error",
//         );
//         return;
//       }

//       const cleanAmount = Number(amount);
//       if (isNaN(cleanAmount) || cleanAmount <= 0) {
//         showToast("সঠিক পরিমাণ দিন!", "error");
//         return;
//       }

//       const minAmount = methodConfig.isCrypto ? 5 : 500;
//       if (cleanAmount < minAmount) {
//         showToast(
//           methodConfig.isCrypto
//             ? `সর্বনিম্ন উইথড্র $${minAmount}!`
//             : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
//           "error",
//         );
//         return;
//       }

//       if (cleanAmount > user.balance) {
//         showToast("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!", "error");
//         return;
//       }

//       const res = await fetch("/api/game/withdraw", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           uid: user.uid,
//           amount: cleanAmount,
//           method,
//           accountNumber: cleanAccountNumber,
//           pin,
//           isCrypto: methodConfig.isCrypto,
//           currency: methodConfig.currency,
//         }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         successLockRef.current = true;

//         showToast(
//           data.message || "উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!",
//           "success",
//         );

//         setAmount("");
//         setPin("");

//         if (!methodConfig.accountLocked) {
//           setAccountNumber("");
//         } else {
//           setAccountNumber(user.phone || user.uid || "");
//         }

//         if (data.newBalance !== undefined) {
//           const cleanBalance = Number(data.newBalance) || 0;
//           setUser((prev) => ({ ...prev, balance: cleanBalance }));
//           const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//           savedUser.balance = cleanBalance;
//           localStorage.setItem("user", JSON.stringify(savedUser));
//         }

//         successTimerRef.current = setTimeout(() => {
//           successLockRef.current = false;
//           successTimerRef.current = null;
//         }, 2500);

//         router.refresh();
//       } else {
//         showToast(data.message || "কিছু সমস্যা হয়েছে!", "error");
//       }
//     } catch (err) {
//       console.error(err);
//       showToast("সার্ভার এরর!", "error");
//     } finally {
//       submittingRef.current = false;
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
//       {toast.show && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
//           <div
//             className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
//               toast.type === "success"
//                 ? "bg-slate-900 border-emerald-500 text-emerald-400"
//                 : "bg-slate-900 border-rose-500 text-rose-400"
//             }`}
//           >
//             <i
//               className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-3xl" : "fa-circle-exclamation text-3xl"}`}
//             ></i>
//             <span className="leading-relaxed">{toast.message}</span>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-md md:max-w-xl space-y-4">
//         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
//           <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
//             <i className="fa-solid fa-arrow-up-from-bracket"></i> উইথড্র করুন
//           </h2>
//           <button
//             onClick={() => {
//               if (typeof window !== "undefined" && window.history.length > 1) {
//                 router.back();
//               } else {
//                 router.push("/");
//               }
//             }}
//             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
//           >
//             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
//           </button>
//         </div>

//         <div className="flex flex-col gap-3 md:gap-4">
//           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
//             <div className="absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
//             <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
//               মূল ব্যালেন্স
//             </p>
//             <p className="text-base md:text-lg font-bold text-amber-400 font-mono mt-1 truncate">
//               ৳{Number(user.balance || 0).toFixed(2)}
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
//             <div
//               className={`absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 ${user.turnover > 0 ? "bg-rose-500/5" : "bg-emerald-500/5"} rounded-full blur-2xl pointer-events-none`}
//             ></div>
//             <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
//               টার্নওভার বাকি
//             </p>
//             <p
//               className={`text-base md:text-lg font-bold font-mono mt-1 truncate ${user.turnover > 0 ? "text-rose-400" : "text-emerald-400"}`}
//             >
//               ৳{Number(user.turnover || 0).toFixed(2)}
//             </p>
//           </div>
//         </div>

//         {user.turnover > 0 && (
//           <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-400 shadow-lg">
//             <i className="fa-solid fa-triangle-exclamation mt-0.5 text-base"></i>
//             <p className="text-[11px] md:text-xs font-bold leading-relaxed">
//               আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ
//               রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
//             </p>
//           </div>
//         )}

//         <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
//           <form
//             onSubmit={handleSubmitWithdraw}
//             className="space-y-4 md:space-y-5"
//           >
//             <div>
//               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                 পেমেন্ট মেথড সিলেক্ট করুন
//               </label>
//               <select
//                 value={method}
//                 onChange={(e) => handleMethodChange(e.target.value)}
//                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 cursor-pointer truncate"
//               >
//                 {withdrawMethods.length === 0 ? (
//                   <option value="">কোনো পেমেন্ট মেথড পাওয়া যায়নি</option>
//                 ) : (
//                   withdrawMethods.map((m, index) => (
//                     <option key={index} value={m}>
//                       {m}
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold">
//                   {methodConfig.accountLabel}
//                 </label>
//                 {methodConfig.accountLocked ? (
//                   <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
//                     <i className="fa-solid fa-lock"></i> লক করা
//                   </span>
//                 ) : (
//                   <span className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
//                     {methodConfig.accountMinLength}-
//                     {methodConfig.accountMaxLength}{" "}
//                     {methodConfig.accountOnlyDigits ? "ডিজিট" : "char"}
//                   </span>
//                 )}
//               </div>
//               <input
//                 type="text"
//                 value={accountNumber}
//                 onChange={(e) => handleAccountChange(e.target.value)}
//                 readOnly={methodConfig.accountLocked}
//                 maxLength={methodConfig.accountMaxLength}
//                 placeholder={methodConfig.accountPlaceholder}
//                 className={`w-full bg-slate-950/60 border border-slate-800 p-3 md:p-3.5 rounded-xl text-xs md:text-sm font-mono ${
//                   methodConfig.accountLocked
//                     ? "text-slate-400 cursor-not-allowed select-none"
//                     : "text-white outline-none focus:border-rose-500"
//                 }`}
//               />

//               {!methodConfig.accountLocked &&
//                 (() => {
//                   const upper = String(method || "").toUpperCase();
//                   const isTRX = upper.includes("TRX") || upper.includes("TRON");
//                   const isBinance = upper.includes("BINANCE");
//                   const isBnb =
//                     upper.includes("BNB") || upper.includes("BEP20");
//                   if (!isTRX && !isBinance && !isBnb) return null;

//                   return (
//                     <div className="flex items-center justify-between mt-1.5 px-1">
//                       <span className="text-[10px] text-slate-500">
//                         {methodConfig.accountOnlyDigits
//                           ? "শুধু সংখ্যা গ্রহণযোগ্য"
//                           : "অক্ষর ও সংখ্যা গ্রহণযোগ্য"}
//                       </span>
//                       <span
//                         className={`text-[10px] font-mono font-bold transition-colors ${
//                           accountNumber.length === methodConfig.accountMaxLength
//                             ? "text-emerald-400"
//                             : accountNumber.length > 0
//                               ? "text-amber-400"
//                               : "text-slate-500"
//                         }`}
//                       >
//                         {accountNumber.length}/{methodConfig.accountMaxLength}
//                       </span>
//                     </div>
//                   );
//                 })()}
//             </div>

//             <div>
//               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                 {methodConfig.amountLabel}
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 min="1"
//                 placeholder={methodConfig.amountPlaceholder}
//                 value={amount}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (val === "" || Number(val) >= 0) setAmount(val);
//                 }}
//                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono"
//               />
//               {methodConfig.isCrypto && amount && (
//                 <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
//                   ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 = ৳
//                   {usdToBdtRate})
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                 ৪ ডিজিটের সিকিউরিটি পিন
//               </label>
//               <input
//                 type="password"
//                 inputMode="numeric"
//                 maxLength={4}
//                 placeholder="• • • •"
//                 value={pin}
//                 onChange={handlePinChange}
//                 className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono tracking-widest text-center"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={
//                 loading ||
//                 (user.turnover && user.turnover > 0) ||
//                 withdrawMethods.length === 0
//               }
//               className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 md:p-4 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   প্রসেস হচ্ছে...
//                 </>
//               ) : (
//                 <>
//                   <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট
//                   পাঠান
//                 </>
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
// /////////////////////////////////////////////////////////////////////////////////////////////
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// ✅ Method-specific Config (আপডেট করা হয়েছে)
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

  // ✅ ২. USDT BEP20 / BNB / BSC
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
      amountPlaceholder: "যেমন: 10",
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
      amountPlaceholder: "যেমন: 10",
      accountLabel: "আপনার ETH Wallet Address",
      accountPlaceholder: "0x... (৪২ character)",
      accountLocked: false,
      accountMinLength: 42,
      accountMaxLength: 42,
      accountOnlyDigits: false,
    };
  }

  // ✅ ৭. ডিফল্ট (Mobile Banking / BDT)
  return {
    isCrypto: false,
    currency: "BDT",
    amountLabel: "উইথড্র পরিমাণ (৳)",
    amountPlaceholder: "মিনিমাম ৫০০",
    accountLabel: "অ্যাকাউন্ট নম্বর (রেজিস্টার্ড)",
    accountPlaceholder: "01700000000",
    accountLocked: true,
    accountMinLength: 11,
    accountMaxLength: 11,
    accountOnlyDigits: true,
  };
};

export default function UserWithdrawPage() {
  const [user, setUser] = useState({
    balance: 0,
    turnover: 0,
    phone: "",
    uid: "",
  });

  const [withdrawMethods, setWithdrawMethods] = useState([]);
  const [method, setMethod] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const router = useRouter();

  const submittingRef = useRef(false);
  const successLockRef = useRef(false);
  const toastTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  const methodConfig = getMethodConfig(method);

  // 🆕 লাইভ ভ্যালিডেশন চেক (ইনপুট সঠিক দৈর্ঘ্যের কি না)
  const isAccountLengthValid =
    methodConfig.accountLocked ||
    (accountNumber.length >= methodConfig.accountMinLength &&
      accountNumber.length <= methodConfig.accountMaxLength);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
      toastTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      setPin(val);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.uid) {
      router.push("/login");
      return;
    }

    setUser({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
    });

    if (savedUser.phone) {
      setAccountNumber(savedUser.phone);
    }

    fetch("/api/user/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const currentUser = {
            ...data.user,
            balance: Number(data.user.balance) || 0,
            turnover: Number(data.user.turnover) || 0,
          };
          setUser(currentUser);

          if (currentUser.phone) {
            setAccountNumber(currentUser.phone);
          }

          localStorage.setItem(
            "user",
            JSON.stringify({ ...savedUser, ...currentUser }),
          );
        }
      })
      .catch((err) => console.error(err));

    fetch("/api/admin/exchange-rate", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rate) {
          setUsdToBdtRate(Number(data.rate) || 120);
        }
      })
      .catch((err) => console.error("Rate fetch error:", err));

    // এজেন্টদের সব মেথড লোড করা
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
            setMethod(firstMethod);

            const cfg = getMethodConfig(firstMethod);
            if (cfg.accountLocked) {
              setAccountNumber(savedUser.phone || savedUser.uid || "");
            } else {
              setAccountNumber("");
            }
          }
        }
      })
      .catch((err) => console.error("Agent methods fetch error:", err));
  }, [router]);

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);

    const newConfig = getMethodConfig(newMethod);

    if (newConfig.accountLocked) {
      setAccountNumber(user.phone || user.uid || "");
    } else {
      setAccountNumber("");
    }

    setAmount("");
  };

  const handleAccountChange = (value) => {
    let sanitized = value;

    if (methodConfig.accountOnlyDigits) {
      sanitized = value.replace(/\D/g, "");
    } else {
      // 🆕 0x অ্যাড্রেসের জন্য x এবং 0 Allow করা
      sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    if (sanitized.length <= methodConfig.accountMaxLength) {
      setAccountNumber(sanitized);
    }
  };

  const handleSubmitWithdraw = async (e) => {
    e.preventDefault();

    if (submittingRef.current || successLockRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      if (user.turnover && user.turnover > 0) {
        showToast(
          `আপনার অ্যাকাউন্টে এখনো ৳${user.turnover} টার্নওভার বাকি!`,
          "error",
        );
        return;
      }

      const cleanAccountNumber = accountNumber.trim();

      if (methodConfig.accountLocked) {
        const targetNumber = user.phone;
        if (cleanAccountNumber !== targetNumber) {
          showToast(
            "আপনি শুধুমাত্র আপনার নিজের রেজিস্টার্ড নম্বরেই উইথড্র করতে পারবেন!",
            "error",
          );
          return;
        }
      } else {
        if (cleanAccountNumber.length < methodConfig.accountMinLength) {
          showToast(
            `${methodConfig.accountLabel} — কমপক্ষে ${methodConfig.accountMinLength} ${
              methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
            }!`,
            "error",
          );
          return;
        }
        if (cleanAccountNumber.length > methodConfig.accountMaxLength) {
          showToast(
            `${methodConfig.accountLabel} — সর্বোচ্চ ${methodConfig.accountMaxLength} ${
              methodConfig.accountOnlyDigits ? "ডিজিট" : "character"
            }!`,
            "error",
          );
          return;
        }
      }

      if (pin.length !== 4) {
        showToast(
          "উইথড্র করার জন্য অবশ্যই ৪ ডিজিটের সঠিক পিন দিতে হবে!",
          "error",
        );
        return;
      }

      const cleanAmount = Number(amount);
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        showToast("সঠিক পরিমাণ দিন!", "error");
        return;
      }

      const minAmount = methodConfig.isCrypto ? 5 : 500;
      if (cleanAmount < minAmount) {
        showToast(
          methodConfig.isCrypto
            ? `সর্বনিম্ন উইথড্র $${minAmount}!`
            : `সর্বনিম্ন উইথড্র ৳${minAmount}!`,
          "error",
        );
        return;
      }

      if (cleanAmount > user.balance) {
        showToast("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!", "error");
        return;
      }

      const res = await fetch("/api/game/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: user.uid,
          amount: cleanAmount,
          method,
          accountNumber: cleanAccountNumber,
          pin,
          isCrypto: methodConfig.isCrypto,
          currency: methodConfig.currency,
        }),
      });
      const data = await res.json();

      if (data.success) {
        successLockRef.current = true;

        showToast(
          data.message || "উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!",
          "success",
        );

        setAmount("");
        setPin("");

        if (!methodConfig.accountLocked) {
          setAccountNumber("");
        } else {
          setAccountNumber(user.phone || user.uid || "");
        }

        if (data.newBalance !== undefined) {
          const cleanBalance = Number(data.newBalance) || 0;
          setUser((prev) => ({ ...prev, balance: cleanBalance }));
          const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
          savedUser.balance = cleanBalance;
          localStorage.setItem("user", JSON.stringify(savedUser));
        }

        successTimerRef.current = setTimeout(() => {
          successLockRef.current = false;
          successTimerRef.current = null;
        }, 2500);

        router.refresh();
      } else {
        showToast(data.message || "কিছু সমস্যা হয়েছে!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার এরর!", "error");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500 text-emerald-400"
                : "bg-slate-900 border-rose-500 text-rose-400"
            }`}
          >
            <i
              className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-3xl" : "fa-circle-exclamation text-3xl"}`}
            ></i>
            <span className="leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-xl space-y-4">
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <i className="fa-solid fa-arrow-up-from-bracket"></i> উইথড্র করুন
          </h2>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
              মূল ব্যালেন্স
            </p>
            <p className="text-base md:text-lg font-bold text-amber-400 font-mono mt-1 truncate">
              ৳{Number(user.balance || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-lg text-left relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 -mt-8 -mr-8 w-20 h-20 ${user.turnover > 0 ? "bg-rose-500/5" : "bg-emerald-500/5"} rounded-full blur-2xl pointer-events-none`}
            ></div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold truncate">
              টার্নওভার বাকি
            </p>
            <p
              className={`text-base md:text-lg font-bold font-mono mt-1 truncate ${user.turnover > 0 ? "text-rose-400" : "text-emerald-400"}`}
            >
              ৳{Number(user.turnover || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {user.turnover > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-400 shadow-lg">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 text-base"></i>
            <p className="text-[11px] md:text-xs font-bold leading-relaxed">
              আপনার টার্নওভার এখনো জিরো (0) হয়নি বিধায় উইথড্র রিকোয়েস্ট বন্ধ
              রয়েছে। গেম খেলে টার্নওভার শেষ করুন।
            </p>
          </div>
        )}

        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
          <form
            onSubmit={handleSubmitWithdraw}
            className="space-y-4 md:space-y-5"
          >
            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                পেমেন্ট মেথড সিলেক্ট করুন
              </label>
              <select
                value={method}
                onChange={(e) => handleMethodChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 cursor-pointer truncate"
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs md:text-sm text-slate-400 font-semibold">
                  {methodConfig.accountLabel}
                </label>
                {methodConfig.accountLocked ? (
                  <span className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                    <i className="fa-solid fa-lock"></i> লক করা
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
                className={`w-full bg-slate-950/60 border p-3 md:p-3.5 rounded-xl text-xs md:text-sm font-mono transition-colors ${
                  methodConfig.accountLocked
                    ? "border-slate-800 text-slate-400 cursor-not-allowed select-none"
                    : !isAccountLengthValid && accountNumber.length > 0
                      ? "border-rose-500 text-white outline-none focus:border-rose-500 bg-rose-500/5" // 🆕 লাল বর্ডার
                      : "border-slate-800 text-white outline-none focus:border-rose-500"
                }`}
              />

              {/* 🆕 লাইভ ভ্যালিডেশন মেসেজ */}
              {!methodConfig.accountLocked &&
                accountNumber.length > 0 &&
                !isAccountLengthValid && (
                  <p className="text-[10px] text-rose-400 mt-1.5 font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    অ্যাড্রেসটি সঠিক নয়। এটি অবশ্যই{" "}
                    {methodConfig.accountMinLength} থেকে{" "}
                    {methodConfig.accountMaxLength} অক্ষরের হতে হবে।
                  </p>
                )}

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
                          accountNumber.length === methodConfig.accountMaxLength
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

            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
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
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono"
              />
              {methodConfig.isCrypto && amount && (
                <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
                  ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (Rate: $1 = ৳
                  {usdToBdtRate})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                ৪ ডিজিটের সিকিউরিটি পিন
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="• • • •"
                value={pin}
                onChange={handlePinChange}
                className="w-full bg-slate-950 border border-slate-700 p-3 md:p-3.5 rounded-xl text-xs md:text-sm text-white outline-none focus:border-rose-500 font-mono tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                (user.turnover && user.turnover > 0) ||
                withdrawMethods.length === 0 ||
                (!methodConfig.accountLocked && !isAccountLengthValid) // 🆕 ভুল অ্যাড্রেস দিলে বাটন ডিজেবল থাকবে
              }
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 md:p-4 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  প্রসেস হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> উইথড্র রিকোয়েস্ট
                  পাঠান
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
