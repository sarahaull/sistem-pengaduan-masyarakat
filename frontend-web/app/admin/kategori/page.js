"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import AdminSidebar from "@/app/components/AdminSidebar";

const BASE_URL = "http://localhost:5000";

export default function KategoriPage() {
  const router = useRouter();
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Ambil daftar kategori
  const fetchKategori = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal fetch");
      const data = await res.json();
      if (Array.isArray(data)) setKategori(data);
      else setKategori([]);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kategori");
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
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }
    }
    fetchKategori();
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
        await fetchKategori();
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

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus kategori ini?\nKategori yang memiliki laporan tidak dapat dihapus."
      )
    )
      return;
    setDeleteId(id);
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchKategori();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menghapus kategori");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
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

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-rose-300 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-rose-600 font-medium">Memuat kategori...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-100">

      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header area dengan gradasi lembut */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 to-transparent rounded-2xl -z-10"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition mb-2 text-sm font-medium"
                >
                  <FaArrowLeft size={12} /> Kembali
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-xl shadow-sm">
                    <FaTags className="text-rose-600 text-xl" />
                  </div>
                  Kelola Kategori
                </h1>
                <p className="text-sm text-gray-500 mt-1 max-w-lg">
                  Kelola kategori laporan masyarakat. Kategori yang sudah memiliki laporan tidak dapat dihapus.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="group flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <FaPlus size={16} className="group-hover:rotate-90 transition-transform" />
                Tambah Kategori
              </button>
            </div>
          </div>

          {/* Statistik ringkas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-rose-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <FaFolderOpen className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Kategori</p>
                <p className="text-2xl font-bold text-gray-800">{kategori.length}</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-rose-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <FaChartPie className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Kategori Aktif</p>
                <p className="text-2xl font-bold text-gray-800">{kategori.length}</p>
              </div>
            </div>
          </div>

          {/* Tabel Kategori dengan desain modern */}
          <div className="bg-white rounded-2xl shadow-md border border-rose-100 overflow-hidden transition-all hover:shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                  <tr>
                    <th className="text-left p-4 font-semibold w-20">ID</th>
                    <th className="text-left p-4 font-semibold">Nama Kategori</th>
                    <th className="text-left p-4 font-semibold w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {kategori.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-rose-50 rounded-full">
                            <FaTags size={32} className="text-rose-300" />
                          </div>
                          <p className="font-medium text-gray-500">Belum ada kategori</p>
                          <button
                            onClick={openAddModal}
                            className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
                          >
                            <FaPlus size={12} /> Tambah kategori pertama
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    kategori.map((kat, index) => (
                      <tr
                        key={kat.id}
                        className="group hover:bg-rose-50/40 transition-all duration-150"
                      >
                        <td className="p-4 text-gray-500 font-mono text-xs">
                          <span className="bg-rose-50 px-2 py-1 rounded-full text-rose-700">
                            #{kat.id}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-800">{kat.nama}</td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => openEditModal(kat)}
                              className="text-blue-500 hover:text-blue-700 transition p-1 rounded-lg hover:bg-blue-50"
                              title="Edit kategori"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(kat.id)}
                              disabled={deleteId === kat.id}
                              className="text-rose-500 hover:text-rose-700 transition p-1 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                              title="Hapus kategori"
                            >
                              {deleteId === kat.id ? (
                                <FaSpinner className="animate-spin" size={14} />
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-6 text-xs text-gray-400 bg-white/40 rounded-xl p-3 text-center">
            💡 Kategori yang sudah digunakan pada laporan tidak dapat dihapus untuk menjaga integritas data.
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit dengan desain menarik */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold flex items-center gap-2">
                {editingId ? (
                  <>
                    <FaEdit size={18} /> Edit Kategori
                  </>
                ) : (
                  <>
                    <FaPlus size={18} /> Tambah Kategori
                  </>
                )}
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none transition-all bg-gray-50 hover:bg-white"
                  placeholder="Contoh: Infrastruktur, Kesehatan..."
                  autoFocus
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
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
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}