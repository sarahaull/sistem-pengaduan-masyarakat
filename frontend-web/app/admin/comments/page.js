"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
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
  FaDatabase,
  FaRedoAlt,
  FaPaperPlane,
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
  const [replyingTo, setReplyingTo] = useState(null); // { id, userName, laporan_id }
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

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

  // Ambil semua komentar (termasuk replies)
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

  // Kirim balasan (reply) ke komentar tertentu
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        laporan_id: replyingTo.laporan_id,
        komentar: replyText,
        parent_id: replyingTo.id,
      };
      const res = await fetch(`${API}/admin/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal mengirim balasan");
      setSuccess("Balasan berhasil dikirim");
      setReplyingTo(null);
      setReplyText("");
      fetchAllComments(); // refresh data
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setSubmittingReply(false);
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

  // Build comment tree (untuk menampilkan reply secara indentasi)
  const buildCommentTree = (commentsList) => {
    const map = new Map();
    const roots = [];
    commentsList.forEach(c => { map.set(c.id, { ...c, replies: [] }); });
    commentsList.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).replies.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    return roots;
  };

  const commentTree = buildCommentTree(filteredComments);

  // Render comment dengan replies
  const renderComment = (comment, level = 0) => {
    const isAdmin = comment.user_role === "admin" || comment.user_role === "super_admin";
    const maxIndent = 3;
    const indentLevel = Math.min(level, maxIndent);
    return (
      <div key={comment.id} className={`mb-4 ${indentLevel > 0 ? 'ml-6 md:ml-10 border-l-2 border-red-200 pl-3' : ''}`}>
        <div className="group bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden hover:shadow-xl hover:shadow-red-100/30 transition-all duration-300">
          <div className="p-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-full p-2 shadow-inner">
                  <FaUserCircle className="text-red-600 text-4xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 text-base">
                      {comment.user_name || "Pengguna"}
                    </span>
                    {comment.user_role === "admin" && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Admin</span>
                    )}
                    {comment.user_role === "super_admin" && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Super Admin</span>
                    )}
                    {comment.laporan_status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        comment.laporan_status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                        comment.laporan_status === "diproses" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        comment.laporan_status === "selesai" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        "bg-rose-100 text-rose-800 border-rose-200"
                      }`}>
                        {comment.laporan_status === "pending" ? "Pending" :
                         comment.laporan_status === "diproses" ? "Diproses" :
                         comment.laporan_status === "selesai" ? "Selesai" : "Ditolak"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <FaClock size={10} className="text-red-400" /> {formatDate(comment.created_at)}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[220px]">
                      <FaReply size={10} className="text-red-400" />
                      Laporan: {comment.laporan_judul || `ID: ${comment.laporan_id}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1.5 shadow-sm">
                {editingId === comment.id ? (
                  <>
                    <button onClick={() => handleEdit(comment.id)} className="text-emerald-600 hover:text-emerald-800 p-1.5 transition rounded-full hover:bg-emerald-50" title="Simpan">
                      <FaSave />
                    </button>
                    <button onClick={() => { setEditingId(null); setEditText(""); }} className="text-gray-500 hover:text-gray-700 p-1.5 transition rounded-full hover:bg-gray-100" title="Batal">
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(comment.id); setEditText(comment.komentar); }} className="text-blue-500 hover:text-blue-700 p-1.5 transition rounded-full hover:bg-blue-50" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)} disabled={deletingId === comment.id} className="text-rose-500 hover:text-rose-700 p-1.5 transition rounded-full hover:bg-rose-50 disabled:opacity-50" title="Hapus">
                      {deletingId === comment.id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                    </button>
                    <button onClick={() => setReplyingTo({ id: comment.id, userName: comment.user_name, laporan_id: comment.laporan_id })} className="text-red-500 hover:text-red-700 p-1.5 transition rounded-full hover:bg-red-50" title="Balas">
                      <FaReply />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 ml-2 border-l-2 border-red-200 pl-4">
              {editingId === comment.id ? (
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 transition bg-red-50/20 text-gray-700" rows="3" autoFocus />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{comment.komentar}</p>
              )}
            </div>
          </div>
        </div>
        {/* Replies */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-white">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
            <p className="mt-4 text-red-800 font-semibold">Memuat komentar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/30">
      
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-red-900 rounded-2xl shadow-2xl p-6 mb-8 text-white overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <FaComments className="text-white text-2xl" />
                </div>
                <span>Kelola <span className="text-red-200">Komentar</span></span>
              </h1>
              <p className="text-red-100 text-sm mt-1">Pantau, edit, hapus, atau balas komentar dari seluruh laporan</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <FaRegCommentDots className="text-red-200" />
              <span className="text-sm font-medium">{totalComments} Komentar</span>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FaRegCommentDots />} label="Total Komentar" value={totalComments} color="red" />
          <StatCard icon={<FaClock />} label="Hari Ini" value={todayComments} color="orange" />
          <StatCard icon={<FaChartLine />} label="Rata-rata per Laporan" value={avgPerLaporan} color="blue" />
          <StatCard icon={<FaComments />} label="Laporan dengan Komentar" value={laporanWithComments} color="green" />
        </div>

        {/* Notifikasi */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-600 text-red-800 rounded-r-xl flex justify-between items-center shadow-sm">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 transition"><FaTimes /></button>
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-r-xl flex justify-between items-center shadow-sm">
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-600 hover:text-emerald-800 transition"><FaTimes /></button>
          </div>
        )}

        {/* Filter & Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-5 mb-8 transition-all hover:shadow-red-100/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-sm" />
              <input
                type="text"
                placeholder="Cari komentar, pengguna, atau laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 transition bg-red-50/30 text-gray-700"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-sm" />
              <select
                value={selectedLaporanFilter}
                onChange={(e) => setSelectedLaporanFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 transition bg-red-50/30 text-gray-700 appearance-none cursor-pointer"
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
          {(searchTerm || selectedLaporanFilter) && (
            <div className="mt-3 flex justify-end">
              <button onClick={() => { setSearchTerm(""); setSelectedLaporanFilter(""); }} className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800 transition bg-red-50 px-3 py-1.5 rounded-full">
                <FaRedoAlt size={10} /> Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Form Balasan (Reply) */}
        {replyingTo && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-200 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaReply className="text-red-500" /> Membalas komentar dari <span className="text-red-700 font-bold">{replyingTo.userName}</span>
              </h3>
              <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-red-600 transition"><FaTimes /></button>
            </div>
            <form onSubmit={handleReply} className="flex gap-3 items-start">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan Anda..."
                className="flex-1 p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-300 transition bg-white text-gray-700"
                rows="2"
                autoFocus
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                {submittingReply ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                Kirim
              </button>
            </form>
          </div>
        )}

        {/* Daftar Komentar (tree view) */}
        <div className="space-y-4">
          {commentTree.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-red-100">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-4xl text-red-300" />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada komentar yang ditemukan</p>
              <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci atau filter</p>
            </div>
          ) : (
            commentTree.map(comment => renderComment(comment, 0))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t border-red-100 pt-4">
          Menampilkan {filteredComments.length} dari {comments.length} komentar
        </div>
      </div>
    </div>
  );
}

// Komponen Kartu Statistik
function StatCard({ icon, label, value, color }) {
  const colorMap = {
    red: "from-red-100 to-red-50 text-red-700 border-red-200",
    orange: "from-orange-100 to-orange-50 text-orange-700 border-orange-200",
    blue: "from-blue-100 to-blue-50 text-blue-700 border-blue-200",
    green: "from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200",
  };
  const iconBg = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-emerald-500",
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl border p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold mt-1">{value}</p>
        </div>
        <div className={`${iconBg[color]} p-2 rounded-full text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}