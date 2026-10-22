// // "use client";
// // import { useState, useEffect, useRef } from "react";
// // import { useRouter } from "next/navigation";
// // import TabSwitcher from "./TabSwitcher";

// // // // ==========================================
// // // // ✅ Method-specific Config (শুধু ক্রিপ্টো ডিটেকশনের জন্য)
// // // // ==========================================
// // // const getCryptoConfig = (methodName) => {
// // //   const upper = String(methodName || "").toUpperCase();

// // //   const isCrypto =
// // //     upper.includes("TRX") ||
// // //     upper.includes("TRON") ||
// // //     upper.includes("BINANCE") ||
// // //     upper.includes("USDT") ||
// // //     upper.includes("BTC") ||
// // //     upper.includes("BITCOIN") ||
// // //     upper.includes("ETH") ||
// // //     upper.includes("CRYPTO");

// // //   return {
// // //     isCrypto,
// // //     currency: isCrypto ? "USD" : "BDT",
// // //     amountLabel: isCrypto ? "টাকার পরিমাণ (USD $)" : "টাকার পরিমাণ (৳)",
// // //     amountPlaceholder: isCrypto ? "যেমন: 10" : "যেমন: 500",
// // //     senderLabel: isCrypto
// // //       ? "যে অ্যাড্রেস থেকে টাকা পাঠিয়েছেন"
// // //       : "যে নাম্বার থেকে টাকা পাঠিয়েছেন",
// // //     senderPlaceholder: isCrypto ? "Wallet Address" : "01700000000 (১১ ডিজিট)",
// // //     senderMinLength: isCrypto ? 5 : 11,
// // //     senderMaxLength: isCrypto ? 100 : 11,
// // //     senderOnlyDigits: !isCrypto,
// // //     adminLabel: isCrypto ? "পেমেন্ট অ্যাড্রেস:" : "পেমেন্ট নাম্বার:",
// // //   };
// // // };
// // // const getCryptoConfig = (methodName) => {
// // //   const upper = String(methodName || "").toUpperCase();

// // //   // ✅ ১. BINANCE PAY ID (শুধু সংখ্যা)
// // //   if (upper.includes("BINANCE")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "টাকার পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 10",
// // //       senderLabel: "আপনার Binance Pay ID",
// // //       senderPlaceholder: "যেমন: 4454344556",
// // //       senderMinLength: 5,
// // //       senderMaxLength: 15,
// // //       senderOnlyDigits: true,
// // //       adminLabel: "Binance Pay ID:",
// // //     };
// // //   }

// // //   // ✅ ২. TRX TRC20 (৩৪ অক্ষর)
// // //   if (upper.includes("TRX") || upper.includes("TRON")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "টাকার পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 10",
// // //       senderLabel: "যে অ্যাড্রেস থেকে টাকা পাঠিয়েছেন",
// // //       senderPlaceholder: "TXYZ... (৩৪ character)",
// // //       senderMinLength: 34,
// // //       senderMaxLength: 34,
// // //       senderOnlyDigits: false,
// // //       adminLabel: "পেমেন্ট অ্যাড্রেস:",
// // //     };
// // //   }

// // //   // ✅ ৩. USDT TRC20 (৩৪ অক্ষর)
// // //   if (upper.includes("USDT") && upper.includes("TRC20")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "টাকার পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 10",
// // //       senderLabel: "যে অ্যাড্রেস থেকে টাকা পাঠিয়েছেন",
// // //       senderPlaceholder: "TXYZ... (৩৪ character)",
// // //       senderMinLength: 34,
// // //       senderMaxLength: 34,
// // //       senderOnlyDigits: false,
// // //       adminLabel: "পেমেন্ট অ্যাড্রেস:",
// // //     };
// // //   }

// // //   // ✅ ৪. BNB BEP20 (২৬-৫০ অক্ষর)
// // //   if (upper.includes("BNB") || upper.includes("BEP20")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "টাকার পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 10",
// // //       senderLabel: "যে অ্যাড্রেস থেকে টাকা পাঠিয়েছেন",
// // //       senderPlaceholder: "BNB Wallet Address",
// // //       senderMinLength: 26,
// // //       senderMaxLength: 50,
// // //       senderOnlyDigits: false,
// // //       adminLabel: "BNB Address:",
// // //     };
// // //   }

// // //   // ✅ ৫. USDT BEP20 (২৬-৫০ অক্ষর)
// // //   if (upper.includes("USDT") && upper.includes("BEP20")) {
// // //     return {
// // //       isCrypto: true,
// // //       currency: "USD",
// // //       amountLabel: "টাকার পরিমাণ (USD $)",
// // //       amountPlaceholder: "যেমন: 10",
// // //       senderLabel: "যে অ্যাড্রেস থেকে টাকা পাঠিয়েছেন",
// // //       senderPlaceholder: "USDT (BEP20) Wallet Address",
// // //       senderMinLength: 26,
// // //       senderMaxLength: 50,
// // //       senderOnlyDigits: false,
// // //       adminLabel: "USDT (BEP20) Address:",
// // //     };
// // //   }

// // //   // ✅ ৬. ডিফল্ট (Mobile Banking / BDT / bKash / Nagad / Rocket) — ১১ ডিজিট
// // //   return {
// // //     isCrypto: false,
// // //     currency: "BDT",
// // //     amountLabel: "টাকার পরিমাণ (৳)",
// // //     amountPlaceholder: "যেমন: 500",
// // //     senderLabel: "যে নাম্বার থেকে টাকা পাঠিয়েছেন",
// // //     senderPlaceholder: "01700000000 (১১ ডিজিট)",
// // //     senderMinLength: 11,
// // //     senderMaxLength: 11,
// // //     senderOnlyDigits: true,
// // //     adminLabel: "পেমেন্ট নাম্বার:",
// // //   };
// // // };
// // const getCryptoConfig = (methodName) => {
// //   const upper = String(methodName || "").toUpperCase();

// //   // ✅ ১. TRX / TRON / USDT TRC20
// //   if (
// //     upper.includes("TRX") ||
// //     upper.includes("TRON") ||
// //     (upper.includes("USDT") && upper.includes("TRC20"))
// //   ) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "টাকার পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       senderLabel: "আপনার TRX/USDT (TRC20) Wallet Address", // 👈 হুবহু লেখা
// //       senderPlaceholder: "TXYZ... (৩৪ character)", // 👈 হুবহু লেখা
// //       senderMinLength: 34,
// //       senderMaxLength: 34,
// //       senderOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ২. BINANCE PAY ID
// //   if (upper.includes("BINANCE")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "টাকার পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       senderLabel: "আপনার Binance Pay ID",
// //       senderPlaceholder: "যেমন: 4454344556",
// //       senderMinLength: 5,
// //       senderMaxLength: 15,
// //       senderOnlyDigits: true,
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
// //       amountLabel: "টাকার পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       senderLabel: "আপনার BNB/BEP20 Wallet Address",
// //       senderPlaceholder: "BNB Wallet Address",
// //       senderMinLength: 26,
// //       senderMaxLength: 50,
// //       senderOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৪. BTC
// //   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "টাকার পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       senderLabel: "আপনার Bitcoin Wallet Address",
// //       senderPlaceholder: "bc1... or 1...",
// //       senderMinLength: 26,
// //       senderMaxLength: 50,
// //       senderOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৫. ETH
// //   if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
// //     return {
// //       isCrypto: true,
// //       currency: "USD",
// //       amountLabel: "টাকার পরিমাণ (USD $)",
// //       amountPlaceholder: "যেমন: 10",
// //       senderLabel: "আপনার ETH Wallet Address",
// //       senderPlaceholder: "0x...",
// //       senderMinLength: 40,
// //       senderMaxLength: 50,
// //       senderOnlyDigits: false,
// //     };
// //   }

// //   // ✅ ৬. ডিফল্ট (Mobile Banking / BDT)
// //   return {
// //     isCrypto: false,
// //     currency: "BDT",
// //     amountLabel: "টাকার পরিমাণ (৳)",
// //     amountPlaceholder: "যেমন: 500",
// //     senderLabel: "যে নাম্বার থেকে টাকা পাঠিয়েছেন",
// //     senderPlaceholder: "01700000000 (১১ ডিজিট)",
// //     senderMinLength: 11,
// //     senderMaxLength: 11,
// //     senderOnlyDigits: true,
// //   };
// // };
// // export default function UserDepositPage() {
// //   const router = useRouter();

// //   // ✅ এজেন্ট ও তার মেথড স্টেট
// //   const [agents, setAgents] = useState([]);
// //   const [selectedAgentId, setSelectedAgentId] = useState("");
// //   const [agentsLoading, setAgentsLoading] = useState(true);

// //   const [agentAccounts, setAgentAccounts] = useState([]);
// //   const [selectedAgentAccount, setSelectedAgentAccount] = useState(null);

// //   const [amount, setAmount] = useState("");
// //   const [senderNumber, setSenderNumber] = useState("");
// //   const [transactionId, setTransactionId] = useState("");

// //   const [trxError, setTrxError] = useState("");
// //   const [agentBalanceError, setAgentBalanceError] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   // 🆕 NowPayments state
// //   const [npAmount, setNpAmount] = useState("");
// //   const [npCurrency, setNpCurrency] = useState("usdttrc20");
// //   const [npLoading, setNpLoading] = useState(false);
// //   const [showNowPayments, setShowNowPayments] = useState(false);
// //   const [autoCryptoEnabled, setAutoCryptoEnabled] = useState(true);

// //   const [toast, setToast] = useState({
// //     show: false,
// //     message: "",
// //     type: "success",
// //   });
// //   const [usdToBdtRate, setUsdToBdtRate] = useState(120);
// //   const [cryptoPrices, setCryptoPrices] = useState({
// //     TRX: 0.15,
// //     SOL: 150,
// //     BNB: 600,
// //   });
// //   const [minAmounts, setMinAmounts] = useState({
// //     usdttrc20: 5,
// //     trx: 5,
// //     bnbbsc: 25,
// //     sol: 20,
// //   });

// //   const submittingRef = useRef(false);
// //   const successLockRef = useRef(false);
// //   const npSubmittingRef = useRef(false);
// //   const toastTimerRef = useRef(null);
// //   const successTimerRef = useRef(null);

// //   const methodConfig = getCryptoConfig(selectedAgentAccount?.method);

