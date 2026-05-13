"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import {
  FaFilter,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaClipboardList,
  FaArrowRight,
  FaHome,
  FaChartLine,
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch laporan
  const fetchLaporan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/laporan", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) setLaporan([...data]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Inisialisasi user & redirect admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      router.push("/login");
      return;
    }
    try {
      const userData = JSON.parse(userRaw);
      if (userData.role === "admin" || userData.role === "super_admin") {
        router.push("/admin/dashboard");
        return;
      }
      setUser(userData);
      fetchLaporan();
    } catch (err) {
      console.log(err);
      router.push("/login");
    }
  }, []);

  // Auto refresh saat window focus
  useEffect(() => {
    const handleFocus = () => fetchLaporan();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Filter by status + search (judul/deskripsi)
  const filteredLaporan = laporan.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const searchMatch =
      searchTerm === "" ||
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Status counts
  const totalPending = laporan.filter((i) => i.status === "pending").length;
  const totalDiproses = laporan.filter((i) => i.status === "diproses").length;
  const totalSelesai = laporan.filter((i) => i.status === "selesai").length;

  // Warna status
  const statusColor = {
    pending: "bg-amber-100 text-amber-800 border-l-4 border-amber-500",
    diproses: "bg-blue-100 text-blue-800 border-l-4 border-blue-500",
    selesai: "bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-red-800 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* HERO SECTION dengan gradien merah modern */}
        <div className="relative bg-gradient-to-r from-red-800 to-red-900 rounded-3xl shadow-2xl p-8 mb-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                Halo, {user?.nama} 👋
              </h1>
              <p className="text-red-100 mt-2 text-lg">
                Selamat datang di portal pengaduan masyarakat.
              </p>
              <div className="flex items-center gap-2 mt-4 text-red-200 text-sm">
                <FaHome />
                <span>Dashboard / Laporan Saya</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/add-laporan")}
              className="bg-white text-red-800 hover:bg-red-50 px-6 py-3 rounded-2xl flex items-center gap-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              <FaPlus /> Buat Laporan Baru
            </button>
          </div>
        </div>

        {/* STATISTIK CARD - desain modern dengan icon dan gradient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Laporan"
            value={laporan.length}
            icon={<FaClipboardList className="text-3xl" />}
            color="from-red-600 to-red-700"
            bgGlow="red"
          />
          <StatCard
            title="Menunggu"
            value={totalPending}
            icon={<FaClock className="text-3xl" />}
            color="from-amber-500 to-amber-600"
            bgGlow="amber"
          />
          <StatCard
            title="Diproses"
            value={totalDiproses}
            icon={<FaSpinner className="text-3xl animate-spin-slow" />}
            color="from-blue-500 to-blue-600"
            bgGlow="blue"
          />
          <StatCard
            title="Selesai"
            value={totalSelesai}
            icon={<FaCheckCircle className="text-3xl" />}
            color="from-emerald-500 to-emerald-600"
            bgGlow="emerald"
          />
        </div>

        {/* FILTER & SEARCH SECTION */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-5 mb-8 border border-red-100">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaFilter className="text-red-700" />
              <span className="font-medium text-gray-700">Filter Status:</span>
              <div className="flex gap-2">
                {["all", "pending", "diproses", "selesai"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filter === status
                        ? "bg-red-700 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all"
                      ? "Semua"
                      : status === "pending"
                      ? "Menunggu"
                      : status === "diproses"
                      ? "Diproses"
                      : "Selesai"}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 w-full md:w-64"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* DAFTAR LAPORAN - GRID MODERN */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2">
              <FaChartLine className="text-red-600" />
              Semua Laporan
            </h2>
            <p className="text-sm text-gray-500">
              Menampilkan {filteredLaporan.length} dari {laporan.length} laporan
            </p>
          </div>

          {filteredLaporan.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-red-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">Belum ada laporan yang ditemukan.</p>
              <button
                onClick={() => router.push("/dashboard/add-laporan")}
                className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition"
              >
                Buat Laporan Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredLaporan.map((item) => {
                const fotoUrl = item.foto
                  ? `http://localhost:5000/uploads/${item.foto}`
                  : "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={fotoUrl}
                        alt={item.judul}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${statusColor[item.status]}`}
                        >
                          {item.status === "pending"
                            ? "Menunggu"
                            : item.status === "diproses"
                            ? "Diproses"
                            : "Selesai"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-red-800 text-xl line-clamp-1">
                        {item.judul}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {item.deskripsi}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/detail-laporan/${item.id}`)
                          }
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm transition-all group-hover:gap-3"
                        >
                          Detail <FaArrowRight className="text-xs" />
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
    </div>
  );
}

// Komponen StatCard terpisah dengan desain glassmorphism
function StatCard({ title, value, icon, color, bgGlow }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
      <div className="relative p-6 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-extrabold mt-2">{value}</p>
        </div>
        <div className="text-white/70">{icon}</div>
      </div>
    </div>
  );
}

// Tambahkan animasi spin lambat di tailwind.config.js (opsional)
// Untuk efek spin-slow, tambahkan di global.css:
// @keyframes spin-slow { 100% { transform: rotate(360deg); } }
// .animate-spin-slow { animation: spin-slow 3s linear infinite; }