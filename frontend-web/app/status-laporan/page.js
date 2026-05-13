"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import {
  FaClipboardList,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaImage,
  FaCalendarAlt,
  FaFolderOpen,
  FaRegSadTear,
} from "react-icons/fa";

export default function StatusLaporanPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchLaporan = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/api/laporan", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Gagal mengambil data laporan");
        const data = await res.json();
        setLaporan(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchLaporan();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredLaporan =
    statusFilter === "all"
      ? laporan
      : laporan.filter((item) => item.status === statusFilter);

  const total = laporan.length;
  const pending = laporan.filter((i) => i.status === "pending").length;
  const diproses = laporan.filter((i) => i.status === "diproses").length;
  const selesai = laporan.filter((i) => i.status === "selesai").length;
  const ditolak = laporan.filter((i) => i.status === "ditolak").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <FaClock className="text-amber-500" size={12} />,
          label: "Pending",
        };
      case "diproses":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <FaSpinner className="text-blue-500 animate-spin-slow" size={12} />,
          label: "Diproses",
        };
      case "selesai":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FaCheckCircle className="text-emerald-500" size={12} />,
          label: "Selesai",
        };
      case "ditolak":
        return {
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-200",
          icon: <FaTimesCircle className="text-red-500" size={12} />,
          label: "Ditolak",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-200",
          icon: <FaClock className="text-gray-400" size={12} />,
          label: status || "Unknown",
        };
    }
  };

  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      red: "from-red-50 to-white border-red-200 text-red-600",
      amber: "from-amber-50 to-white border-amber-200 text-amber-600",
      blue: "from-blue-50 to-white border-blue-200 text-blue-600",
      green: "from-emerald-50 to-white border-emerald-200 text-emerald-600",
    };
    return (
      <div className={`bg-gradient-to-br rounded-xl border p-4 shadow-sm hover:shadow-md transition ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-2xl opacity-80">{icon}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500 text-sm">Memuat laporan Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header section dengan aksen garis merah */}
        <div className="mb-8 relative">
          <div className="absolute left-0 top-0 h-12 w-1 bg-rose-600 rounded-full"></div>
          <div className="pl-5">
            <h1 className="text-2xl font-bold text-gray-800">Status Laporan</h1>
            <p className="text-gray-400 text-sm mt-1">Pantau perkembangan laporan yang Anda kirimkan</p>
          </div>
        </div>

        {/* Stat Cards */}
        {laporan.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total" value={total} icon={<FaClipboardList />} color="red" />
            <StatCard title="Pending" value={pending} icon={<FaClock />} color="amber" />
            <StatCard title="Diproses" value={diproses} icon={<FaSpinner />} color="blue" />
            <StatCard title="Selesai" value={selesai} icon={<FaCheckCircle />} color="green" />
            <StatCard title="Ditolak" value={ditolak} icon={<FaTimesCircle />} color="red" />
          </div>
        )}

        {/* Filter bar yang lebih elegan */}
        {laporan.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-2 mb-6 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <FaFilter className="text-gray-400 text-sm" />
              <span className="text-xs font-medium text-gray-500">FILTER</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["all", "pending", "diproses", "selesai", "ditolak"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "pending"
                    ? "Pending"
                    : status === "diproses"
                    ? "Diproses"
                    : status === "selesai"
                    ? "Selesai"
                    : "Ditolak"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50/80 border-l-4 border-rose-500 p-4 rounded-xl mb-6 backdrop-blur-sm">
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        )}

        {/* List Laporan dengan card lebih cantik */}
        {filteredLaporan.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            {laporan.length === 0 ? (
              <>
                <div className="text-6xl mb-4 opacity-40">📭</div>
                <h3 className="text-gray-700 font-semibold text-lg">Belum ada laporan</h3>
                <p className="text-gray-400 text-sm mt-1">Anda belum mengirimkan laporan apapun</p>
                <button
                  onClick={() => router.push("/dashboard/add-laporan")}
                  className="mt-5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm"
                >
                  + Buat Laporan Sekarang
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3 opacity-40">🔍</div>
                <p className="text-gray-500 text-sm">Tidak ada laporan dengan status "{statusFilter}"</p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="mt-3 text-rose-600 text-sm hover:underline"
                >
                  Lihat semua laporan
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaporan.map((item) => {
              const statusStyle = getStatusStyle(item.status);
              const fotoUrl = item.foto
  ? `http://localhost:5000/uploads/${item.foto}`
  : null;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Gambar dengan overlay halus */}
                  <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/400x200?text=Gambar+Tidak+Tersedia";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <FaImage size={36} className="opacity-50" />
                        <span className="text-xs mt-2 opacity-50">Tidak ada gambar</span>
                      </div>
                    )}
                    {/* Status badge dengan efek glass */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} shadow-sm backdrop-blur-sm`}>
                      {statusStyle.icon}
                      {statusStyle.label}
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-rose-700 transition">
                      {item.judul || "Tanpa Judul"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                      <FaFolderOpen size={11} />
                      <span className="capitalize">{item.kategori || "Umum"}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-2">
                      {item.deskripsi || "Tidak ada deskripsi"}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <FaCalendarAlt size={11} />
                      <span>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}