import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminNavbar from "./AdminNavbar"; // 🆕 নতুন নেভবার কম্পোনেন্ট

export const metadata = {
  title: "Admin Control Panel",
  description: "Secure Admin Management Dashboard",
};

export default async function AdminLayout({ children }) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value || cookieStore.get("user")?.value;

    if (!token) redirect("/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "admin") redirect("/login");
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 🆕 টপ নেভবার (হ্যামবার্গার মেনু সহ) */}
      <AdminNavbar />

      {/* 🆕 মূল কন্টেন্ট (এখন পুরো স্ক্রিন জুড়ে থাকবে) */}
      <main className="w-full min-h-screen pt-16">
        <div className="p-4 md:p-6 lg:p-8 w-full h-full">{children}</div>
      </main>
    </div>
  );
}