// //   const showToast = (message, type = "success") => {
// //     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //     setToast({ show: true, message, type });
// //     toastTimerRef.current = setTimeout(() => {
// //       setToast({ show: false, message: "", type: "success" });
// //       toastTimerRef.current = null;
// //     }, 3500);
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
// //       if (successTimerRef.current) clearTimeout(successTimerRef.current);
// //     };
// //   }, []);

// //   // ✅ Load Initial Data
// //   useEffect(() => {
// //     fetch("/api/admin/exchange-rate", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.rate)
// //           setUsdToBdtRate(Number(data.rate) || 120);
// //       })
// //       .catch((err) => console.error("Rate fetch error:", err));

// //     fetch("/api/crypto-prices")
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success) setCryptoPrices(data.prices);
// //       })
// //       .catch((err) => console.error("Crypto price error:", err));

// //     fetch("/api/nowpayments/min-amount", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && data.minimums) {
// //           setMinAmounts((prev) => ({ ...prev, ...data.minimums }));
// //         }
// //       })
// //       .catch((err) => console.error("Min amount fetch error:", err));

// //     fetch("/api/admin/settings/auto-crypto")
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success) {
// //           setAutoCryptoEnabled(data.enabled !== false);
// //           if (!data.enabled) setShowNowPayments(false);
// //         }
// //       })
// //       .catch((err) => console.error("Auto crypto status error:", err));

// //     // 🆕 এজেন্ট ও তাদের মেথড লোড
// //     fetch("/api/user/agent-list", { credentials: "include" })
// //       .then((res) => res.json())
// //       .then((data) => {
// //         if (data.success && Array.isArray(data.agents)) {
// //           setAgents(data.agents);
// //           if (data.agents.length > 0) {
// //             setSelectedAgentId(
// //               data.agents[0].agentCode || data.agents[0].agentPhone,
// //             );
// //           }
// //         }
// //       })
// //       .catch((err) => console.error("Agent list fetch error:", err))
// //       .finally(() => setAgentsLoading(false));
// //   }, []);

// //   // 🆕 এজেন্ট সিলেক্ট হলে তার মেথড লোড হবে
// //   useEffect(() => {
// //     const activeAgent = agents.find(
// //       (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
// //     );
// //     if (activeAgent?.paymentAccounts?.length > 0) {
// //       setAgentAccounts(activeAgent.paymentAccounts);
// //       setSelectedAgentAccount(activeAgent.paymentAccounts[0]);
// //     } else {
// //       setAgentAccounts([]);
// //       setSelectedAgentAccount(null);
// //     }

// //     setSenderNumber("");
// //     setAmount("");
// //     setTransactionId("");
// //     setTrxError("");
// //     setAgentBalanceError("");
// //   }, [selectedAgentId, agents]);

// //   // ✅ TrxID real-time check
// //   useEffect(() => {
// //     const checkTrx = async () => {
// //       const cleanTrxId = transactionId.trim();
// //       if (!cleanTrxId || cleanTrxId.length < 5) {
// //         setTrxError("");
// //         return;
// //       }
// //       if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
// //         setTrxError(
// //           "ট্রানজেকশনে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!",
// //         );
// //         return;
// //       }
// //       try {
// //         const res = await fetch("/api/game/check-trx", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           credentials: "include",
// //           body: JSON.stringify({ transactionId: cleanTrxId }),
// //         });
// //         const data = await res.json();
// //         if (data.exists) setTrxError(data.message);
// //         else setTrxError("");
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     };
// //     const timer = setTimeout(checkTrx, 500);
// //     return () => clearTimeout(timer);
// //   }, [transactionId]);

// //   // 🆕 এজেন্ট ব্যালেন্স চেক
// //   useEffect(() => {
// //     setAgentBalanceError("");
// //     if (!selectedAgentId || !amount) return;

// //     const cleanAmount = Number(amount);
// //     if (!cleanAmount || cleanAmount <= 0) return;

// //     const selectedAgent = agents.find(
// //       (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
// //     );
// //     if (!selectedAgent) return;

// //     const requiredBDT = methodConfig.isCrypto
// //       ? cleanAmount * usdToBdtRate
// //       : cleanAmount;

// //     if (requiredBDT > selectedAgent.agentBalance) {
// //       setAgentBalanceError(`এই এজেন্টের কাছে পর্যাপ্ত ব্যালেন্স নেই।`);
// //     }
// //   }, [amount, selectedAgentId, agents, usdToBdtRate, methodConfig.isCrypto]);

// //   const handleCopy = (num) => {
// //     navigator.clipboard.writeText(num);
// //     showToast("কপি করা হয়েছে!", "success");
// //   };

// //   const handleSenderChange = (value) => {
// //     let sanitized = value;
// //     if (methodConfig.senderOnlyDigits) sanitized = value.replace(/\D/g, "");
// //     else sanitized = value.replace(/[^a-zA-Z0-9]/g, "");

// //     if (sanitized.length <= methodConfig.senderMaxLength)
// //       setSenderNumber(sanitized);
// //   };

// //   const calculateCrypto = (usdAmount, currency) => {
// //     const amt = Number(usdAmount);
// //     if (!amt || amt <= 0 || isNaN(amt)) return "0";
// //     if (currency === "usdttrc20") return amt.toFixed(2);
// //     if (currency === "trx") return (amt / cryptoPrices.TRX).toFixed(4);
// //     if (currency === "sol") return (amt / cryptoPrices.SOL).toFixed(6);
// //     if (currency === "bnbbsc") return (amt / cryptoPrices.BNB).toFixed(6);
// //     return "0";
// //   };

// //   const getCryptoName = (currency) => {
// //     if (currency === "usdttrc20") return "USDT";
// //     if (currency === "trx") return "TRX";
// //     if (currency === "sol") return "SOL";
// //     if (currency === "bnbbsc") return "BNB";
// //     return "";
// //   };

// //   const getCryptoPrice = (currency) => {
// //     if (currency === "usdttrc20") return 1;
// //     if (currency === "trx") return cryptoPrices.TRX;
// //     if (currency === "sol") return cryptoPrices.SOL;
// //     if (currency === "bnbbsc") return cryptoPrices.BNB;
// //     return 0;
// //   };

// //   const getMinAmount = (currency) => minAmounts[currency] || 5;

// //   const handleSubmitDeposit = async (e) => {
// //     e.preventDefault();
// //     if (submittingRef.current || successLockRef.current) return;
// //     submittingRef.current = true;
// //     setLoading(true);

// //     try {
// //       if (trxError) {
// //         showToast("সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!", "error");
// //         return;
// //       }
// //       if (!selectedAgentId || !selectedAgentAccount) {
// //         showToast("এজেন্ট ও মেথড সিলেক্ট করুন!", "error");
// //         return;
// //       }
// //       if (agentBalanceError) {
// //         showToast(agentBalanceError, "error");
// //         return;
// //       }

// //       const cleanAmount = Number(amount);
// //       if (isNaN(cleanAmount) || cleanAmount <= 0) {
// //         showToast("সঠিক পরিমাণ দিন!", "error");
// //         return;
// //       }

// //       const minAmount = methodConfig.isCrypto ? 4 : 500;
// //       if (cleanAmount < minAmount) {
// //         showToast(
// //           methodConfig.isCrypto
// //             ? `সর্বনিম্ন $${minAmount}!`
// //             : `সর্বনিম্ন ৳${minAmount}!`,
// //           "error",
// //         );
// //         return;
// //       }

// //       const cleanSenderNumber = senderNumber.trim();
// //       if (cleanSenderNumber.length < methodConfig.senderMinLength) {
// //         showToast(
// //           `${methodConfig.senderLabel} — কমপক্ষে ${methodConfig.senderMinLength} ${methodConfig.senderOnlyDigits ? "ডিজিট" : "character"}!`,
// //           "error",
// //         );
// //         return;
// //       }

// //       const cleanTrxId = transactionId.trim().toUpperCase();
// //       const selectedAgent = agents.find(
// //         (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
// //       );

// //       const res = await fetch("/api/game/deposit", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({
// //           amount: cleanAmount,
// //           method: selectedAgentAccount.method,
// //           accountNumber: cleanSenderNumber,
// //           transactionId: cleanTrxId,
// //           agentId: selectedAgent?._id,
// //         }),
// //       });
// //       const data = await res.json();
// //       showToast(data.message, data.success ? "success" : "error");

// //       if (data.success) {
// //         successLockRef.current = true;
// //         setAmount("");
// //         setSenderNumber("");
// //         setTransactionId("");
// //         successTimerRef.current = setTimeout(() => {
// //           successLockRef.current = false;
// //           successTimerRef.current = null;
// //         }, 2500);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       showToast("সার্ভার ত্রুটি!", "error");
// //     } finally {
// //       submittingRef.current = false;
// //       setLoading(false);
// //     }
// //   };

// //   const handleNowPayments = async () => {
// //     if (npSubmittingRef.current) return;
// //     npSubmittingRef.current = true;
// //     const cleanAmount = Number(npAmount);
// //     const minAmount = getMinAmount(npCurrency);

// //     if (!cleanAmount || cleanAmount < minAmount) {
// //       showToast(
// //         `সর্বনিম্ন $${minAmount} — ${getCryptoName(npCurrency)}!`,
// //         "error",
// //       );
// //       npSubmittingRef.current = false;
// //       return;
// //     }

// //     try {
// //       setNpLoading(true);
// //       const res = await fetch("/api/nowpayments/create-invoice", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({ amount: cleanAmount, payCurrency: npCurrency }),
// //       });
// //       const data = await res.json();

// //       if (data.success && data.invoice_url) {
// //         showToast("NowPayments-এ redirect করা হচ্ছে...", "success");
// //         setTimeout(() => {
// //           window.location.href = data.invoice_url;
// //         }, 500);
// //       } else {
// //         showToast(data.message || "Invoice তৈরি হয়নি!", "error");
// //         npSubmittingRef.current = false;
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       showToast("সার্ভার ত্রুটি!", "error");
// //       npSubmittingRef.current = false;
// //     } finally {
// //       setNpLoading(false);
// //     }
// //   };

// //   const isDepositDisabled =
// //     loading ||
// //     !!trxError ||
// //     !!agentBalanceError ||
// //     !selectedAgentId ||
// //     !selectedAgentAccount;

