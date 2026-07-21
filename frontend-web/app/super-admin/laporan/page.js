"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileExcel,
  FaTags, // tambahkan icon kategori
} from "react-icons/fa";
import * as XLSX from "xlsx";

export default function LaporanPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setLaporan(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Tidak dapat memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  const filteredLaporan = laporan.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const searchMatch =
      search === "" ||
      item.judul?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const statusBadge = (status) => {
    const config = {
      pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Menunggu", icon: <FaClock /> },
      diproses: { bg: "bg-blue-100", text: "text-blue-800", label: "Diproses", icon: <FaSpinner /> },
      selesai: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Selesai", icon: <FaCheckCircle /> },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  const exportAllExcel = () => {
    const dataExport = filteredLaporan.map((item) => ({
      ID: item.id,
      Judul: item.judul,
      Deskripsi: item.deskripsi,
      Status: item.status,
      Tanggal: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Semua Laporan");
    XLSX.writeFile(workbook, "laporan_masyarakat.xlsx");
  };

  const exportSingleExcel = (item) => {
    const dataExport = [
      {
        ID: item.id,
        Judul: item.judul,
        Deskripsi: item.deskripsi,
        Status: item.status,
        Tanggal: item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Laporan");
    XLSX.writeFile(workbook, `laporan_${item.id}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex">
        <SuperAdminSidebar />
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 p-6 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red-800">📋 Semua Laporan</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola dan pantau laporan dari masyarakat</p>
          </div>
          <div className="flex gap-3">
            {/* Tombol Kelola Kategori */}
            <button
              onClick={() => router.push("/super-admin/kategori")}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <FaTags /> Kelola Kategori
            </button>
            <button
              onClick={exportAllExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <FaFileExcel /> Export Semua Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4 items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex gap-2 items-center flex-wrap">
            <FaFilter className="text-red-600" />
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "diproses", "selesai"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-full transition ${
                    filter === status ? "bg-red-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "Semua" : status === "pending" ? "Menunggu" : status === "diproses" ? "Diproses" : "Selesai"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Cari judul atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 text-black rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </div>

        {filteredLaporan.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200">
            Tidak ada laporan yang ditemukan.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredLaporan.map((item) => (
                    <tr key={item.id} className="hover:bg-red-50 transition duration-150">
                      <td className="px-6 py-3 text-sm text-gray-500">#{item.id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.judul}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 max-w-xs truncate">{item.deskripsi}</td>
                      <td className="px-6 py-3">{statusBadge(item.status)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => router.push(`/admin/laporan/${item.id}`)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Detail"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => exportSingleExcel(item)}
                            className="text-green-600 hover:text-green-800 transition"
                            title="Export Excel"
                          >
                            <FaFileExcel size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500 bg-gray-50">
              Menampilkan {filteredLaporan.length} dari {laporan.length} laporan
            </div>
          </div>
        )}
      </div>
    </div>
  );
}