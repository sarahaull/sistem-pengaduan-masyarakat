"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaTachometerAlt,
  FaHistory,
  FaUserShield,
} from "react-icons/fa";

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Menu khusus Super Admin (lebih lengkap dari Admin biasa)
  const menus = [
    { title: "Super Dashboard", icon: <FaTachometerAlt />, path: "/super-admin/dashboard" },
    { title: "Kelola User", icon: <FaUsers />, path: "/super-admin/users" },
    { title: "Semua Laporan", icon: <FaClipboardList />, path: "/super-admin/laporan" },
    { title: "Semua Komentar", icon: <FaComments />, path: "/super-admin/comments" },
    { title: "Log Aktivitas", icon: <FaHistory />, path: "/super-admin/logs" },
    { title: "Profile Saya", icon: <FaUserCircle />, path: "/super-admin/profile" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="w-[280px] min-h-screen bg-[#8B0000] text-white flex flex-col justify-between p-6 rounded-r-[30px] shadow-2xl">
      
      {/* LOGO & BADGE SUPER ADMIN */}
      <div>
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-widest">SWARA</h1>
          <p className="text-xs text-red-200 mt-1 flex items-center gap-1">
            <FaUserShield className="text-sm" /> Super Admin Panel
          </p>
        </div>

        {/* MENU */}
        <div className="space-y-4">
          {menus.map((menu, index) => {
            const isActive = pathname === menu.path;
            return (
              <Link
                key={index}
                href={menu.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-white text-[#8B0000] font-bold"
                    : "hover:bg-red-800"
                }`}
              >
                <span className="text-xl">{menu.icon}</span>
                <span className="text-lg">{menu.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="bg-white text-[#8B0000] rounded-2xl px-5 py-4 flex items-center gap-4 hover:scale-105 transition-all duration-300 font-bold"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}