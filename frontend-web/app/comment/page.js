"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import {
  FaComments,
  FaPaperPlane,
  FaUserCircle,
  FaSearch,
  FaClock,
  FaInbox,
  FaSpinner,
  FaInfoCircle,
  FaTrashAlt,
  FaReply,
  FaTimes,
  FaCheckCircle,
  FaFolderOpen,
  FaMapMarkerAlt,
} from "react-icons/fa";

const API = "http://localhost:5000/api";

export default function UserCommentsPage() {
  const [laporanList, setLaporanList] = useState([]);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCurrentUserId(data.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch user's laporan
  const fetchMyLaporan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal ambil laporan");
      setLaporanList(data);
      if (data.length > 0) {
        setSelectedLaporan(data[0]);
        fetchComments(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (laporanId) => {
    try {
      const res = await fetch(`${API}/comments?laporan_id=${laporanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("COMMENTS =", data);
      setComments(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        laporan_id: selectedLaporan.id,
        komentar: newComment,
      };
      if (replyingTo) {
        payload.parent_id = replyingTo.id;
      }
      const res = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setNewComment("");
      setReplyingTo(null);
      setSuccessMsg("Komentar berhasil dikirim");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchComments(selectedLaporan.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Yakin ingin menghapus komentar ini?")) return;
    setDeletingId(commentId);
    try {
      const res = await fetch(`${API}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setSuccessMsg("Komentar dihapus");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchComments(selectedLaporan.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  useEffect(() => {
    fetchMyLaporan();
  }, []);

  const filteredLaporan = laporanList.filter((l) =>
    (l.judul || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d) => (d ? new Date(d).toLocaleString("id-ID") : "-");

  const statusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-800",
      diproses: "bg-blue-100 text-blue-800",
      selesai: "bg-green-100 text-green-800",
    };
    const label = { pending: "Menunggu", diproses: "Diproses", selesai: "Selesai" };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${map[status] || map.pending}`}>
        {label[status] || status}
      </span>
    );
  };

  // Build comment tree
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

  const commentTree = buildCommentTree(comments);

  const renderComment = (comment, level = 0) => {
    const isOwn = comment.user_id === currentUserId;
    const maxIndent = 3;
    const indentLevel = Math.min(level, maxIndent);
    return (
      <div key={comment.id} className={`mb-4 ${indentLevel > 0 ? 'ml-6 md:ml-10' : ''} animate-fadeInUp`} style={{ animationDelay: `${level * 0.05}s` }}>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-red-200 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <FaUserCircle className="text-xl" />
              </div>
              <div>
                <span className="font-semibold text-gray-800 text-sm">
                  {comment.role === "admin" ? "Petugas SWARA" : comment.user_nama}
                </span>
                {comment.role === "admin" && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <FaClock size={10} />
                  <span>{formatDate(comment.created_at)}</span>
                </div>
              </div>
            </div>
            {isOwn && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                disabled={deletingId === comment.id}
                className="text-red-400 hover:text-red-700 transition-all duration-200 hover:scale-110"
                title="Hapus"
              >
                {deletingId === comment.id ? <FaSpinner className="animate-spin" size={12} /> : <FaTrashAlt size={14} />}
              </button>
            )}
          </div>
          <p className="text-gray-700 text-sm mt-3 leading-relaxed">{comment.komentar}</p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setReplyingTo({ id: comment.id, userName: comment.user_nama || "Pengguna" })}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 transition-all duration-200 hover:gap-2 bg-red-50 px-3 py-1 rounded-full"
            >
              <FaReply size={10} /> Balas
            </button>
          </div>
        </div>
        {comment.replies && comment.replies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <FaSpinner className="animate-spin text-red-700 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium animate-pulse">Memuat laporan Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-red-800 flex items-center gap-3">
            <FaComments className="text-red-600" />
            Komentar Laporan
          </h1>
          <p className="text-gray-500 mt-1 ml-1">Diskusi dan klarifikasi dengan petugas terkait laporan Anda.</p>
        </div>

        {/* Notifikasi */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 rounded-r-xl text-sm flex justify-between items-center animate-slideInRight shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900 transition-transform hover:scale-110"><FaTimes /></button>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-xl text-sm flex justify-between items-center animate-slideInRight shadow-sm">
            <span><FaCheckCircle className="inline mr-1" /> {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-green-700 hover:text-green-900 transition-transform hover:scale-110"><FaTimes /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daftar Laporan - Sidebar kiri dengan desain kartu */}
          <div className="lg:col-span-1 space-y-4 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-red-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <FaInbox className="text-red-600 text-lg" />
              <h2 className="text-lg font-semibold text-gray-700">Laporan Saya ({filteredLaporan.length})</h2>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredLaporan.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-red-100">
                  <FaFolderOpen className="mx-auto text-4xl mb-2 opacity-40" />
                  <p>Tidak ada laporan.</p>
                </div>
              ) : (
                filteredLaporan.map((l, idx) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setSelectedLaporan(l);
                      fetchComments(l.id);
                      setReplyingTo(null);
                      setNewComment("");
                    }}
                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${
                      selectedLaporan?.id === l.id
                        ? "border-red-500 bg-red-50/50 shadow-md ring-1 ring-red-200"
                        : "border-red-100 hover:border-red-300"
                    } animate-fadeInUp`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="font-semibold text-gray-800 line-clamp-1">{l.judul}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
                      <FaMapMarkerAlt size={10} /> {l.alamat || "Alamat tidak tersedia"}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      {statusBadge(l.status)}
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <FaClock size={10} />
                        <span>{formatDate(l.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Area Komentar - desain mirip card form */}
          <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            {selectedLaporan ? (
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Header laporan dengan gradasi merah */}
                <div className="bg-gradient-to-r from-red-800 to-red-700 text-white p-5">
                  <h2 className="text-xl font-bold">{selectedLaporan.judul}</h2>
                  <p className="text-sm text-red-100 mt-2 leading-relaxed">{selectedLaporan.deskripsi}</p>
                  
                  <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-xs font-semibold text-red-100 uppercase tracking-wide">Lokasi Kejadian</p>
                    <p className="text-sm text-white mt-1 break-words flex items-center gap-1">
                      <FaMapMarkerAlt /> {selectedLaporan.alamat || "Alamat tidak tersedia"}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {statusBadge(selectedLaporan.status)}
                    <span className="text-xs text-red-200 flex items-center gap-1">
                      <FaClock size={10} />
                      {formatDate(selectedLaporan.created_at)}
                    </span>
                  </div>
                </div>

                {/* Daftar Komentar */}
                <div className="p-5 max-h-[450px] overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
                  {commentTree.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 animate-fadeIn">
                      <FaInfoCircle className="mx-auto text-5xl mb-3 opacity-40" />
                      <p className="text-lg">Belum ada komentar.</p>
                      <p className="text-sm">Mulai diskusi dengan menulis komentar di bawah.</p>
                    </div>
                  ) : (
                    commentTree.map(comment => renderComment(comment, 0))
                  )}
                </div>

                {/* Form Kirim Komentar */}
                <form onSubmit={handleAddComment} className="p-5 border-t border-red-100 bg-white">
                  {replyingTo && (
                    <div className="mb-4 p-3 bg-red-50 rounded-xl flex justify-between items-center text-sm animate-fadeIn border-l-4 border-red-500">
                      <span className="text-red-700">
                        <FaReply className="inline mr-1" /> Membalas <strong>{replyingTo.userName}</strong>
                      </span>
                      <button type="button" onClick={cancelReply} className="text-gray-400 hover:text-red-600 transition-transform hover:scale-110">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyingTo ? `Balas ke ${replyingTo.userName}...` : "Tulis tanggapan atau pertanyaan..."}
                      className="flex-1 px-4 py-3 border border-red-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 bg-red-50/30"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={16} />}
                      <span className="hidden sm:inline font-medium">Kirim</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    * Komentar Anda akan dilihat oleh petugas untuk membantu proses laporan.
                    {replyingTo && " Klik 'X' untuk membatalkan balasan."}
                  </p>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-lg border border-red-100 animate-fadeIn">
                <FaComments className="mx-auto text-6xl mb-4 opacity-40" />
                <p className="text-lg font-medium">Pilih laporan terlebih dahulu</p>
                <p className="text-sm mt-1">Klik salah satu laporan dari daftar di samping untuk melihat atau memberi tanggapan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0a0a0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c06060;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}