// //   return (
// //     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
// //       {/* Toast */}
// //       {toast.show && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
// //           <div
// //             className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${toast.type === "success" ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-slate-900 border-rose-500 text-rose-400"}`}
// //           >
// //             <i
// //               className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-3xl" : "fa-circle-exclamation text-3xl"}`}
// //             ></i>
// //             <span className="leading-relaxed">{toast.message}</span>
// //           </div>
// //         </div>
// //       )}

// //       <div className="w-full max-w-md md:max-w-xl space-y-4">
// //         {/* Header */}
// //         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
// //           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
// //             <i className="fa-solid fa-download"></i> ডিপোজিট করুন
// //           </h2>
// //           <button
// //             onClick={() => {
// //               if (typeof window !== "undefined" && window.history.length > 1)
// //                 router.back();
// //               else router.push("/");
// //             }}
// //             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
// //           >
// //             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
// //           </button>
// //         </div>

// //         {autoCryptoEnabled ? (
// //           <TabSwitcher
// //             value={showNowPayments}
// //             onChange={setShowNowPayments}
// //             rate={usdToBdtRate}
// //           />
// //         ) : (
// //           <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/30 shadow-lg text-center">
// //             <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
// //               <i className="fa-solid fa-hand-holding-dollar"></i> Manual Deposit
// //             </span>
// //           </div>
// //         )}

// //         {/* ============ MANUAL DEPOSIT FORM ============ */}
// //         {!showNowPayments && (
// //           <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
// //             <form onSubmit={handleSubmitDeposit} className="space-y-5">
// //               {/* 🆕 এজেন্ট সিলেক্ট */}
// //               <div>
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                   এজেন্ট সিলেক্ট করুন
// //                 </label>
// //                 <select
// //                   value={selectedAgentId}
// //                   onChange={(e) => setSelectedAgentId(e.target.value)}
// //                   disabled={agentsLoading}
// //                   className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
// //                 >
// //                   {agentsLoading ? (
// //                     <option>লোড হচ্ছে...</option>
// //                   ) : agents.length === 0 ? (
// //                     <option value="">কোনো এজেন্ট নেই</option>
// //                   ) : (
// //                     agents.map((a) => (
// //                       <option
// //                         key={a._id || a.agentCode || a.agentPhone}
// //                         value={a.agentCode || a.agentPhone}
// //                       >
// //                         {/* ✅ শুধু এজেন্টের কোড দেখাবে */}
// //                         {a.agentCode ? a.agentCode : "Agent"}
// //                       </option>
// //                     ))
// //                   )}
// //                 </select>
// //               </div>

// //               {/* 🆕 এজেন্টের মেথড সিলেক্ট */}
// //               <div>
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                   পেমেন্ট মেথড সিলেক্ট করুন
// //                 </label>
// //                 <select
// //                   value={selectedAgentAccount?.accountNumber || ""}
// //                   onChange={(e) => {
// //                     const acc = agentAccounts.find(
// //                       (a) => a.accountNumber === e.target.value,
// //                     );
// //                     setSelectedAgentAccount(acc);
// //                   }}
// //                   disabled={agentAccounts.length === 0}
// //                   className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
// //                 >
// //                   {agentAccounts.length === 0 ? (
// //                     <option value="">-- মেথড নেই --</option>
// //                   ) : (
// //                     agentAccounts.map((acc, i) => (
// //                       <option key={i} value={acc.accountNumber}>
// //                         {/* ✅ শুধু মেথডের নাম দেখাবে */}
// //                         {acc.method}
// //                       </option>
// //                     ))
// //                   )}
// //                 </select>
// //               </div>

// //               {/* 🆕 সিলেক্ট করা অ্যাকাউন্টের নাম্বার ও কপি বাটন */}
// //               {selectedAgentAccount && (
// //                 <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
// //                   <div className="flex justify-between text-xs md:text-sm text-slate-400">
// //                     <span className="text-emerald-400 font-bold">
// //                       {selectedAgentAccount.method} নাম্বার:
// //                     </span>
// //                     <span className="text-amber-400 font-bold">
// //                       মিনিমাম: {methodConfig.isCrypto ? `$${4}` : `৳500`}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
// //                     <span className="font-mono text-base md:text-lg font-bold text-emerald-400 break-all">
// //                       {selectedAgentAccount.accountNumber}
// //                     </span>
// //                     <button
// //                       type="button"
// //                       onClick={() =>
// //                         handleCopy(selectedAgentAccount.accountNumber)
// //                       }
// //                       className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
// //                     >
// //                       <i className="fa-solid fa-copy"></i> কপি
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               <div>
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
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
// //                   className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none font-mono ${agentBalanceError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
// //                 />
// //                 {methodConfig.isCrypto && amount && (
// //                   <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
// //                     ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (রেট: $1 = ৳
// //                     {usdToBdtRate})
// //                   </p>
// //                 )}
// //                 {agentBalanceError && (
// //                   <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
// //                     <i className="fa-solid fa-circle-exclamation"></i>{" "}
// //                     {agentBalanceError}
// //                   </p>
// //                 )}
// //               </div>

// //               <div>
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                   {methodConfig.senderLabel}
// //                 </label>
// //                 <input
// //                   type="text"
// //                   inputMode={methodConfig.senderOnlyDigits ? "numeric" : "text"}
// //                   maxLength={methodConfig.senderMaxLength}
// //                   placeholder={methodConfig.senderPlaceholder}
// //                   value={senderNumber}
// //                   onChange={(e) => handleSenderChange(e.target.value)}
// //                   className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 font-mono"
// //                 />
// //                 <p className="text-[10px] text-slate-500 mt-1">
// //                   {methodConfig.senderOnlyDigits
// //                     ? `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} ডিজিট`
// //                     : `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} character`}{" "}
// //                   — {senderNumber.length}/{methodConfig.senderMaxLength}
// //                 </p>
// //               </div>

// //               <div>
// //                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                   ট্রানজেকশন আইডি (TrxID)
// //                 </label>
// //                 <input
// //                   type="text"
// //                   placeholder="M4K8..."
// //                   value={transactionId}
// //                   onChange={(e) =>
// //                     setTransactionId(
// //                       e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
// //                     )
// //                   }
// //                   className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none uppercase font-mono ${trxError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
// //                 />
// //                 {trxError && (
// //                   <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
// //                     <i className="fa-solid fa-circle-exclamation"></i>{" "}
// //                     {trxError}
// //                   </p>
// //                 )}
// //               </div>

// //               <button
// //                 type="submit"
// //                 disabled={isDepositDisabled}
// //                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
// //               >
// //                 {loading ? (
// //                   <>
// //                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
// //                     সাবমিট হচ্ছে...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <i className="fa-solid fa-paper-plane"></i> ডিপোজিট
// //                     রিকোয়েস্ট পাঠান
// //                   </>
// //                 )}
// //               </button>
// //             </form>
// //           </div>
// //         )}

// //         {/* ============ NOWPAYMENTS AUTO CRYPTO ============ */}
// //         {showNowPayments && autoCryptoEnabled && (
// //           <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 p-4 md:p-6 rounded-2xl border border-blue-500/30 shadow-lg space-y-5">
// //             <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
// //               <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
// //                 <i className="fa-solid fa-bolt text-xl"></i>
// //               </div>
// //               <div className="flex-1 min-w-0">
// //                 <h3 className="text-sm md:text-base font-bold text-blue-400">
// //                   NowPayments — Auto Crypto
// //                 </h3>
// //                 <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-relaxed">
// //                   USDT, TRX, BNB, SOL দিয়ে instant deposit করুন। Payment
// //                   confirm হলেই auto balance add হবে।
// //                 </p>
// //               </div>
// //             </div>

// //             <div>
// //               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                 পেমেন্ট কারেন্সি
// //               </label>
// //               <select
// //                 value={npCurrency}
// //                 onChange={(e) => setNpCurrency(e.target.value)}
// //                 className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
// //               >
// //                 <option value="usdttrc20">USDT (TRC20) — কম ফি</option>
// //                 <option value="trx">TRON (TRX)</option>
// //                 <option value="bnbbsc">Binance Coin (BSC)</option>
// //                 <option value="sol">Solana (SOL)</option>
// //               </select>
// //             </div>

// //             <div>
// //               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
// //                 পরিমাণ (USD $) — যত ডলার ডিপোজিট করবেন
// //               </label>
// //               <div className="relative">
// //                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">
// //                   $
// //                 </span>
// //                 <input
// //                   type="number"
// //                   step="any"
// //                   min={getMinAmount(npCurrency)}
// //                   value={npAmount}
// //                   onChange={(e) => {
// //                     const val = e.target.value;
// //                     if (val === "" || Number(val) >= 0) setNpAmount(val);
// //                   }}
// //                   placeholder={`যেমন: ${getMinAmount(npCurrency)}`}
// //                   className="w-full bg-slate-950 border border-slate-700 p-3 pl-9 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
// //                 />
// //               </div>
// //               <p className="text-[10px] text-slate-500 mt-1">
// //                 সর্বনিম্ন ${getMinAmount(npCurrency)} —{" "}
// //                 {getCryptoName(npCurrency)}
// //               </p>
// //             </div>

