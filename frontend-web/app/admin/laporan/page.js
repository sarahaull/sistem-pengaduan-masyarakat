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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setLaporan(data);
        }
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
      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      const matchSearch =
        item.judul
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.nama_user
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [laporan, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = laporan.length;

    const pending = laporan.filter(
      (l) => l.status === "pending"
    ).length;

    const diproses = laporan.filter(
      (l) => l.status === "diproses"
    ).length;

    const selesai = laporan.filter(
      (l) => l.status === "selesai"
    ).length;

    const ditolak = laporan.filter(
      (l) => l.status === "ditolak"
    ).length;

    return {
      total,
      pending,
      diproses,
      selesai,
      ditolak,
    };
  }, [laporan]);

  const totalPages = Math.ceil(
    filteredLaporan.length / itemsPerPage
  );

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
      "Tanggal Dibuat": new Date(
        item.created_at
      ).toLocaleDateString("id-ID"),
      Deskripsi: item.deskripsi,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Laporan"
    );

    XLSX.writeFile(
      workbook,
      `laporan_${new Date()
        .toISOString()
        .slice(0, 19)}.xlsx`
    );
  };

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color:
            "bg-amber-100 text-amber-800 border-amber-200",
          icon: <FaClock size={12} />,
        };

      case "diproses":
        return {
          label: "Diproses",
          color:
            "bg-blue-100 text-blue-800 border-blue-200",
          icon: (
            <FaSpinner
              size={12}
              className="animate-spin"
            />
          ),
        };

      case "selesai":
        return {
          label: "Selesai",
          color:
            "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <FaCheckCircle size={12} />,
        };

      case "ditolak":
        return {
          label: "Ditolak",
          color:
            "bg-rose-100 text-rose-800 border-rose-200",
          icon: <FaTimesCircle size={12} />,
        };

      default:
        return {
          label: status,
          color:
            "bg-gray-100 text-gray-700 border-gray-200",
          icon: null,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-3 text-red-700 text-sm font-medium">
            Memuat laporan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 p-4 md:p-6">

          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-700 to-red-800 rounded-2xl shadow-lg p-6 mb-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <FaChartLine className="text-white/80" />
                    Manajemen Laporan
                  </h1>

                  <p className="text-red-100 text-sm mt-1">
                    Kelola semua laporan masyarakat dengan mudah
                  </p>
                </div>

                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 font-semibold"
                >
                  <FaFileExcel
                    size={18}
                    className="text-green-600"
                  />

                  Export Excel
                </button>
              </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-600 p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Total
                    </p>

                    <p className="text-2xl font-bold text-gray-800">
                      {stats.total}
                    </p>
                  </div>

                  <FaDatabase className="text-red-400 text-xl" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500 p-4">
                <p className="text-xs text-amber-600 uppercase tracking-wide">
                  Pending
                </p>

                <p className="text-2xl font-bold text-amber-700">
                  {stats.pending}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-4">
                <p className="text-xs text-blue-600 uppercase tracking-wide">
                  Diproses
                </p>

                <p className="text-2xl font-bold text-blue-700">
                  {stats.diproses}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-emerald-500 p-4">
                <p className="text-xs text-emerald-600 uppercase tracking-wide">
                  Selesai
                </p>

                <p className="text-2xl font-bold text-emerald-700">
                  {stats.selesai}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border-l-4 border-rose-500 p-4">
                <p className="text-xs text-rose-600 uppercase tracking-wide">
                  Ditolak
                </p>

                <p className="text-2xl font-bold text-rose-700">
                  {stats.ditolak}
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <FaFilter size={10} />
                    Filter Status
                  </label>

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      handleFilterChange(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
                  >
                    <option value="semua">
                      Semua Status
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="diproses">
                      Diproses
                    </option>

                    <option value="selesai">
                      Selesai
                    </option>

                    <option value="ditolak">
                      Ditolak
                    </option>
                  </select>
                </div>

                <div className="flex-[2]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <FaSearch size={10} />
                    Cari Laporan
                  </label>

                  <div className="relative">
                    <FaSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />

                    <input
                      type="text"
                      placeholder="Judul, nama pelapor, atau email..."
                      value={searchTerm}
                      onChange={(e) =>
                        handleSearchChange(e.target.value)
                      }
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
                    />
                  </div>
                </div>

                {(filterStatus !== "semua" ||
                  searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2 transition"
                  >
                    <FaRedoAlt size={12} />
                    Reset
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-400 border-t pt-3">
                Menampilkan {filteredLaporan.length} laporan
                dari total {laporan.length}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">

                <table className="w-full text-sm">
                  <thead className="bg-red-50 border-b border-red-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-red-800">
                        Judul
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Pelapor
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Email
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Kategori
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Status
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Dibuat
                      </th>

                      <th className="text-left p-4 font-semibold text-red-800">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-gray-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-red-50 p-3 rounded-full">
                              <FaSearch
                                size={24}
                                className="text-red-300"
                              />
                            </div>

                            <p className="font-medium">
                              Tidak ada laporan yang ditemukan
                            </p>

                            <p className="text-xs">
                              Coba ubah kata kunci atau
                              filter status
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => {
                        const badge = statusBadge(
                          item.status
                        );

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-red-50/40 transition-colors duration-150"
                          >
                            <td className="p-4 font-medium text-gray-800 max-w-xs truncate">
                              {item.judul}
                            </td>

                            <td className="p-4 text-gray-700">
                              {item.nama_user || "-"}
                            </td>

                            <td className="p-4 text-gray-500 text-xs">
                              {item.email}
                            </td>

                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                {item.kategori}
                              </span>
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                              >
                                {badge.icon}
                                {badge.label}
                              </span>
                            </td>

                            <td className="p-4 text-gray-500 text-xs">
                              {new Date(
                                item.created_at
                              ).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>

                            <td className="p-4">
                              <Link
                                href={`/admin/laporan/${item.id}`}
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition"
                              >
                                <FaEye size={14} />
                                Detail
                              </Link>
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

                <div className="text-xs text-gray-500">
                  Menampilkan{" "}
                  <span className="font-medium text-red-700">
                    {(currentPage - 1) *
                      itemsPerPage +
                      1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-red-700">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredLaporan.length
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-red-700">
                    {filteredLaporan.length}
                  </span>{" "}
                  laporan
                </div>

                <div className="flex gap-2 items-center">

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-300 transition"
                  >
                    <FaChevronLeft
                      size={14}
                      className="text-gray-600"
                    />
                  </button>

                  <div className="flex gap-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          totalPages
                        ),
                      },
                      (_, i) => {
                        let pageNum;

                        if (totalPages <= 5)
                          pageNum = i + 1;
                        else if (currentPage <= 3)
                          pageNum = i + 1;
                        else if (
                          currentPage >=
                          totalPages - 2
                        )
                          pageNum =
                            totalPages - 4 + i;
                        else
                          pageNum =
                            currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setCurrentPage(pageNum)
                            }
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-red-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage === totalPages
                    }
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-300 transition"
                  >
                    <FaChevronRight
                      size={14}
                      className="text-gray-600"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}