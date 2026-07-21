
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { io } from "socket.io-client";

import toast, { Toaster } from "react-hot-toast";
import { Henny_Penny } from "next/font/google";

import {
  FaUsers,
  FaClipboardList,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
  FaTachometerAlt,
  FaHistory,
  FaUserShield,
  FaChartBar,
} from "react-icons/fa";

const hennyPenny = Henny_Penny({
  subsets: ["latin"],
  weight: "400",
});

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // =========================
  // NOTIF
  // =========================
  const [notifCount, setNotifCount] = useState(0);

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("laporanBaru", (data) => {
      // tambah badge
      setNotifCount((prev) => prev + 1);

      // toast notif
      toast.success("📢 Laporan baru masuk!", {
        duration: 4000,
        style: {
          background: "#8B0000",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      // notif browser
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("SWARA - Laporan Baru", {
          body:
            data?.pesan ||
            "Ada laporan baru yang perlu ditindaklanjuti.",
          icon: "/logo-swara.png",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // =========================
  // REQUEST IZIN NOTIF
  // =========================
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // =========================
  // MENU
  // =========================
  const menus = [
    {
      name: "Super Dashboard",
      path: "/super-admin/dashboard",
      icon: <FaTachometerAlt size={18} />,
    },

    {
      name: "Statistik Sistem",
      path: "/super-admin/statistik",
      icon: <FaChartBar size={18} />,
    },

    {
      name: "Kelola User",
      path: "/super-admin/users",
      icon: <FaUsers size={18} />,
    },

    {
      name: "Semua Laporan",
      path: "/super-admin/laporan",

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

    {
      name: "Semua Komentar",
      path: "/super-admin/comments",
      icon: <FaComments size={18} />,
    },


    {
      name: "Profile Saya",
      path: "/super-admin/profile",
      icon: <FaUserCircle size={18} />,
    },
  ];

  return (
    <>
      {/* TOASTER */}
      <Toaster position="top-right" />

      <aside className="w-[280px] min-h-screen bg-gradient-to-b from-[#8B0000] to-[#5c0000] text-white flex flex-col justify-between shadow-2xl">

        {/* TOP */}
        <div className="px-6 py-8">

          {/* LOGO */}
          <div className="mb-12">
             <h1
            className={`${hennyPenny.className} text-[48px] tracking-[6px] leading-none`}
          >
            SWARA
          </h1>

            <p className="text-red-200 text-sm mt-1 flex items-center gap-1">
              <FaUserShield className="text-sm" />
              Super Admin Panel
            </p>
          </div>

          {/* MENU */}
          <div className="space-y-3">
            {menus.map((menu) => {
              const active =
                pathname === menu.path ||
                pathname.startsWith(menu.path + "/");

              return (
                <Link
                  href={menu.path}
                  key={menu.path}
                  onClick={() => {
                    // reset notif saat buka laporan
                    if (
                      menu.name === "Semua Laporan"
                    ) {
                      setNotifCount(0);
                    }
                  }}
                >
                  <div
                    className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer
                    ${
                      active
                        ? "bg-white text-[#8B0000] shadow-lg scale-[1.02]"
                        : "hover:bg-[#ffffff15] text-white"
                    }`}
                  >

                    {/* ICON */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                      ${
                        active
                          ? "bg-[#8B0000] text-white"
                          : "bg-[#ffffff10] group-hover:bg-[#ffffff20]"
                      }`}
                    >
                      {menu.icon}
                    </div>

                    {/* TEXT */}
                    <span className="text-[16px] font-medium">
                      {menu.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="px-6 pb-8">

          {/* CARD */}
          <div className="bg-[#ffffff10] border border-[#ffffff20] rounded-2xl p-4 mb-5 backdrop-blur-sm">
            <h2 className="font-semibold text-lg">
              SWARA SUPER
            </h2>

            <p className="text-sm text-red-100 mt-1">
              Kelola seluruh sistem, user, laporan,
              dan aktivitas dengan akses penuh.
            </p>
          </div>

          {/* LOGOUT */}
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