// //             {npAmount && Number(npAmount) >= getMinAmount(npCurrency) && (
// //               <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl overflow-hidden">
// //                 <div className="p-4 border-b border-blue-500/20">
// //                   <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
// //                     আপনি পাঠাবেন
// //                   </p>
// //                   <div className="flex items-baseline gap-2 flex-wrap">
// //                     <span className="text-3xl md:text-4xl font-black text-blue-400 font-mono">
// //                       {calculateCrypto(npAmount, npCurrency)}
// //                     </span>
// //                     <span className="text-base md:text-lg font-bold text-slate-200">
// //                       {getCryptoName(npCurrency)}
// //                     </span>
// //                   </div>
// //                   <p className="text-[11px] text-slate-500 mt-1">
// //                     ≈ ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)} BDT
// //                   </p>
// //                 </div>
// //                 <div className="p-4 border-b border-blue-500/20 bg-blue-950/20">
// //                   <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
// //                     লাইভ রেট
// //                   </p>
// //                   <div className="flex items-center justify-between text-xs">
// //                     <span className="text-slate-300">
// //                       1 {getCryptoName(npCurrency)} =
// //                     </span>
// //                     <span className="font-mono font-bold text-emerald-400">
// //                       ${getCryptoPrice(npCurrency).toFixed(4)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between text-xs mt-1.5">
// //                     <span className="text-slate-300">$1 =</span>
// //                     <span className="font-mono font-bold text-emerald-400">
// //                       ৳{usdToBdtRate}
// //                     </span>
// //                   </div>
// //                 </div>
// //                 <div className="p-4 space-y-2">
// //                   <div className="flex items-center justify-between text-xs">
// //                     <span className="text-slate-400">ডিপোজিট অ্যামাউন্ট</span>
// //                     <span className="font-mono text-slate-200">
// //                       ${Number(npAmount).toFixed(2)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between text-xs">
// //                     <span className="text-slate-400">
// //                       NowPayments ফি (~0.5%)
// //                     </span>
// //                     <span className="font-mono text-slate-200">
// //                       ${(Number(npAmount) * 0.005).toFixed(2)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between text-xs">
// //                     <span className="text-slate-400">নেটওয়ার্ক ফি</span>
// //                     <span className="font-mono text-slate-200">
// //                       {npCurrency === "usdttrc20"
// //                         ? "~$0.50"
// //                         : npCurrency === "trx"
// //                           ? "~$0.10"
// //                           : npCurrency === "bnbbsc"
// //                             ? "~$0.20"
// //                             : "~$0.02"}
// //                     </span>
// //                   </div>
// //                   <div className="border-t border-blue-500/20 pt-2 mt-2 flex items-center justify-between text-xs">
// //                     <span className="text-slate-300 font-semibold">
// //                       মোট পাঠাতে হবে
// //                     </span>
// //                     <span className="font-mono font-bold text-blue-400">
// //                       ${Number(npAmount).toFixed(2)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between text-xs">
// //                     <span className="text-slate-300 font-semibold">
// //                       আপনি পাবেন
// //                     </span>
// //                     <span className="font-mono font-bold text-emerald-400">
// //                       ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)}
// //                     </span>
// //                   </div>
// //                 </div>
// //                 <div className="px-4 py-2.5 bg-blue-500/10 border-t border-blue-500/20 flex items-center gap-2">
// //                   <i className="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
// //                   <p className="text-[10px] text-slate-400">
// //                     Payment confirm হলে ২-৫ মিনিটে অটো ব্যালেন্স যোগ হবে
// //                   </p>
// //                 </div>
// //               </div>
// //             )}

// //             <div className="bg-blue-950/40 border border-blue-500/20 p-3 rounded-xl">
// //               <p className="text-[10px] md:text-xs text-blue-300 leading-relaxed flex items-start gap-2">
// //                 <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
// //                 <span>
// //                   NowPayments পেজে redirect হবেন। সেখানে payment সম্পন্ন করলে
// //                   auto আপনার wallet-এ balance যোগ হবে।
// //                 </span>
// //               </p>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={handleNowPayments}
// //               disabled={
// //                 npLoading ||
// //                 !npAmount ||
// //                 Number(npAmount) < getMinAmount(npCurrency)
// //               }
// //               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95 text-white"
// //             >
// //               {npLoading ? (
// //                 <>
// //                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
// //                   Invoice তৈরি হচ্ছে...
// //                 </>
// //               ) : (
// //                 <>
// //                   <i className="fa-solid fa-arrow-up-right-from-square"></i>{" "}
// //                   NowPayments এ পেমেন্ট করুন
// //                 </>
// //               )}
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// // /////////////////////////////////////////////////////////////////////////////////
// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import TabSwitcher from "./TabSwitcher";

// // ==========================================
// // ✅ Method-specific Config (আপডেট করা হয়েছে)
// // ==========================================
// // ==========================================
// // ✅ Method-specific Config (সঠিক নেটওয়ার্ক ডিটেকশন)
// // ==========================================
// // ==========================================
// // ✅ Method-specific Config (ডিপোজিট পেজের জন্য সংশোধিত)
// // ==========================================
// // ==========================================
// // ✅ Method-specific Config (১০০% সঠিক)
// // ==========================================
// const getCryptoConfig = (methodName) => {
//   const upper = String(methodName || "").toUpperCase();

//   // ✅ ১. USDT TRC20
//   if (upper.includes("TRC20")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার USDT (TRC20) Wallet Address",
//       senderPlaceholder: "TXYZ... (৩৪ character)",
//       senderMinLength: 34,
//       senderMaxLength: 34,
//       senderOnlyDigits: false,
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
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার BEP20 Wallet Address",
//       senderPlaceholder: "0x... (৪২ character)",
//       senderMinLength: 42,
//       senderMaxLength: 42,
//       senderOnlyDigits: false,
//     };
//   }

//   // ✅ ৩. TRX / TRON (শুধু TRC20 ছাড়া)
//   if (
//     (upper.includes("TRX") || upper.includes("TRON")) &&
//     !upper.includes("TRC20")
//   ) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার TRX Wallet Address",
//       senderPlaceholder: "TXYZ... (৩৪ character)",
//       senderMinLength: 34,
//       senderMaxLength: 34,
//       senderOnlyDigits: false,
//     };
//   }

//   // ✅ ৪. BINANCE PAY ID
//   if (upper.includes("BINANCE")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার Binance Pay ID",
//       senderPlaceholder: "যেমন: 4454344556",
//       senderMinLength: 5,
//       senderMaxLength: 15,
//       senderOnlyDigits: true,
//     };
//   }

//   // ✅ ৫. BTC
//   if (upper.includes("BTC") || upper.includes("BITCOIN")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার Bitcoin Wallet Address",
//       senderPlaceholder: "bc1... or 1...",
//       senderMinLength: 26,
//       senderMaxLength: 50,
//       senderOnlyDigits: false,
//     };
//   }

//   // ✅ ৬. ETH
//   if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
//     return {
//       isCrypto: true,
//       currency: "USD",
//       amountLabel: "টাকার পরিমাণ (USD $)",
//       amountPlaceholder: "যেমন: 10",
//       senderLabel: "আপনার ETH Wallet Address",
//       senderPlaceholder: "0x... (৪২ character)",
//       senderMinLength: 42,
//       senderMaxLength: 42,
//       senderOnlyDigits: false,
//     };
//   }

//   // ✅ ৭. মোবাইল ব্যাংকিং (bKash/Nagad/Rocket ইত্যাদি)
//   return {
//     isCrypto: false,
//     currency: "BDT",
//     amountLabel: "টাকার পরিমাণ (৳)",
//     amountPlaceholder: "যেমন: 500",
//     senderLabel: "যে নাম্বার থেকে টাকা পাঠিয়েছেন",
//     senderPlaceholder: "01700000000 (১১ ডিজিট)",
//     senderMinLength: 11,
//     senderMaxLength: 11,
//     senderOnlyDigits: true,
//   };
// };
// // ==========================================

// export default function UserDepositPage() {
//   const router = useRouter();

//   // ✅ এজেন্ট ও তার মেথড স্টেট
//   const [agents, setAgents] = useState([]);
//   const [selectedAgentId, setSelectedAgentId] = useState("");
//   const [agentsLoading, setAgentsLoading] = useState(true);

//   const [agentAccounts, setAgentAccounts] = useState([]);
//   const [selectedAgentAccount, setSelectedAgentAccount] = useState(null);

//   const [amount, setAmount] = useState("");
//   const [senderNumber, setSenderNumber] = useState("");
//   const [transactionId, setTransactionId] = useState("");

//   const [trxError, setTrxError] = useState("");
//   const [agentBalanceError, setAgentBalanceError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // 🆕 NowPayments state
//   const [npAmount, setNpAmount] = useState("");
//   const [npCurrency, setNpCurrency] = useState("usdttrc20");
//   const [npLoading, setNpLoading] = useState(false);
//   const [showNowPayments, setShowNowPayments] = useState(false);
//   const [autoCryptoEnabled, setAutoCryptoEnabled] = useState(true);

//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "success",
//   });
//   const [usdToBdtRate, setUsdToBdtRate] = useState(120);
//   const [cryptoPrices, setCryptoPrices] = useState({
//     TRX: 0.15,
//     SOL: 150,
//     BNB: 600,
//   });
//   const [minAmounts, setMinAmounts] = useState({
//     usdttrc20: 5,
//     trx: 5,
//     bnbbsc: 25,
//     sol: 20,
//   });

//   const submittingRef = useRef(false);
//   const successLockRef = useRef(false);
//   const npSubmittingRef = useRef(false);
//   const toastTimerRef = useRef(null);
//   const successTimerRef = useRef(null);

//   const methodConfig = getCryptoConfig(selectedAgentAccount?.method);

//   // 🆕 সেন্ডার অ্যাড্রেসের লাইভ ভ্যালিডেশন চেক
//   const isSenderLengthValid =
//     senderNumber.length >= methodConfig.senderMinLength &&
//     senderNumber.length <= methodConfig.senderMaxLength;

//   const showToast = (message, type = "success") => {
//     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//     setToast({ show: true, message, type });
//     toastTimerRef.current = setTimeout(() => {
//       setToast({ show: false, message: "", type: "success" });
//       toastTimerRef.current = null;
//     }, 3500);
//   };

//   useEffect(() => {
//     return () => {
//       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
//       if (successTimerRef.current) clearTimeout(successTimerRef.current);
//     };
//   }, []);

//   // ✅ Load Initial Data
//   useEffect(() => {
//     fetch("/api/admin/exchange-rate", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.rate)
//           setUsdToBdtRate(Number(data.rate) || 120);
//       })
//       .catch((err) => console.error("Rate fetch error:", err));

//     fetch("/api/crypto-prices")
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setCryptoPrices(data.prices);
//       })
//       .catch((err) => console.error("Crypto price error:", err));

//     fetch("/api/nowpayments/min-amount", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && data.minimums) {
//           setMinAmounts((prev) => ({ ...prev, ...data.minimums }));
//         }
//       })
//       .catch((err) => console.error("Min amount fetch error:", err));

//     fetch("/api/admin/settings/auto-crypto")
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           setAutoCryptoEnabled(data.enabled !== false);
//           if (!data.enabled) setShowNowPayments(false);
//         }
//       })
//       .catch((err) => console.error("Auto crypto status error:", err));

//     // এজেন্ট ও তাদের মেথড লোড
//     fetch("/api/user/agent-list", { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && Array.isArray(data.agents)) {
//           setAgents(data.agents);
//           if (data.agents.length > 0) {
//             setSelectedAgentId(
//               data.agents[0].agentCode || data.agents[0].agentPhone,
//             );
//           }
//         }
//       })
//       .catch((err) => console.error("Agent list fetch error:", err))
//       .finally(() => setAgentsLoading(false));
//   }, []);

