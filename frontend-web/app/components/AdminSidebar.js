"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Henny_Penny } from "next/font/google";

import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaSnapchat,
  FaRocketchat,
} from "react-icons/fa";

const hennyPenny = Henny_Penny({
  subsets: ["latin"],
  weight: "400",
});

export default function AdminSidebar({ handleLogout }) {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  // Minta izin notifikasi browser saat komponen dimuat
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Koneksi Socket.io dan event listener
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("laporanBaru", (data) => {
      // 1. Tambah counter badge
      setNotifCount((prev) => prev + 1);

      // 2. Toast notifikasi di dalam aplikasi
      toast.success("📢 Laporan baru masuk!", {
        duration: 4000,
        style: {
          background: "#8B0000",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      // 3. Notifikasi desktop (browser)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("SWARA - Laporan Baru", {
          body: data?.pesan || "Ada laporan baru yang perlu ditindaklanjuti.",
          icon: "/logo-swara.png", // ganti dengan path icon kamu
          tag: "laporan-baru",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaHome size={18} /> },
    { name: "Users", path: "/admin/users", icon: <FaUsers size={18} /> },
    {
      name: "Laporan",
      path: "/admin/laporan",
      icon: (
        <div className="relative">
          <FaClipboardList size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
              {notifCount}
            </span>
          )}
        </div>
      ),
    },
    { name: "Comments", path: "/admin/comments", icon: <FaComments size={18} /> },
    { name: "Chat", path: "/admin/chat", icon: <FaRocketchat size={18} /> },
    { name: "Profile", path: "/admin/profile", icon: <FaUserCircle size={18} /> },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <aside className="w-[280px] min-h-screen bg-gradient-to-b from-[#8B0000] to-[#5c0000] text-white flex flex-col justify-between shadow-2xl">
        {/* TOP SECTION */}
        <div className="px-6 py-8">
          <div className="mb-12">
            <h1
            className={`${hennyPenny.className} text-[48px] tracking-[6px] leading-none`}
          >
            SWARA
          </h1>
            <p className="text-red-200 text-sm mt-2">Sistem Pengaduan Masyarakat</p>
          </div>

          <div className="space-y-3">
            {menus.map((menu) => {
              const active = pathname === menu.path;
              return (
                <Link
                  href={menu.path}
                  key={menu.path}
                  onClick={() => {
                    if (menu.name === "Laporan") {
                      setNotifCount(0); // reset badge saat masuk ke halaman Laporan
                    }
                  }}
                >
                  <div
                    className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                      active
                        ? "bg-white text-[#8B0000] shadow-lg scale-[1.02]"
                        : "hover:bg-[#ffffff15] text-white"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        active ? "bg-[#8B0000] text-white" : "bg-[#ffffff10]"
                      }`}
                    >
                      {menu.icon}
                    </div>
                    <span className="text-[16px] font-medium">{menu.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="px-6 pb-8">
          <button
            onClick={handleLogout}
            className="w-full h-[58px] bg-white text-[#8B0000] rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-red-100 transition-all duration-300 shadow-lg"
          >
            <FaSignOutAlt size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}