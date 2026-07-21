"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaTags,
  FaSpinner,
  FaFolderOpen,
  FaChartPie,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

export default function SuperAdminKategoriPage() {
  const router = useRouter();
  const [kategori, setKategori] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [categoryStats, setCategoryStats] = useState({});

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Ambil daftar kategori dan laporan untuk statistik
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Ambil semua kategori
      const resKategori = await fetch(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataKategori = await resKategori.json();
      setKategori(Array.isArray(dataKategori) ? dataKategori : []);

      // Ambil semua laporan (untuk menghitung jumlah laporan per kategori)
      const resLaporan = await fetch(`${BASE_URL}/api/admin/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataLaporan = await resLaporan.json();
      const laporanData = Array.isArray(dataLaporan) ? dataLaporan : [];
      setLaporan(laporanData);

      // Hitung statistik: jumlah laporan per kategori
      const stats = {};
      laporanData.forEach((lap) => {
        const katId = lap.kategori_id;
        if (katId) {
          stats[katId] = (stats[katId] || 0) + 1;
        }
      });
      setCategoryStats(stats);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }
    }
    fetchData();
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nama = namaKategori.trim();
    if (!nama) {
      setError("Nama kategori tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      let url = `${BASE_URL}/api/categories`;
      let method = "POST";
      if (editingId) {
        url = `${BASE_URL}/api/categories/${editingId}`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nama }),
      });
      if (res.ok) {
        toast.success(editingId ? "Kategori berhasil diupdate" : "Kategori berhasil ditambahkan");
        fetchData();
        closeModal();
      } else {
        const err = await res.json();
        setError(err.message || "Gagal menyimpan kategori");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, hasReports) => {
    if (hasReports) {
      toast.error("Kategori ini masih memiliki laporan, tidak dapat dihapus");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Kategori berhasil dihapus");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal menghapus kategori");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteId(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNamaKategori("");
    setModalOpen(true);
    setError("");
  };

  const openEditModal = (kat) => {
    setEditingId(kat.id);
    setNamaKategori(kat.nama);
    setModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setNamaKategori("");
    setError("");
  };

  // Hitung total laporan
  const totalLaporan = laporan.length;
  const totalKategori = kategori.length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <SuperAdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Memuat data kategori...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <SuperAdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 transition mb-2 text-sm font-medium"
              >
                <FaArrowLeft size={12} /> Kembali
              </button>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-md">
                  <FaTags className="text-white text-xl" />
                </div>
                Kelola Kategori
              </h1>
              <p className="text-gray-500 mt-1 max-w-lg">
                Kelola semua kategori laporan. Super admin dapat melihat statistik penggunaan kategori.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <FaPlus size={16} className="group-hover:rotate-90 transition-transform" />
              Tambah Kategori
            </button>
          </div>

          {/* Statistik Ringkas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-red-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FaTags className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Kategori</p>
                <p className="text-3xl font-bold text-gray-800">{totalKategori}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-red-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaChartPie className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Laporan</p>
                <p className="text-3xl font-bold text-gray-800">{totalLaporan}</p>
              </div>
            </div>
          </div>

          {/* Grid Kategori - Card Style */}
          {kategori.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4 opacity-40">🏷️</div>
              <p className="text-gray-500 font-medium">Belum ada kategori</p>
              <button
                onClick={openAddModal}
                className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                + Tambah kategori pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kategori.map((kat) => {
                const reportCount = categoryStats[kat.id] || 0;
                const canDelete = reportCount === 0;
                return (
                  <div
                    key={kat.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
                  >
                    <div className="h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <FaFolderOpen className="text-red-500" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-lg">{kat.nama}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(kat)}
                            className="p-2 text-blue-500 hover:text-blue-700 transition rounded-lg hover:bg-blue-50"
                            title="Edit kategori"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(kat.id, !canDelete)}
                            disabled={deleteId === kat.id}
                            className={`p-2 rounded-lg transition ${canDelete ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-gray-300 cursor-not-allowed"}`}
                            title={canDelete ? "Hapus kategori" : "Kategori masih digunakan"}
                          >
                            {deleteId === kat.id ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-400">ID Kategori</span>
                        <span className="font-mono text-gray-600">#{kat.id}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Jumlah Laporan</span>
                        <span className={`font-semibold ${reportCount > 0 ? "text-red-600" : "text-gray-500"}`}>
                          {reportCount} laporan
                        </span>
                      </div>
                      {!canDelete && (
                        <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                          <FaSpinner size={10} className="animate-spin" />
                          Tidak dapat dihapus karena memiliki laporan
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Premium */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold flex items-center gap-2">
                {editingId ? <FaEdit size={18} /> : <FaPlus size={18} />}
                {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white transition-all hover:rotate-90 duration-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none transition-all bg-gray-50 hover:bg-white"
                  placeholder="Contoh: Infrastruktur, Kesehatan..."
                  autoFocus
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  ⚠️ {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}