//   // 🆕 এজেন্ট সিলেক্ট হলে তার মেথড লোড হবে
//   useEffect(() => {
//     const activeAgent = agents.find(
//       (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
//     );
//     if (activeAgent?.paymentAccounts?.length > 0) {
//       setAgentAccounts(activeAgent.paymentAccounts);
//       setSelectedAgentAccount(activeAgent.paymentAccounts[0]);
//     } else {
//       setAgentAccounts([]);
//       setSelectedAgentAccount(null);
//     }

//     setSenderNumber("");
//     setAmount("");
//     setTransactionId("");
//     setTrxError("");
//     setAgentBalanceError("");
//   }, [selectedAgentId, agents]);

//   // ✅ TrxID real-time check
//   useEffect(() => {
//     const checkTrx = async () => {
//       const cleanTrxId = transactionId.trim();
//       if (!cleanTrxId || cleanTrxId.length < 5) {
//         setTrxError("");
//         return;
//       }
//       if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
//         setTrxError(
//           "ট্রানজেকশনে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!",
//         );
//         return;
//       }
//       try {
//         const res = await fetch("/api/game/check-trx", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({ transactionId: cleanTrxId }),
//         });
//         const data = await res.json();
//         if (data.exists) setTrxError(data.message);
//         else setTrxError("");
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     const timer = setTimeout(checkTrx, 500);
//     return () => clearTimeout(timer);
//   }, [transactionId]);

//   // 🆕 এজেন্ট ব্যালেন্স চেক
//   useEffect(() => {
//     setAgentBalanceError("");
//     if (!selectedAgentId || !amount) return;

//     const cleanAmount = Number(amount);
//     if (!cleanAmount || cleanAmount <= 0) return;

//     const selectedAgent = agents.find(
//       (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
//     );
//     if (!selectedAgent) return;

//     const requiredBDT = methodConfig.isCrypto
//       ? cleanAmount * usdToBdtRate
//       : cleanAmount;

//     if (requiredBDT > selectedAgent.agentBalance) {
//       setAgentBalanceError(`এই এজেন্টের কাছে পর্যাপ্ত ব্যালেন্স নেই।`);
//     }
//   }, [amount, selectedAgentId, agents, usdToBdtRate, methodConfig.isCrypto]);

//   const handleCopy = (num) => {
//     navigator.clipboard.writeText(num);
//     showToast("কপি করা হয়েছে!", "success");
//   };

//   const handleSenderChange = (value) => {
//     let sanitized = value;
//     if (methodConfig.senderOnlyDigits) sanitized = value.replace(/\D/g, "");
//     else sanitized = value.replace(/[^a-zA-Z0-9]/g, "");

//     if (sanitized.length <= methodConfig.senderMaxLength)
//       setSenderNumber(sanitized);
//   };

//   const calculateCrypto = (usdAmount, currency) => {
//     const amt = Number(usdAmount);
//     if (!amt || amt <= 0 || isNaN(amt)) return "0";
//     if (currency === "usdttrc20") return amt.toFixed(2);
//     if (currency === "trx") return (amt / cryptoPrices.TRX).toFixed(4);
//     if (currency === "sol") return (amt / cryptoPrices.SOL).toFixed(6);
//     if (currency === "bnbbsc") return (amt / cryptoPrices.BNB).toFixed(6);
//     return "0";
//   };

//   const getCryptoName = (currency) => {
//     if (currency === "usdttrc20") return "USDT";
//     if (currency === "trx") return "TRX";
//     if (currency === "sol") return "SOL";
//     if (currency === "bnbbsc") return "BNB";
//     return "";
//   };

//   const getCryptoPrice = (currency) => {
//     if (currency === "usdttrc20") return 1;
//     if (currency === "trx") return cryptoPrices.TRX;
//     if (currency === "sol") return cryptoPrices.SOL;
//     if (currency === "bnbbsc") return cryptoPrices.BNB;
//     return 0;
//   };

//   const getMinAmount = (currency) => minAmounts[currency] || 5;

//   const handleSubmitDeposit = async (e) => {
//     e.preventDefault();
//     if (submittingRef.current || successLockRef.current) return;
//     submittingRef.current = true;
//     setLoading(true);

//     try {
//       if (trxError) {
//         showToast("সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!", "error");
//         return;
//       }
//       if (!selectedAgentId || !selectedAgentAccount) {
//         showToast("এজেন্ট ও মেথড সিলেক্ট করুন!", "error");
//         return;
//       }
//       if (agentBalanceError) {
//         showToast(agentBalanceError, "error");
//         return;
//       }

//       const cleanAmount = Number(amount);
//       if (isNaN(cleanAmount) || cleanAmount <= 0) {
//         showToast("সঠিক পরিমাণ দিন!", "error");
//         return;
//       }

//       const minAmount = methodConfig.isCrypto ? 4 : 500;
//       if (cleanAmount < minAmount) {
//         showToast(
//           methodConfig.isCrypto
//             ? `সর্বনিম্ন $${minAmount}!`
//             : `সর্বনিম্ন ৳${minAmount}!`,
//           "error",
//         );
//         return;
//       }

//       const cleanSenderNumber = senderNumber.trim();
//       if (cleanSenderNumber.length < methodConfig.senderMinLength) {
//         showToast(
//           `${methodConfig.senderLabel} — কমপক্ষে ${methodConfig.senderMinLength} ${methodConfig.senderOnlyDigits ? "ডিজিট" : "character"}!`,
//           "error",
//         );
//         return;
//       }

//       const cleanTrxId = transactionId.trim().toUpperCase();
//       const selectedAgent = agents.find(
//         (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
//       );

//       const res = await fetch("/api/game/deposit", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           amount: cleanAmount,
//           method: selectedAgentAccount.method,
//           accountNumber: cleanSenderNumber,
//           transactionId: cleanTrxId,
//           agentId: selectedAgent?._id,
//         }),
//       });
//       const data = await res.json();
//       showToast(data.message, data.success ? "success" : "error");

//       if (data.success) {
//         successLockRef.current = true;
//         setAmount("");
//         setSenderNumber("");
//         setTransactionId("");
//         successTimerRef.current = setTimeout(() => {
//           successLockRef.current = false;
//           successTimerRef.current = null;
//         }, 2500);
//       }
//     } catch (err) {
//       console.error(err);
//       showToast("সার্ভার ত্রুটি!", "error");
//     } finally {
//       submittingRef.current = false;
//       setLoading(false);
//     }
//   };

//   const handleNowPayments = async () => {
//     if (npSubmittingRef.current) return;
//     npSubmittingRef.current = true;
//     const cleanAmount = Number(npAmount);
//     const minAmount = getMinAmount(npCurrency);

//     if (!cleanAmount || cleanAmount < minAmount) {
//       showToast(
//         `সর্বনিম্ন $${minAmount} — ${getCryptoName(npCurrency)}!`,
//         "error",
//       );
//       npSubmittingRef.current = false;
//       return;
//     }

//     try {
//       setNpLoading(true);
//       const res = await fetch("/api/nowpayments/create-invoice", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ amount: cleanAmount, payCurrency: npCurrency }),
//       });
//       const data = await res.json();

//       if (data.success && data.invoice_url) {
//         showToast("NowPayments-এ redirect করা হচ্ছে...", "success");
//         setTimeout(() => {
//           window.location.href = data.invoice_url;
//         }, 500);
//       } else {
//         showToast(data.message || "Invoice তৈরি হয়নি!", "error");
//         npSubmittingRef.current = false;
//       }
//     } catch (err) {
//       console.error(err);
//       showToast("সার্ভার ত্রুটি!", "error");
//       npSubmittingRef.current = false;
//     } finally {
//       setNpLoading(false);
//     }
//   };

//   const isDepositDisabled =
//     loading ||
//     !!trxError ||
//     !!agentBalanceError ||
//     !selectedAgentId ||
//     !selectedAgentAccount ||
//     !isSenderLengthValid; // 🆕 অ্যাড্রেস সঠিক দৈর্ঘ্যের না হলে বাটন ডিজেবল

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
//       {/* Toast */}
//       {toast.show && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
//           <div
//             className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${toast.type === "success" ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-slate-900 border-rose-500 text-rose-400"}`}
//           >
//             <i
//               className={`fa-solid ${toast.type === "success" ? "fa-circle-check text-3xl" : "fa-circle-exclamation text-3xl"}`}
//             ></i>
//             <span className="leading-relaxed">{toast.message}</span>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-md md:max-w-xl space-y-4">
//         {/* Header */}
//         <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
//           <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
//             <i className="fa-solid fa-download"></i> ডিপোজিট করুন
//           </h2>
//           <button
//             onClick={() => {
//               if (typeof window !== "undefined" && window.history.length > 1)
//                 router.back();
//               else router.push("/");
//             }}
//             className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
//           >
//             <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
//           </button>
//         </div>

//         {autoCryptoEnabled ? (
//           <TabSwitcher
//             value={showNowPayments}
//             onChange={setShowNowPayments}
//             rate={usdToBdtRate}
//           />
//         ) : (
//           <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/30 shadow-lg text-center">
//             <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
//               <i className="fa-solid fa-hand-holding-dollar"></i> Manual Deposit
//             </span>
//           </div>
//         )}

