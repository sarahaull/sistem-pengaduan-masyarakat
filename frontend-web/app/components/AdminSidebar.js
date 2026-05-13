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
} from "react-icons/fa";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menus = [
    { title: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    { title: "Users", icon: <FaUsers />, path: "/admin/users" },
    { title: "Laporan", icon: <FaClipboardList />, path: "/admin/laporan" },
    { title: "Comments", icon: <FaComments />, path: "/admin/comments" },
    { title: "Profile", icon: <FaUserCircle />, path: "/admin/profile" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="w-[280px] min-h-screen bg-[#8B0000] text-white flex flex-col justify-between p-6 rounded-r-[30px] shadow-2xl">
      
      {/* LOGO */}
      <div>
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-widest">SWARA</h1>
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