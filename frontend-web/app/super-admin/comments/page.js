"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import {
  FaComments,
  FaSearch,
  FaTrashAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaUserCircle,
  FaClock,
  FaFilter,
  FaChartLine,
  FaRegCommentDots,
  FaReply,
} from "react-icons/fa";

const API = "http://localhost:5000/api";

export default function AdminCommentsPage() {
  const router = useRouter();

  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [laporanList, setLaporanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLaporanFilter, setSelectedLaporanFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetchAllComments();
    fetchLaporanList();
  }, []);

  // Safe fetch JSON
  const safeFetchJson = async (url, options) => {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return { ok: res.ok, data: JSON.parse(text) };
    } catch {
      throw new Error("Backend tidak mengirim JSON (cek API)");
    }
  };

  // Ambil semua komentar
  const fetchAllComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { ok, data } = await safeFetchJson(`${API}/admin/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!ok) throw new Error(data.msg || "Gagal mengambil komentar");
      setComments(data);
      setFilteredComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ambil daftar laporan untuk filter
  const fetchLaporanList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setLaporanList(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Edit komentar
  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ komentar: editText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal update komentar");

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, komentar: editText } : c))
      );
      setEditingId(null);
      setEditText("");
      setSuccess("Komentar berhasil diupdate");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Hapus komentar
  const handleDeleteComment = async (id) => {
    if (!confirm("Yakin ingin menghapus komentar ini? Tindakan tidak bisa dibatalkan.")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal hapus komentar");
      setComments((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Komentar berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtering
  useEffect(() => {
    let filtered = [...comments];
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          (c.komentar || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.laporan_judul || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedLaporanFilter) {
      filtered = filtered.filter((c) => c.laporan_id === parseInt(selectedLaporanFilter));
    }
    setFilteredComments(filtered);
  }, [searchTerm, selectedLaporanFilter, comments]);

  const formatDate = (d) => (d ? new Date(d).toLocaleString("id-ID") : "-");

  // Statistik
  const totalComments = comments.length;
  const todayComments = comments.filter((c) => {
    const date = new Date(c.created_at);
    return date.toDateString() === new Date().toDateString();
  }).length;
  const avgPerLaporan = laporanList.length ? (totalComments / laporanList.length).toFixed(1) : 0;
  const laporanWithComments = new Set(comments.map((c) => c.laporan_id)).size;

  // Badge status laporan
  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-800",
      diproses: "bg-blue-100 text-blue-800",
      selesai: "bg-emerald-100 text-emerald-800",
    };
    const label = { pending: "Menunggu", diproses: "Diproses", selesai: "Selesai" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.pending}`}>
        {label[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SuperAdminSidebar/>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-red-600 text-5xl mx-auto mb-3" />
            <p className="text-gray-500">Memuat komentar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SuperAdminSidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl shadow-md">
              <FaComments className="text-white text-2xl" />
            </div>
            <span>Kelola <span className="text-red-600">Komentar</span></span>
          </h1>
          <p className="text-gray-500 mt-1">Pantau, edit, atau hapus komentar dari seluruh laporan</p>
        </div>

        {/* Statistik ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaRegCommentDots />} label="Total Komentar" value={totalComments} color="red" />
          <StatCard icon={<FaClock />} label="Hari Ini" value={todayComments} color="orange" />
          <StatCard icon={<FaChartLine />} label="Rata-rata per Laporan" value={avgPerLaporan} color="blue" />
          <StatCard icon={<FaComments />} label="Laporan dengan Komentar" value={laporanWithComments} color="green" />
        </div>

        {/* Notifikasi */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 rounded-r-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900"><FaTimes /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="text-green-700 hover:text-green-900"><FaTimes /></button>
          </div>
        )}

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari komentar, pengguna, atau laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedLaporanFilter}
                onChange={(e) => setSelectedLaporanFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent appearance-none bg-gray-50"
              >
                <option value="">Semua Laporan</option>
                {laporanList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.judul}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Komentar */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
              <FaComments className="mx-auto text-4xl mb-3 opacity-40" />
              <p>Tidak ada komentar yang ditemukan.</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200"
              >
                <div className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <FaUserCircle className="text-gray-400 text-4xl" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">
                            {comment.user_name || "Pengguna"}
                          </span>
                          {comment.user_role === "admin" && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>
                          )}
                          {comment.user_role === "super_admin" && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Super Admin</span>
                          )}
                          {comment.laporan_status && getStatusBadge(comment.laporan_status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <FaClock size={10} /> {formatDate(comment.created_at)}
                          </span>
                          <span className="truncate max-w-[200px]">
                            Laporan: {comment.laporan_judul || `ID: ${comment.laporan_id}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === comment.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(comment.id)}
                            className="text-green-600 hover:text-green-800 p-1 transition"
                            title="Simpan"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditText("");
                            }}
                            className="text-gray-500 hover:text-gray-700 p-1 transition"
                            title="Batal"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditText(comment.komentar);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-red-500 hover:text-red-700 p-1 transition disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === comment.id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    {editingId === comment.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        rows="3"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.komentar}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Kartu Statistik
function StatCard({ icon, label, value, color }) {
  const colorMap = {
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition">
      <div className={`${colorMap[color]} p-3 rounded-xl text-xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}