//         {/* ============ MANUAL DEPOSIT FORM ============ */}
//         {!showNowPayments && (
//           <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
//             <form onSubmit={handleSubmitDeposit} className="space-y-5">
//               {/* এজেন্ট সিলেক্ট */}
//               <div>
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                   এজেন্ট সিলেক্ট করুন
//                 </label>
//                 <select
//                   value={selectedAgentId}
//                   onChange={(e) => setSelectedAgentId(e.target.value)}
//                   disabled={agentsLoading}
//                   className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
//                 >
//                   {agentsLoading ? (
//                     <option>লোড হচ্ছে...</option>
//                   ) : agents.length === 0 ? (
//                     <option value="">কোনো এজেন্ট নেই</option>
//                   ) : (
//                     agents.map((a) => (
//                       <option
//                         key={a._id || a.agentCode || a.agentPhone}
//                         value={a.agentCode || a.agentPhone}
//                       >
//                         {a.agentCode ? a.agentCode : "Agent"}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               {/* এজেন্টের মেথড সিলেক্ট */}
//               <div>
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                   পেমেন্ট মেথড সিলেক্ট করুন
//                 </label>
//                 <select
//                   value={selectedAgentAccount?.accountNumber || ""}
//                   onChange={(e) => {
//                     const acc = agentAccounts.find(
//                       (a) => a.accountNumber === e.target.value,
//                     );
//                     setSelectedAgentAccount(acc);
//                   }}
//                   disabled={agentAccounts.length === 0}
//                   className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
//                 >
//                   {agentAccounts.length === 0 ? (
//                     <option value="">-- মেথড নেই --</option>
//                   ) : (
//                     agentAccounts.map((acc, i) => (
//                       <option key={i} value={acc.accountNumber}>
//                         {acc.method}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               {/* সিলেক্ট করা অ্যাকাউন্টের নাম্বার ও কপি বাটন */}
//               {selectedAgentAccount && (
//                 <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
//                   <div className="flex justify-between text-xs md:text-sm text-slate-400">
//                     <span className="text-emerald-400 font-bold">
//                       {selectedAgentAccount.method} নাম্বার:
//                     </span>
//                     <span className="text-amber-400 font-bold">
//                       মিনিমাম: {methodConfig.isCrypto ? `$${4}` : `৳500`}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
//                     <span className="font-mono text-base md:text-lg font-bold text-emerald-400 break-all">
//                       {selectedAgentAccount.accountNumber}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         handleCopy(selectedAgentAccount.accountNumber)
//                       }
//                       className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
//                     >
//                       <i className="fa-solid fa-copy"></i> কপি
//                     </button>
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
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
//                   className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none font-mono ${agentBalanceError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
//                 />
//                 {methodConfig.isCrypto && amount && (
//                   <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
//                     ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (রেট: $1 = ৳
//                     {usdToBdtRate})
//                   </p>
//                 )}
//                 {agentBalanceError && (
//                   <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
//                     <i className="fa-solid fa-circle-exclamation"></i>{" "}
//                     {agentBalanceError}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                   {methodConfig.senderLabel}
//                 </label>
//                 <input
//                   type="text"
//                   inputMode={methodConfig.senderOnlyDigits ? "numeric" : "text"}
//                   maxLength={methodConfig.senderMaxLength}
//                   placeholder={methodConfig.senderPlaceholder}
//                   value={senderNumber}
//                   onChange={(e) => handleSenderChange(e.target.value)}
//                   className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none font-mono transition-colors ${
//                     senderNumber.length > 0 && !isSenderLengthValid
//                       ? "border-rose-500 focus:border-rose-500 bg-rose-500/5" // 🆕 লাল বর্ডার
//                       : "border-slate-700 focus:border-emerald-500"
//                   }`}
//                 />

//                 {/* 🆕 লাইভ ভ্যালিডেশন মেসেজ */}
//                 {senderNumber.length > 0 && !isSenderLengthValid ? (
//                   <p className="text-[10px] text-rose-400 mt-1.5 font-semibold flex items-center gap-1">
//                     <i className="fa-solid fa-circle-exclamation"></i>
//                     অ্যাড্রেসটি সঠিক নয়। এটি অবশ্যই{" "}
//                     {methodConfig.senderMinLength} থেকে{" "}
//                     {methodConfig.senderMaxLength} অক্ষরের হতে হবে।
//                   </p>
//                 ) : (
//                   <p className="text-[10px] text-slate-500 mt-1">
//                     {methodConfig.senderOnlyDigits
//                       ? `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} ডিজিট`
//                       : `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} character`}{" "}
//                     — {senderNumber.length}/{methodConfig.senderMaxLength}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                   ট্রানজেকশন আইডি (TrxID)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="M4K8..."
//                   value={transactionId}
//                   onChange={(e) =>
//                     setTransactionId(
//                       e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
//                     )
//                   }
//                   className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none uppercase font-mono ${trxError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
//                 />
//                 {trxError && (
//                   <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
//                     <i className="fa-solid fa-circle-exclamation"></i>{" "}
//                     {trxError}
//                   </p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isDepositDisabled}
//                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
//                     সাবমিট হচ্ছে...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa-solid fa-paper-plane"></i> ডিপোজিট
//                     রিকোয়েস্ট পাঠান
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* ============ NOWPAYMENTS AUTO CRYPTO ============ */}
//         {showNowPayments && autoCryptoEnabled && (
//           <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 p-4 md:p-6 rounded-2xl border border-blue-500/30 shadow-lg space-y-5">
//             <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
//               <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
//                 <i className="fa-solid fa-bolt text-xl"></i>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-sm md:text-base font-bold text-blue-400">
//                   NowPayments — Auto Crypto
//                 </h3>
//                 <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-relaxed">
//                   USDT, TRX, BNB, SOL দিয়ে instant deposit করুন। Payment
//                   confirm হলেই auto balance add হবে।
//                 </p>
//               </div>
//             </div>

//             <div>
//               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                 পেমেন্ট কারেন্সি
//               </label>
//               <select
//                 value={npCurrency}
//                 onChange={(e) => setNpCurrency(e.target.value)}
//                 className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
//               >
//                 <option value="usdttrc20">USDT (TRC20) — কম ফি</option>
//                 <option value="trx">TRON (TRX)</option>
//                 <option value="bnbbsc">Binance Coin (BSC)</option>
//                 <option value="sol">Solana (SOL)</option>
//               </select>
//             </div>

//             <div>
//               <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
//                 পরিমাণ (USD $) — যত ডলার ডিপোজিট করবেন
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">
//                   $
//                 </span>
//                 <input
//                   type="number"
//                   step="any"
//                   min={getMinAmount(npCurrency)}
//                   value={npAmount}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     if (val === "" || Number(val) >= 0) setNpAmount(val);
//                   }}
//                   placeholder={`যেমন: ${getMinAmount(npCurrency)}`}
//                   className="w-full bg-slate-950 border border-slate-700 p-3 pl-9 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
//                 />
//               </div>
//               <p className="text-[10px] text-slate-500 mt-1">
//                 সর্বনিম্ন ${getMinAmount(npCurrency)} —{" "}
//                 {getCryptoName(npCurrency)}
//               </p>
//             </div>

//             {npAmount && Number(npAmount) >= getMinAmount(npCurrency) && (
//               <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl overflow-hidden">
//                 <div className="p-4 border-b border-blue-500/20">
//                   <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
//                     আপনি পাঠাবেন
//                   </p>
//                   <div className="flex items-baseline gap-2 flex-wrap">
//                     <span className="text-3xl md:text-4xl font-black text-blue-400 font-mono">
//                       {calculateCrypto(npAmount, npCurrency)}
//                     </span>
//                     <span className="text-base md:text-lg font-bold text-slate-200">
//                       {getCryptoName(npCurrency)}
//                     </span>
//                   </div>
//                   <p className="text-[11px] text-slate-500 mt-1">
//                     ≈ ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)} BDT
//                   </p>
//                 </div>
//                 <div className="p-4 border-b border-blue-500/20 bg-blue-950/20">
//                   <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
//                     লাইভ রেট
//                   </p>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-slate-300">
//                       1 {getCryptoName(npCurrency)} =
//                     </span>
//                     <span className="font-mono font-bold text-emerald-400">
//                       ${getCryptoPrice(npCurrency).toFixed(4)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs mt-1.5">
//                     <span className="text-slate-300">$1 =</span>
//                     <span className="font-mono font-bold text-emerald-400">
//                       ৳{usdToBdtRate}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-4 space-y-2">
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-slate-400">ডিপোজিট অ্যামাউন্ট</span>
//                     <span className="font-mono text-slate-200">
//                       ${Number(npAmount).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-slate-400">
//                       NowPayments ফি (~0.5%)
//                     </span>
//                     <span className="font-mono text-slate-200">
//                       ${(Number(npAmount) * 0.005).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-slate-400">নেটওয়ার্ক ফি</span>
//                     <span className="font-mono text-slate-200">
//                       {npCurrency === "usdttrc20"
//                         ? "~$0.50"
//                         : npCurrency === "trx"
//                           ? "~$0.10"
//                           : npCurrency === "bnbbsc"
//                             ? "~$0.20"
//                             : "~$0.02"}
//                     </span>
//                   </div>
//                   <div className="border-t border-blue-500/20 pt-2 mt-2 flex items-center justify-between text-xs">
//                     <span className="text-slate-300 font-semibold">
//                       মোট পাঠাতে হবে
//                     </span>
//                     <span className="font-mono font-bold text-blue-400">
//                       ${Number(npAmount).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-slate-300 font-semibold">
//                       আপনি পাবেন
//                     </span>
//                     <span className="font-mono font-bold text-emerald-400">
//                       ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="px-4 py-2.5 bg-blue-500/10 border-t border-blue-500/20 flex items-center gap-2">
//                   <i className="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
//                   <p className="text-[10px] text-slate-400">
//                     Payment confirm হলে ২-৫ মিনিটে অটো ব্যালেন্স যোগ হবে
//                   </p>
//                 </div>
//               </div>
//             )}

//             <div className="bg-blue-950/40 border border-blue-500/20 p-3 rounded-xl">
//               <p className="text-[10px] md:text-xs text-blue-300 leading-relaxed flex items-start gap-2">
//                 <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
//                 <span>
//                   NowPayments পেজে redirect হবেন। সেখানে payment সম্পন্ন করলে
//                   auto আপনার wallet-এ balance যোগ হবে।
//                 </span>
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNowPayments}
//               disabled={
//                 npLoading ||
//                 !npAmount ||
//                 Number(npAmount) < getMinAmount(npCurrency)
//               }
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95 text-white"
//             >
//               {npLoading ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
//                   Invoice তৈরি হচ্ছে...
//                 </>
//               ) : (
//                 <>
//                   <i className="fa-solid fa-arrow-up-right-from-square"></i>{" "}
//                   NowPayments এ পেমেন্ট করুন
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// ///////////////////////////////////////////////////////////////////////////
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TabSwitcher from "./TabSwitcher";

