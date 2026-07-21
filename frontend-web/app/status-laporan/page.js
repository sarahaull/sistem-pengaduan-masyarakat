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
  FaPlusCircle,
  FaEye,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { HiOutlineEmojiSad } from "react-icons/hi";

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
          icon: <FaClock className="text-amber-500" size={14} />,
          label: "Menunggu",
        };
      case "diproses":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <FaSpinner className="text-blue-500 animate-spin" size={14} />,
          label: "Diproses",
        };
      case "selesai":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FaCheckCircle className="text-emerald-500" size={14} />,
          label: "Selesai",
        };
      case "ditolak":
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: <FaTimesCircle className="text-gray-500" size={14} />,
          label: "Ditolak",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-200",
          icon: <FaClock className="text-gray-400" size={14} />,
          label: status || "Unknown",
        };
    }
  };

  // StatCard dengan desain yang lebih menarik (mirip dashboard)
  const StatCard = ({ title, value, icon, active = false, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
          active
            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg ring-2 ring-red-300"
            : "bg-white border-2 border-red-200 text-gray-700 hover:border-red-400 hover:shadow-md hover:bg-red-50"
        }`}
      >
        <div className="text-left">
          <p className={`text-xs font-semibold uppercase tracking-wide ${active ? "text-red-100" : "text-gray-400"}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${active ? "text-white" : "text-gray-800"}`}>
            {value}
          </p>
        </div>
        <div className={`text-2xl transition-colors duration-200 ${active ? "text-white/90" : "text-red-500 group-hover:text-red-600"}`}>
          {icon}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-red-700 font-medium">Memuat laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header area - tidak ikut scroll */}
        <div className="flex-shrink-0 p-6 lg:p-8 pb-0">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                Status <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Laporan</span>
              </h1>
              <p className="text-gray-500 text-base mt-1">Pantau perkembangan setiap laporan Anda</p>
            </div>
          </div>

          {/* Stat Cards - hanya tampil jika ada laporan */}
          {laporan.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard title="Total" value={total} icon={<FaClipboardList />} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
              <StatCard title="Menunggu" value={pending} icon={<FaClock />} active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} />
              <StatCard title="Diproses" value={diproses} icon={<FaSpinner />} active={statusFilter === "diproses"} onClick={() => setStatusFilter("diproses")} />
              <StatCard title="Selesai" value={selesai} icon={<FaCheckCircle />} active={statusFilter === "selesai"} onClick={() => setStatusFilter("selesai")} />
              <StatCard title="Ditolak" value={ditolak} icon={<FaTimesCircle />} active={statusFilter === "ditolak"} onClick={() => setStatusFilter("ditolak")} />
            </div>
          )}

          {/* Filter Pills dengan gaya merah putih */}
          {laporan.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-3 border-b border-red-200">
              <div className="p-2 bg-red-100 rounded-full">
                <FaFilter className="text-red-600 text-sm" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Filter Status:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Semua" },
                  { value: "pending", label: "Menunggu" },
                  { value: "diproses", label: "Diproses" },
                  { value: "selesai", label: "Selesai" },
                  { value: "ditolak", label: "Ditolak" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setStatusFilter(item.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      statusFilter === item.value
                        ? "bg-red-600 text-white shadow-md ring-2 ring-red-300 ring-offset-1"
                        : "bg-white text-gray-600 hover:bg-red-100 hover:text-red-700 border border-red-200 hover:border-red-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-base text-red-700 animate-fadeIn">
              {error}
            </div>
          )}
        </div>

        {/* Scrollable area untuk daftar laporan */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8">
          {filteredLaporan.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-xl border-2 border-red-100 animate-fadeInUp">
              {laporan.length === 0 ? (
                <>
                  <div className="text-6xl mb-4 text-red-300">📭</div>
                  <h3 className="text-xl font-semibold text-gray-700">Belum ada laporan</h3>
                  <p className="text-gray-400 mt-2">Buat laporan pertama Anda</p>
                  <button
                    onClick={() => router.push("/dashboard/add-laporan")}
                    className="mt-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl text-base inline-flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <FaPlusCircle size={16} /> Buat Laporan
                  </button>
                </>
              ) : (
                <>
                  <HiOutlineEmojiSad className="text-6xl text-red-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-base">
                    Tidak ada laporan dengan status{" "}
                    <span className="font-semibold text-red-600">
                      {statusFilter === "all" ? "tersedia" : statusFilter === "pending" ? "Menunggu" : statusFilter === "diproses" ? "Diproses" : statusFilter === "selesai" ? "Selesai" : "Ditolak"}
                    </span>
                  </p>
                  <button onClick={() => setStatusFilter("all")} className="mt-3 text-red-600 text-base hover:underline font-medium">
                    Lihat semua laporan
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-fadeInUp">
              {filteredLaporan.map((item) => {
                const statusStyle = getStatusStyle(item.status);
                const fotoUrl = item.foto ? `http://localhost:5000/uploads/${item.foto}` : null;

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl shadow-md border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 p-5">
                      {/* Thumbnail dengan border */}
                      <div className="sm:w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-red-100">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => (e.target.src = "https://placehold.co/112x112?text=No+Img")}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-red-300 bg-white">
                            <FaImage size={36} className="opacity-60" />
                            <span className="text-xs mt-1 opacity-60">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Informasi Laporan */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg group-hover:text-red-700 transition-colors">
                            {item.judul || "Tanpa Judul"}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                            {statusStyle.icon} {statusStyle.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1.5">
                            <FaFolderOpen size={14} /> <span className="capitalize">{item.kategori || "Umum"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaCalendarAlt size={14} /> {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                        </div>

                        {/* Alamat dengan latar merah lembut */}
                        <div className="mb-3">
                          <div className="flex items-start gap-2 text-sm text-gray-600 bg-red-50/50 border border-red-100 rounded-lg p-2.5">
                            <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                            <span className="line-clamp-1">{item.alamat || "Alamat tidak tersedia"}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {item.deskripsi || "Tidak ada deskripsi"}
                        </p>
                      </div>

                      {/* Tombol Detail dengan gaya merah */}
                      <div className="flex items-center justify-end sm:justify-center">
                        <button
                          onClick={() => router.push(`/dashboard/detail-laporan/${item.id}`)}
                          className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-600 group/btn"
                        >
                          <FaEye size={16} /> Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}