"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaCommentDots,
  FaImage,
  FaUser,
  FaEnvelope,
  FaChartLine,
  FaExpand,
  FaTimes,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AdminLaporanPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setMsg("");
      const token = localStorage.getItem("token");
      if (!token) {
        setMsg("Token tidak ditemukan, silakan login ulang");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server tidak mengembalikan JSON");
      }

      if (!res.ok) throw new Error(data.msg || "Gagal mengambil data");
      const result = Array.isArray(data) ? data : data?.data ? data.data : [];
      setLaporan(result);
      console.log(laporan);
    } catch (err) {
      console.log(err);
      setMsg(err.message || "Gagal mengambil data laporan");
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/laporan/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal update status");

      setMsg(`Status berhasil diubah ke ${status === "diproses" ? "Diproses" : status === "selesai" ? "Selesai" : "Ditolak"}`);
      fetchLaporan();
    } catch (err) {
      console.log("ERROR UPDATE:", err);
      setMsg(err.message || "Gagal update status");
    }
  };

  const handleTanggapi = (id) => {
    if (!id) return;
    router.push(`/admin/chat/${id}`);
  };

  const filteredLaporan = laporan.filter((item) => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchSearch =
      searchTerm === "" ||
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_user?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const total = laporan.length;
  const pendingCount = laporan.filter((i) => i.status === "pending").length;
  const diprosesCount = laporan.filter((i) => i.status === "diproses").length;
  const selesaiCount = laporan.filter((i) => i.status === "selesai").length;
  const ditolakCount = laporan.filter((i) => i.status === "ditolak").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-red-700 font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kelola Laporan</h1>
              <p className="text-gray-500 text-sm mt-1">Tinjau dan tanggapi laporan masyarakat</p>
            </div>
          </div>
        </div>

        {/* Notifikasi */}
        {msg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-3 rounded-md text-sm shadow-sm flex items-center gap-2">
            <FaCheckCircle className="text-red-600" size={14} />
            <span>{msg}</span>
          </div>
        )}

        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={total} icon={<FaChartLine />} color="red" />
          <StatCard label="Pending" value={pendingCount} icon={<FaClock />} color="amber" />
          <StatCard label="Diproses" value={diprosesCount} icon={<FaSpinner />} color="blue" />
          <StatCard label="Selesai" value={selesaiCount} icon={<FaCheckCircle />} color="green" />
          <StatCard label="Ditolak" value={ditolakCount} icon={<FaTimesCircle />} color="red" />
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-red-500 text-sm" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter Status</span>
            <div className="flex gap-2">
              {["all", "pending", "diproses", "selesai", "ditolak"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    statusFilter === s
                      ? "bg-red-600 text-white shadow-md shadow-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  {s === "all" ? "Semua" : s === "pending" ? "Pending" : s === "diproses" ? "Diproses" : s === "selesai" ? "Selesai" : "Ditolak"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-all bg-white"
            />
          </div>
        </div>

        {/* Grid Laporan - SEMUA CARD SERAGAM */}
        {filteredLaporan.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4 opacity-40">📭</div>
            <p className="text-gray-500 font-medium">Tidak ada laporan yang cocok</p>
            <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaporan.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-red-200 flex flex-col h-full"
              >
                {/* GAMBAR - TINGGI TETAP 200px, LEBAR PENUH, OBJECT COVER */}
                <div 
                  className="relative bg-gray-100 cursor-pointer group/img flex-shrink-0"
                  style={{ height: "200px" }}
                  onClick={() => item.foto && setSelectedImage(`http://localhost:5000/uploads/${item.foto}`)}
                >
                  {item.foto ? (
                    <>
                      <img
                        src={`http://localhost:5000/uploads/${item.foto}`}
                        alt={item.judul}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/600x400?text=Gambar+Gagal";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <FaExpand className="text-red-600" size={16} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <FaImage size={48} />
                      <span className="text-xs text-gray-400">Tidak ada gambar</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <StatusPill status={item.status} />
                  </div>
                </div>

                {/* KONTEN CARD - FLEX COLUMN AGAR TOMBOL DI BAWAH */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-red-700 transition-colors">
                    {item.judul || "Tanpa Judul"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                    {item.deskripsi || "Tidak ada deskripsi"}
                  </p>

                  {item.alamat && (
  <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
    <div className="flex items-start gap-2">
      <FaMapMarkerAlt
        className="text-red-500 mt-0.5 flex-shrink-0"
        size={12}
      />
      <p className="text-xs text-gray-700 flex-1">
        {item.alamat}
      </p>
    </div>

    {(item.latitude && item.longitude) && (
      <a
        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
      >
        <FaExternalLinkAlt size={10} />
        Lihat Lokasi
      </a>
    )}
  </div>
)}

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-red-500" size={10} />
                      </div>
                      <span className="truncate font-medium text-gray-600">{item.nama_user || "Anonim"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="text-red-500" size={10} />
                      </div>
                      <span className="truncate text-gray-600">{item.email || "-"}</span>
                    </div>
                  </div>

                  {/* TOMBOL AKSI - SELALU DI BAWAH */}
                  <div className="mt-5">
                    {(!item.status || item.status === "pending") && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateStatus(item.id, "diproses")}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                        >
                          <FaCheckCircle size={12} /> Terima & Proses
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "ditolak")}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                        >
                          <FaTimesCircle size={12} /> Tolak
                        </button>
                      </div>
                    )}
                    {item.status === "diproses" && (
                      <button
                        onClick={() => handleTanggapi(item.id)}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
                      >
                        <FaCommentDots size={14} /> Tanggapi Sekarang
                      </button>
                    )}
                    {(item.status === "selesai" || item.status === "ditolak") && (
                      <div
                        className={`w-full py-2.5 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-2 ${
                          item.status === "selesai"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {item.status === "selesai" ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
                        {item.status === "selesai" ? "Laporan Selesai" : "Laporan Ditolak"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Preview Gambar */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition-all"
            >
              <FaTimes size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Status Pill
function StatusPill({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm",
    diproses: "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm",
    selesai: "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm",
    ditolak: "bg-red-100 text-red-700 border border-red-200 shadow-sm",
  };
  const labels = {
    pending: "Pending",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${styles[status] || styles.pending}`}>
      {labels[status] || "Pending"}
    </span>
  );
}

// StatCard
function StatCard({ label, value, icon, color }) {
  const colorMap = {
    red: { bg: "bg-gradient-to-br from-red-50 to-red-100/30", border: "border-red-200", iconBg: "bg-gradient-to-br from-red-500 to-red-600", text: "text-red-700" },
    amber: { bg: "bg-gradient-to-br from-amber-50 to-amber-100/30", border: "border-amber-200", iconBg: "bg-gradient-to-br from-amber-500 to-amber-600", text: "text-amber-700" },
    blue: { bg: "bg-gradient-to-br from-blue-50 to-blue-100/30", border: "border-blue-200", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600", text: "text-blue-700" },
    green: { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/30", border: "border-emerald-200", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600", text: "text-emerald-700" },
  };
  const c = colorMap[color] || colorMap.red;
  return (
    <div className={`${c.bg} rounded-xl border ${c.border} p-4 shadow-md hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
        </div>
        <div className={`${c.iconBg} p-2.5 rounded-full text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}