// ==========================================
// ✅ Method-specific Config (১০০% সঠিক)
// ==========================================
const getCryptoConfig = (methodName) => {
  const upper = String(methodName || "").toUpperCase();

  // ✅ ১. USDT TRC20
  if (upper.includes("TRC20")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার USDT (TRC20) Wallet Address",
      senderPlaceholder: "TXYZ... (৩৪ character)",
      senderMinLength: 34,
      senderMaxLength: 34,
      senderOnlyDigits: false,
    };
  }

  // ✅ ২. BNB / BSC / BEP20
  if (
    upper.includes("BEP20") ||
    upper.includes("BSC") ||
    upper.includes("BNB")
  ) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার BEP20 Wallet Address",
      senderPlaceholder: "0x... (৪২ character)",
      senderMinLength: 42,
      senderMaxLength: 42,
      senderOnlyDigits: false,
    };
  }

  // ✅ ৩. TRX / TRON (শুধু TRC20 ছাড়া)
  if (
    (upper.includes("TRX") || upper.includes("TRON")) &&
    !upper.includes("TRC20")
  ) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার TRX Wallet Address",
      senderPlaceholder: "TXYZ... (৩৪ character)",
      senderMinLength: 34,
      senderMaxLength: 34,
      senderOnlyDigits: false,
    };
  }

  // ✅ ৪. BINANCE PAY ID
  if (upper.includes("BINANCE")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার Binance Pay ID",
      senderPlaceholder: "যেমন: 4454344556",
      senderMinLength: 5,
      senderMaxLength: 15,
      senderOnlyDigits: true,
    };
  }

  // ✅ ৫. BTC
  if (upper.includes("BTC") || upper.includes("BITCOIN")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার Bitcoin Wallet Address",
      senderPlaceholder: "bc1... or 1...",
      senderMinLength: 26,
      senderMaxLength: 50,
      senderOnlyDigits: false,
    };
  }

  // ✅ ৬. ETH
  if (upper.includes("ETH") || upper.includes("ETHEREUM")) {
    return {
      isCrypto: true,
      currency: "USD",
      amountLabel: "টাকার পরিমাণ (USD $)",
      amountPlaceholder: "যেমন: 10",
      senderLabel: "আপনার ETH Wallet Address",
      senderPlaceholder: "0x... (৪২ character)",
      senderMinLength: 42,
      senderMaxLength: 42,
      senderOnlyDigits: false,
    };
  }

  // ✅ ৭. মোবাইল ব্যাংকিং (bKash/Nagad/Rocket)
  return {
    isCrypto: false,
    currency: "BDT",
    amountLabel: "টাকার পরিমাণ (৳)",
    amountPlaceholder: "যেমন: 500",
    senderLabel: "যে নাম্বার থেকে টাকা পাঠিয়েছেন",
    senderPlaceholder: "01700000000 (১১ ডিজিট)",
    senderMinLength: 11,
    senderMaxLength: 11,
    senderOnlyDigits: true,
  };
};
// ==========================================

