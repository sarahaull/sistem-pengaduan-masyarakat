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

export default function AdminSidebar({ handleLogout }) {
  const pathname = usePathname();

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome size={18} /> },
    { name: "Users", path: "/admin/users", icon: <FaUsers size={18} /> },
    { name: "Laporan", path: "/admin/laporan", icon: <FaClipboardList size={18} /> },
    { name: "Comments", path: "/admin/comments", icon: <FaComments size={18} /> },
    { name: "Profile", path: "/admin/profile", icon: <FaUserCircle size={18} /> },
  ];

  return (
    <aside className="w-[280px] min-h-screen bg-gradient-to-b from-[#8B0000] to-[#5c0000] text-white flex flex-col justify-between shadow-2xl">
      {/* TOP */}
      <div className="px-6 py-8">
        {/* LOGO */}
        <div className="mb-12">
          <h1 className="text-[48px] font-extrabold tracking-[6px] leading-none">
            SWARA
          </h1>
          <p className="text-red-200 text-sm mt-2">
            Sistem Pengaduan Masyarakat
          </p>
        </div>

        {/* MENU */}
        <div className="space-y-3">
          {menus.map((menu) => {
            const active = pathname === menu.path;

            return (
              <Link href={menu.path} key={menu.path}>
                <div
                  className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                    active
                      ? "bg-white text-[#8B0000] shadow-lg scale-[1.02]"
                      : "hover:bg-[#ffffff15] text-white"
                  }`}
                >
                  {/* ICON CONTAINER */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      active
                        ? "bg-[#8B0000] text-white"
                        : "bg-[#ffffff10] group-hover:bg-[#ffffff20]"
                    }`}
                  >
                    {menu.icon}
                  </div>
                  {/* TEXT */}
                  <span className="text-[16px] font-medium">{menu.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="px-6 pb-8">
        {/* CARD INFO */}
        <div className="bg-[#ffffff10] border border-[#ffffff20] rounded-2xl p-4 mb-5 backdrop-blur-sm">
          <h2 className="font-semibold text-lg">SWARA ADMIN</h2>
          <p className="text-sm text-red-100 mt-1">
            Kelola laporan, pengguna, dan komentar masyarakat dengan mudah.
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full h-[58px] bg-white text-[#8B0000] rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-red-100 transition-all duration-300 shadow-lg"
        >
          <FaSignOutAlt size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}