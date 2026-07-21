"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFileExcel,
  FaChartLine,
  FaRedoAlt,
  FaDatabase,
  FaFileAlt,
  FaTags, // icon untuk kategori
} from "react-icons/fa";
import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminLaporanPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin" && user.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }

    const fetchLaporan = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/admin/laporan", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLaporan(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaporan();
  }, [router]);

  const filteredLaporan = useMemo(() => {
    return laporan.filter((item) => {
      const matchStatus = filterStatus === "semua" || item.status === filterStatus;
      const matchSearch =
        item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [laporan, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = laporan.length;
    const pending = laporan.filter((l) => l.status === "pending").length;
    const diproses = laporan.filter((l) => l.status === "diproses").length;
    const selesai = laporan.filter((l) => l.status === "selesai").length;
    const ditolak = laporan.filter((l) => l.status === "ditolak").length;
    return { total, pending, diproses, selesai, ditolak };
  }, [laporan]);

  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);
  const paginatedData = filteredLaporan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetPage = () => setCurrentPage(1);
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    resetPage();
  };
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    resetPage();
  };
  const clearFilters = () => {
    setFilterStatus("semua");
    setSearchTerm("");
    resetPage();
  };

  const exportToExcel = () => {
    const excelData = filteredLaporan.map((item) => ({
      ID: item.id,
      Judul: item.judul,
      Pelapor: item.nama_user,
      Email: item.email,
      Kategori: item.kategori,
      Status: item.status,
      "Tanggal Dibuat": new Date(item.created_at).toLocaleDateString("id-ID"),
      Deskripsi: item.deskripsi,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `laporan_${new Date().toISOString().slice(0, 19)}.xlsx`);
  };

  const exportSingleToExcel = (item) => {
    const excelData = [{
      ID: item.id,
      Judul: item.judul,
      Pelapor: item.nama_user,
      Email: item.email,
      Kategori: item.kategori,
      Status: item.status,
      "Tanggal Dibuat": new Date(item.created_at).toLocaleDateString("id-ID"),
      Deskripsi: item.deskripsi,
    }];
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `laporan_${item.id}_${new Date().toISOString().slice(0, 19)}.xlsx`);
  };

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <FaClock size={12} /> };
      case "diproses":
        return { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <FaSpinner size={12} className="animate-spin" /> };
      case "selesai":
        return { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <FaCheckCircle size={12} /> };
      case "ditolak":
        return { label: "Ditolak", color: "bg-rose-100 text-rose-800 border-rose-200", icon: <FaTimesCircle size={12} /> };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700 border-gray-200", icon: null };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
          <p className="mt-4 text-red-800 font-semibold">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100">
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-red-900 rounded-2xl shadow-2xl p-6 mb-8 text-white overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <FaChartLine className="text-white/80 drop-shadow" />
                  Manajemen Laporan
                </h1>
                <p className="text-red-100 text-sm mt-1">Kelola semua laporan masyarakat dengan mudah dan cepat</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Tombol Kelola Kategori */}
                <button
                  onClick={() => router.push("/admin/kategori")}
                  className="flex items-center gap-2 bg-white/90 text-red-700 hover:bg-white px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 font-semibold hover:shadow-lg hover:-translate-y-0.5"
                >
                  <FaTags size={18} />
                  Kelola Kategori
                </button>
                {/* Tombol Export Excel */}
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 font-semibold hover:shadow-lg hover:-translate-y-0.5"
                >
                  <FaFileExcel size={18} className="text-green-600" />
                  Export Excel (Semua)
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total" value={stats.total} icon={<FaDatabase />} color="red" />
            <StatCard title="Pending" value={stats.pending} icon={<FaClock />} color="amber" />
            <StatCard title="Diproses" value={stats.diproses} icon={<FaSpinner />} color="blue" spin />
            <StatCard title="Selesai" value={stats.selesai} icon={<FaCheckCircle />} color="green" />
            <StatCard title="Ditolak" value={stats.ditolak} icon={<FaTimesCircle />} color="rose" />
          </div>

          {/* Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-5 mb-8 transition-all hover:shadow-red-100/50">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-1">
                  <FaFilter size={10} /> Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full border border-red-200 text-black rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 transition bg-red-50/30"
                >
                  <option value="semua">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div className="flex-[2]">
                <label className="block text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-1">
                  <FaSearch size={10} /> Cari Laporan
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={14} />
                  <input
                    type="text"
                    placeholder="Judul, nama pelapor, atau email..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 text-black py-2.5 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 transition bg-red-50/30"
                  />
                </div>
              </div>
              {(filterStatus !== "semua" || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="h-11 px-5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm flex items-center gap-2 transition-all font-medium"
                >
                  <FaRedoAlt size={12} /> Reset
                </button>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500 border-t border-red-100 pt-3 flex justify-between items-center">
              <span>Menampilkan {filteredLaporan.length} laporan dari total {laporan.length}</span>
              <FaFileAlt className="text-red-300" size={12} />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden transition-all hover:shadow-red-100/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                  <tr>
                    <th className="text-left p-4 font-semibold">Judul</th>
                    <th className="text-left p-4 font-semibold">Pelapor</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Kategori</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Dibuat</th>
                    <th className="text-left p-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-red-50 p-4 rounded-full">
                            <FaSearch size={28} className="text-red-300" />
                          </div>
                          <p className="font-semibold text-gray-500">Tidak ada laporan yang ditemukan</p>
                          <p className="text-xs text-gray-400">Coba ubah kata kunci atau filter status</p>
                        </div>
                       </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => {
                      const badge = statusBadge(item.status);
                      return (
                        <tr key={item.id} className="group hover:bg-red-50/40 transition-all duration-200">
                          <td className="p-4 font-medium text-gray-800 max-w-xs truncate">{item.judul}</td>
                          <td className="p-4 text-gray-700">{item.nama_user || "-"}</td>
                          <td className="p-4 text-gray-500 text-xs">{item.email}</td>
                          <td className="p-4">
                            <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${badge.color}`}>
                              {badge.icon} {badge.label}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs">
                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-3 items-center">
                              <Link
                                href={`/admin/laporan/${item.id}`}
                                className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm"
                              >
                                <FaEye size={14} /> Detail
                              </Link>
                              <button
                                onClick={() => exportSingleToExcel(item)}
                                className="text-green-600 hover:text-green-800 transition flex items-center gap-1 text-sm"
                                title="Download Excel"
                              >
                                <FaFileExcel size={14} /> Excel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
              <div className="text-xs text-gray-500 bg-white/50 px-3 py-1.5 rounded-full">
                Menampilkan{" "}
                <span className="font-bold text-red-700">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
                <span className="font-bold text-red-700">{Math.min(currentPage * itemsPerPage, filteredLaporan.length)}</span>{" "}
                dari <span className="font-bold text-red-700">{filteredLaporan.length}</span> laporan
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <FaChevronLeft size={14} className="text-red-600" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-red-600 text-white shadow-md"
                            : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-red-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <FaChevronRight size={14} className="text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, spin = false }) {
  const colorMap = {
    red: "border-red-500 bg-red-50 text-red-700",
    amber: "border-amber-500 bg-amber-50 text-amber-700",
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    green: "border-emerald-500 bg-emerald-50 text-emerald-700",
    rose: "border-rose-500 bg-rose-50 text-rose-700",
  };
  return (
    <div className={`rounded-2xl border-l-4 ${colorMap[color]} p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-full bg-white shadow-sm ${spin ? "animate-spin" : ""}`}>{icon}</div>
      </div>
    </div>
  );
}