export default function UserDepositPage() {
  const router = useRouter();

  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [agentsLoading, setAgentsLoading] = useState(true);

  const [agentAccounts, setAgentAccounts] = useState([]);
  const [selectedAgentAccount, setSelectedAgentAccount] = useState(null);

  const [amount, setAmount] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [trxError, setTrxError] = useState("");
  const [agentBalanceError, setAgentBalanceError] = useState("");
  const [loading, setLoading] = useState(false);

  const [npAmount, setNpAmount] = useState("");
  const [npCurrency, setNpCurrency] = useState("usdttrc20");
  const [npLoading, setNpLoading] = useState(false);
  const [showNowPayments, setShowNowPayments] = useState(false);
  const [autoCryptoEnabled, setAutoCryptoEnabled] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);
  const [cryptoPrices, setCryptoPrices] = useState({
    TRX: 0.15,
    SOL: 150,
    BNB: 600,
  });
  const [minAmounts, setMinAmounts] = useState({
    usdttrc20: 5,
    trx: 5,
    bnbbsc: 25,
    sol: 20,
  });

  const submittingRef = useRef(false);
  const successLockRef = useRef(false);
  const npSubmittingRef = useRef(false);
  const toastTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  const methodConfig = getCryptoConfig(selectedAgentAccount?.method);

  const isSenderLengthValid =
    senderNumber.length >= methodConfig.senderMinLength &&
    senderNumber.length <= methodConfig.senderMaxLength;

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
      toastTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetch("/api/admin/exchange-rate", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rate)
          setUsdToBdtRate(Number(data.rate) || 120);
      })
      .catch((err) => console.error("Rate fetch error:", err));

    fetch("/api/crypto-prices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCryptoPrices(data.prices);
      })
      .catch((err) => console.error("Crypto price error:", err));

    fetch("/api/nowpayments/min-amount", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.minimums) {
          setMinAmounts((prev) => ({ ...prev, ...data.minimums }));
        }
      })
      .catch((err) => console.error("Min amount fetch error:", err));

    fetch("/api/admin/settings/auto-crypto")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAutoCryptoEnabled(data.enabled !== false);
          if (!data.enabled) setShowNowPayments(false);
        }
      })
      .catch((err) => console.error("Auto crypto status error:", err));

    fetch("/api/user/agent-list", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.agents)) {
          setAgents(data.agents);
          if (data.agents.length > 0) {
            setSelectedAgentId(
              data.agents[0].agentCode || data.agents[0].agentPhone,
            );
          }
        }
      })
      .catch((err) => console.error("Agent list fetch error:", err))
      .finally(() => setAgentsLoading(false));
  }, []);

  useEffect(() => {
    const activeAgent = agents.find(
      (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
    );
    if (activeAgent?.paymentAccounts?.length > 0) {
      setAgentAccounts(activeAgent.paymentAccounts);
      setSelectedAgentAccount(activeAgent.paymentAccounts[0]);
    } else {
      setAgentAccounts([]);
      setSelectedAgentAccount(null);
    }

    setSenderNumber("");
    setAmount("");
    setTransactionId("");
    setTrxError("");
    setAgentBalanceError("");
  }, [selectedAgentId, agents]);

  useEffect(() => {
    const checkTrx = async () => {
      const cleanTrxId = transactionId.trim();
      if (!cleanTrxId || cleanTrxId.length < 5) {
        setTrxError("");
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(cleanTrxId)) {
        setTrxError(
          "ট্রানজেকশনে কোনো বিশেষ চরিত্র বা স্পেস ব্যবহার করা যাবে না!",
        );
        return;
      }
      try {
        const res = await fetch("/api/game/check-trx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ transactionId: cleanTrxId }),
        });
        const data = await res.json();
        if (data.exists) setTrxError(data.message);
        else setTrxError("");
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(checkTrx, 500);
    return () => clearTimeout(timer);
  }, [transactionId]);

  useEffect(() => {
    setAgentBalanceError("");
    if (!selectedAgentId || !amount) return;

    const cleanAmount = Number(amount);
    if (!cleanAmount || cleanAmount <= 0) return;

    const selectedAgent = agents.find(
      (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
    );
    if (!selectedAgent) return;

    const requiredBDT = methodConfig.isCrypto
      ? cleanAmount * usdToBdtRate
      : cleanAmount;

    if (requiredBDT > selectedAgent.agentBalance) {
      setAgentBalanceError(`এই এজেন্টের কাছে পর্যাপ্ত ব্যালেন্স নেই।`);
    }
  }, [amount, selectedAgentId, agents, usdToBdtRate, methodConfig.isCrypto]);

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    showToast("কপি করা হয়েছে!", "success");
  };

  const handleSenderChange = (value) => {
    let sanitized = value;
    if (methodConfig.senderOnlyDigits) sanitized = value.replace(/\D/g, "");
    else sanitized = value.replace(/[^a-zA-Z0-9]/g, "");

    if (sanitized.length <= methodConfig.senderMaxLength)
      setSenderNumber(sanitized);
  };

  const calculateCrypto = (usdAmount, currency) => {
    const amt = Number(usdAmount);
    if (!amt || amt <= 0 || isNaN(amt)) return "0";
    if (currency === "usdttrc20") return amt.toFixed(2);
    if (currency === "trx") return (amt / cryptoPrices.TRX).toFixed(4);
    if (currency === "sol") return (amt / cryptoPrices.SOL).toFixed(6);
    if (currency === "bnbbsc") return (amt / cryptoPrices.BNB).toFixed(6);
    return "0";
  };

  const getCryptoName = (currency) => {
    if (currency === "usdttrc20") return "USDT";
    if (currency === "trx") return "TRX";
    if (currency === "sol") return "SOL";
    if (currency === "bnbbsc") return "BNB";
    return "";
  };

  const getCryptoPrice = (currency) => {
    if (currency === "usdttrc20") return 1;
    if (currency === "trx") return cryptoPrices.TRX;
    if (currency === "sol") return cryptoPrices.SOL;
    if (currency === "bnbbsc") return cryptoPrices.BNB;
    return 0;
  };

  const getMinAmount = (currency) => minAmounts[currency] || 5;

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || successLockRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      if (trxError) {
        showToast("সঠিক ও ইউনিক ট্রানজেকশন আইডি দিন!", "error");
        return;
      }
      if (!selectedAgentId || !selectedAgentAccount) {
        showToast("এজেন্ট ও মেথড সিলেক্ট করুন!", "error");
        return;
      }
      if (agentBalanceError) {
        showToast(agentBalanceError, "error");
        return;
      }

      const cleanAmount = Number(amount);
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        showToast("সঠিক পরিমাণ দিন!", "error");
        return;
      }

      const minAmount = methodConfig.isCrypto ? 4 : 500;
      if (cleanAmount < minAmount) {
        showToast(
          methodConfig.isCrypto
            ? `সর্বনিম্ন $${minAmount}!`
            : `সর্বনিম্ন ৳${minAmount}!`,
          "error",
        );
        return;
      }

      const cleanSenderNumber = senderNumber.trim();
      if (cleanSenderNumber.length < methodConfig.senderMinLength) {
        showToast(
          `${methodConfig.senderLabel} — কমপক্ষে ${methodConfig.senderMinLength} ${methodConfig.senderOnlyDigits ? "ডিজিট" : "character"}!`,
          "error",
        );
        return;
      }

      const cleanTrxId = transactionId.trim().toUpperCase();
      const selectedAgent = agents.find(
        (a) => (a.agentCode || a.agentPhone) === selectedAgentId,
      );

      const res = await fetch("/api/game/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: cleanAmount,
          method: selectedAgentAccount.method,
          accountNumber: cleanSenderNumber,
          transactionId: cleanTrxId,
          agentId: selectedAgent?._id,
        }),
      });
      const data = await res.json();
      showToast(data.message, data.success ? "success" : "error");

      if (data.success) {
        successLockRef.current = true;
        setAmount("");
        setSenderNumber("");
        setTransactionId("");
        successTimerRef.current = setTimeout(() => {
          successLockRef.current = false;
          successTimerRef.current = null;
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার ত্রুটি!", "error");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleNowPayments = async () => {
    if (npSubmittingRef.current) return;
    npSubmittingRef.current = true;
    const cleanAmount = Number(npAmount);
    const minAmount = getMinAmount(npCurrency);

    if (!cleanAmount || cleanAmount < minAmount) {
      showToast(
        `সর্বনিম্ন $${minAmount} — ${getCryptoName(npCurrency)}!`,
        "error",
      );
      npSubmittingRef.current = false;
      return;
    }

    try {
      setNpLoading(true);
      const res = await fetch("/api/nowpayments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: cleanAmount, payCurrency: npCurrency }),
      });
      const data = await res.json();

      if (data.success && data.invoice_url) {
        showToast("NowPayments-এ redirect করা হচ্ছে...", "success");
        setTimeout(() => {
          window.location.href = data.invoice_url;
        }, 500);
      } else {
        showToast(data.message || "Invoice তৈরি হয়নি!", "error");
        npSubmittingRef.current = false;
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার ত্রুটি!", "error");
      npSubmittingRef.current = false;
    } finally {
      setNpLoading(false);
    }
  };

  const isDepositDisabled =
    loading ||
    !!trxError ||
    !!agentBalanceError ||
    !selectedAgentId ||
    !selectedAgentAccount ||
    !isSenderLengthValid;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans">
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`px-6 py-5 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${toast.type === "success" ? "bg-slate-900 border-emerald-500 text-emerald-400" : "bg-slate-900 border-rose-500 text-rose-400"}`}
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
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <i className="fa-solid fa-download"></i> ডিপোজিট করুন
          </h2>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1)
                router.back();
              else router.push("/");
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {autoCryptoEnabled ? (
          <TabSwitcher
            value={showNowPayments}
            onChange={setShowNowPayments}
            rate={usdToBdtRate}
          />
        ) : (
          <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/30 shadow-lg text-center">
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
              <i className="fa-solid fa-hand-holding-dollar"></i> Manual Deposit
            </span>
          </div>
        )}

        {!showNowPayments && (
          <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
            <form onSubmit={handleSubmitDeposit} className="space-y-5">
              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  এজেন্ট সিলেক্ট করুন
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={agentsLoading}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
                >
                  {agentsLoading ? (
                    <option>লোড হচ্ছে...</option>
                  ) : agents.length === 0 ? (
                    <option value="">কোনো এজেন্ট নেই</option>
                  ) : (
                    agents.map((a) => (
                      <option
                        key={a._id || a.agentCode || a.agentPhone}
                        value={a.agentCode || a.agentPhone}
                      >
                        {a.agentCode ? a.agentCode : "Agent"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  পেমেন্ট মেথড সিলেক্ট করুন
                </label>
                <select
                  value={selectedAgentAccount?._id || ""} // 👈 এখানে _id ব্যবহার করা হলো
                  onChange={(e) => {
                    const acc = agentAccounts.find(
                      (a) => a._id === e.target.value, // 👈 এখানে _id দিয়ে খুঁজুন
                    );
                    setSelectedAgentAccount(acc);
                  }}
                  disabled={agentAccounts.length === 0}
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs md:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 truncate"
                >
                  {agentAccounts.length === 0 ? (
                    <option value="">-- মেথড নেই --</option>
                  ) : (
                    agentAccounts.map((acc, i) => (
                      <option key={acc._id} value={acc._id}>
                        {" "}
                        {/* 👈 value={acc._id} */}
                        {acc.method}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {selectedAgentAccount && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                  <div className="flex justify-between text-xs md:text-sm text-slate-400">
                    <span className="text-emerald-400 font-bold">
                      {selectedAgentAccount.method} নাম্বার:
                    </span>
                    <span className="text-amber-400 font-bold">
                      মিনিমাম: {methodConfig.isCrypto ? `$${4}` : `৳500`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-base md:text-lg font-bold text-emerald-400 break-all">
                      {selectedAgentAccount.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(selectedAgentAccount.accountNumber)
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
                    >
                      <i className="fa-solid fa-copy"></i> কপি
                    </button>
                  </div>
                </div>
              )}

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
                  className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none font-mono ${agentBalanceError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
                />
                {methodConfig.isCrypto && amount && (
                  <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
                    ≈ ৳{(Number(amount) * usdToBdtRate).toFixed(0)} (রেট: $1 = ৳
                    {usdToBdtRate})
                  </p>
                )}
                {agentBalanceError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>{" "}
                    {agentBalanceError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  {methodConfig.senderLabel}
                </label>
                <input
                  type="text"
                  inputMode={methodConfig.senderOnlyDigits ? "numeric" : "text"}
                  maxLength={methodConfig.senderMaxLength}
                  placeholder={methodConfig.senderPlaceholder}
                  value={senderNumber}
                  onChange={(e) => handleSenderChange(e.target.value)}
                  className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none font-mono transition-colors ${
                    senderNumber.length > 0 && !isSenderLengthValid
                      ? "border-rose-500 focus:border-rose-500 bg-rose-500/5"
                      : "border-slate-700 focus:border-emerald-500"
                  }`}
                />

                {senderNumber.length > 0 && !isSenderLengthValid ? (
                  <p className="text-[10px] text-rose-400 mt-1.5 font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    অ্যাড্রেসটি সঠিক নয়। এটি অবশ্যই{" "}
                    {methodConfig.senderMinLength} থেকে{" "}
                    {methodConfig.senderMaxLength} অক্ষরের হতে হবে।
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {methodConfig.senderOnlyDigits
                      ? `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} ডিজিট`
                      : `${methodConfig.senderMinLength}-${methodConfig.senderMaxLength} character`}{" "}
                    — {senderNumber.length}/{methodConfig.senderMaxLength}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                  ট্রানজেকশন আইডি (TrxID)
                </label>
                <input
                  type="text"
                  placeholder="M4K8..."
                  value={transactionId}
                  onChange={(e) =>
                    setTransactionId(
                      e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                    )
                  }
                  className={`w-full bg-slate-950 border p-3 rounded-xl text-xs md:text-sm text-white outline-none uppercase font-mono ${trxError ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-emerald-500"}`}
                />
                {trxError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation"></i>{" "}
                    {trxError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isDepositDisabled}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                    সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> ডিপোজিট
                    রিকোয়েস্ট পাঠান
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {showNowPayments && autoCryptoEnabled && (
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 p-4 md:p-6 rounded-2xl border border-blue-500/30 shadow-lg space-y-5">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <i className="fa-solid fa-bolt text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-bold text-blue-400">
                  NowPayments — Auto Crypto
                </h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 leading-relaxed">
                  USDT, TRX, BNB, SOL দিয়ে instant deposit করুন। Payment
                  confirm হলেই auto balance add হবে।
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                পেমেন্ট কারেন্সি
              </label>
              <select
                value={npCurrency}
                onChange={(e) => setNpCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="usdttrc20">USDT (TRC20) — কম ফি</option>
                <option value="trx">TRON (TRX)</option>
                <option value="bnbbsc">Binance Coin (BSC)</option>
                <option value="sol">Solana (SOL)</option>
              </select>
            </div>

            <div>
              <label className="text-xs md:text-sm text-slate-400 font-semibold block mb-2">
                পরিমাণ (USD $) — যত ডলার ডিপোজিট করবেন
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min={getMinAmount(npCurrency)}
                  value={npAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) setNpAmount(val);
                  }}
                  placeholder={`যেমন: ${getMinAmount(npCurrency)}`}
                  className="w-full bg-slate-950 border border-slate-700 p-3 pl-9 rounded-xl text-sm text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                সর্বনিম্ন ${getMinAmount(npCurrency)} —{" "}
                {getCryptoName(npCurrency)}
              </p>
            </div>

            {npAmount && Number(npAmount) >= getMinAmount(npCurrency) && (
              <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-blue-500/20">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
                    আপনি পাঠাবেন
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl md:text-4xl font-black text-blue-400 font-mono">
                      {calculateCrypto(npAmount, npCurrency)}
                    </span>
                    <span className="text-base md:text-lg font-bold text-slate-200">
                      {getCryptoName(npCurrency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ≈ ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)} BDT
                  </p>
                </div>
                <div className="p-4 border-b border-blue-500/20 bg-blue-950/20">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
                    লাইভ রেট
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      1 {getCryptoName(npCurrency)} =
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${getCryptoPrice(npCurrency).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-slate-300">$1 =</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ৳{usdToBdtRate}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ডিপোজিট অ্যামাউন্ট</span>
                    <span className="font-mono text-slate-200">
                      ${Number(npAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      NowPayments ফি (~0.5%)
                    </span>
                    <span className="font-mono text-slate-200">
                      ${(Number(npAmount) * 0.005).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">নেটওয়ার্ক ফি</span>
                    <span className="font-mono text-slate-200">
                      {npCurrency === "usdttrc20"
                        ? "~$0.50"
                        : npCurrency === "trx"
                          ? "~$0.10"
                          : npCurrency === "bnbbsc"
                            ? "~$0.20"
                            : "~$0.02"}
                    </span>
                  </div>
                  <div className="border-t border-blue-500/20 pt-2 mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">
                      মোট পাঠাতে হবে
                    </span>
                    <span className="font-mono font-bold text-blue-400">
                      ${Number(npAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">
                      আপনি পাবেন
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      ৳{(Number(npAmount) * usdToBdtRate).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-blue-500/10 border-t border-blue-500/20 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-400 text-xs"></i>
                  <p className="text-[10px] text-slate-400">
                    Payment confirm হলে ২-৫ মিনিটে অটো ব্যালেন্স যোগ হবে
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-950/40 border border-blue-500/20 p-3 rounded-xl">
              <p className="text-[10px] md:text-xs text-blue-300 leading-relaxed flex items-start gap-2">
                <i className="fa-solid fa-circle-info mt-0.5 flex-shrink-0"></i>
                <span>
                  NowPayments পেজে redirect হবেন। সেখানে payment সম্পন্ন করলে
                  auto আপনার wallet-এ balance যোগ হবে।
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleNowPayments}
              disabled={
                npLoading ||
                !npAmount ||
                Number(npAmount) < getMinAmount(npCurrency)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex justify-center items-center gap-2 active:scale-95 text-white"
            >
              {npLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                  Invoice তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>{" "}
                  NowPayments এ পেমেন্ট করুন
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
