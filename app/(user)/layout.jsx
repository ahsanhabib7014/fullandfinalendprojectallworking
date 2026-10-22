"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({ children }) {
  const pathname = usePathname();

  // ✅ Active nav highlight-এর জন্য nav items
  const navItems = [
    { href: "/", label: "হোম", icon: "fa-solid fa-house" },
    { href: "/game", label: "গেম", icon: "fa-solid fa-dice" },
    { href: "/wallet", label: "ওয়ালেট", icon: "fa-solid fa-wallet" },
    { href: "/referral", label: "রেফারেল", icon: "fa-solid fa-user-group" },
    { href: "/profile", label: "প্রোফাইল", icon: "fa-solid fa-user" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* মূল কন্টেইনার: মোবাইলে ছোট, ডেস্কটপে বড় */}
      <div className="max-w-md md:max-w-5xl mx-auto p-3 md:p-6 pb-24 md:pb-8">
        {/* ইউজার হেডার (নেভবার) */}
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 mb-4 shadow-lg">
          <Link
            href="/"
            className="font-bold text-emerald-400 text-base md:text-lg flex items-center gap-2 hover:text-emerald-300 transition"
          >
            <i className="fa-solid fa-gamepad text-lg md:text-xl"></i>
            <span>GameApp</span>
          </Link>
        </header>

        {/* মূল কনটেন্ট */}
        <main>{children}</main>

        {/* বটম নেভিগেশন (মোবাইলের জন্য) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex justify-around text-slate-400 text-xs z-50 shadow-2xl md:hidden">
          {navItems.map((item) => {
            // ✅ Active page highlight
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center transition ${
                  isActive ? "text-emerald-400" : "hover:text-emerald-400"
                }`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
