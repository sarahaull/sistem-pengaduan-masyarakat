"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function AdminChatListPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // SAFE JSON
  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log(text);
      return [];
    }
  };

  // GET LAPORAN YANG ADA CHAT
  const getLaporan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      setLaporan(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLaporan();
  }, []);

  // FILTER SEARCH
  const filtered = laporan.filter((item) => {
    const name = item?.nama_user?.toLowerCase() || "";
    const judul = item?.judul?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || judul.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600 font-medium">Memuat percakapan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* SIDEBAR */}
     

      {/* CONTENT */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[95vh] flex border border-red-100">
          
          {/* LEFT SIDE - Daftar Chat */}
          <div className="w-[380px] bg-white border-r border-red-100 flex flex-col">
            
            {/* HEADER */}
            <div className="p-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
                <span>💬</span> Chat Admin
              </h1>
              <p className="text-sm text-gray-500 mt-1">Daftar pengaduan warga</p>

              {/* SEARCH */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Cari user atau laporan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition text-sm shadow-sm"
                />
              </div>
            </div>

            {/* CHAT LIST - dengan custom scroll halus */}
            <div className="flex-1 overflow-y-auto chat-scroll">
              {filtered.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">Tidak ada chat</div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/admin/chat/${item.id}`)}
                    className="w-full px-5 py-4 flex items-start gap-4 hover:bg-red-50/40 transition-all duration-200 border-b border-red-50 text-left group"
                  >
                    {/* AVATAR */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                      {item?.nama_user?.charAt(0) || "U"}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 truncate">
                          {item?.nama_user || "Unknown User"}
                        </h2>
                        <span className="text-xs text-gray-400">
                          {item?.created_at
                            ? new Date(item.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>

                      <p className="text-sm text-red-600 mt-1 font-medium truncate">
                        {item?.judul}
                      </p>

                      {item?.alamat && (
  <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
    <div className="flex items-center gap-1">
      <FaMapMarkerAlt
        className="text-red-500"
        size={10}
      />
      <span className="text-[11px] text-gray-700 line-clamp-1">
        {item.alamat}
      </span>
    </div>
  </div>
)}

                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {item?.deskripsi}
                      </p>

                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${
                            item.status === "selesai"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {item.status === "selesai" ? "✓ Selesai" : "⏳ Diproses"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Preview */}
          <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-red-50/30 to-white">
            <div className="text-center">
              <div className="text-7xl mb-5">💬</div>
              <h2 className="text-3xl font-bold text-gray-700">Pilih Chat</h2>
              <p className="text-gray-500 mt-2">Klik salah satu user untuk membuka percakapan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Style - tetap mempertahankan fungsi scroll */}
      <style jsx>{`
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: #f97316 #ffe4e6;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: #ffe4e6;
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}