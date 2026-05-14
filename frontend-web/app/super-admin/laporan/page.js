"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Filter & search
  const filteredLaporan = laporan.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const searchMatch =
      search === "" ||
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase()));
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
        {c.icon} {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-red-800">📋 Semua Laporan</h1>
        <p className="text-gray-500 text-sm">Kelola dan pantau laporan dari masyarakat</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Filter dan Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2 items-center">
          <FaFilter className="text-red-600" />
          <div className="flex gap-2">
            {["all", "pending", "diproses", "selesai"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-full transition ${
                  filter === status
                    ? "bg-red-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
      </div>

      {/* Tabel Laporan */}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Aksi</th>
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
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => router.push(`/admin/laporan/${item.id}`)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Detail"
                      >
                        <FaEye size={18} />
                      </button>
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
  );
}