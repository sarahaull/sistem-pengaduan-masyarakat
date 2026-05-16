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
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const API = "http://localhost:5000/api";

export default function UserCommentsPage() {
  const [laporanList, setLaporanList] = useState([]);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [comments, setComments] = useState([]); // flat array with parent_id
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id, userName }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [currentUserId, setCurrentUserId] = useState(null);

  // fetch user info for current user (to know which comments are his)
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
      if (!res.ok) throw new Error(data.msg);
      // data diharapkan array komentar dengan field parent_id, user_id, dll
      setComments(data);
    } catch (err) {
      setComments([]);
      setError(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
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

  const filtered = laporanList.filter((l) =>
    (l.judul || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d) => (d ? new Date(d).toLocaleString("id-ID") : "-");

  const statusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-800",
      diproses: "bg-blue-100 text-blue-800",
      selesai: "bg-emerald-100 text-emerald-800",
    };
    const label = { pending: "Menunggu", diproses: "Diproses", selesai: "Selesai" };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${map[status] || map.pending}`}>
        {label[status] || status}
      </span>
    );
  };

  // Build comment tree (optional, for indentation)
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
    return (
      <div key={comment.id} className={`ml-${Math.min(level * 4, 8)}`} style={{ marginLeft: level * 16 }}>
        <div className="bg-white rounded-xl p-3 shadow-sm border-l-2 border-red-300 mb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-gray-400 text-3xl" />
              <div>
                <span className="font-semibold text-gray-800 text-sm">
                  {comment.user_name || (comment.user_role === "admin" ? "Petugas Admin" : "Saya (Pelapor)")}
                </span>
                {comment.user_role === "admin" && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FaClock size={10} />
              <span>{formatDate(comment.created_at)}</span>
              {isOwn && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deletingId === comment.id}
                  className="text-red-500 hover:text-red-700 transition ml-2"
                  title="Hapus komentar"
                >
                  {deletingId === comment.id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt size={12} />}
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-700 text-sm mt-2 leading-relaxed">{comment.komentar}</p>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setReplyingTo({ id: comment.id, userName: comment.user_name })}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-red-600 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">Memuat laporan Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-x-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#7a2c2a] flex items-center gap-3">
            <FaComments className="text-red-600" />
            Tanggapan & Catatan Laporan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lihat dan berikan tanggapan resmi terhadap laporan Anda. Komentar digunakan untuk klarifikasi atau informasi tambahan.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-700 rounded-r-lg text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              <FaTimes />
            </button>
          </div>
        )}

        <div className="relative max-w-md mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daftar Laporan */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaInbox /> Daftar Laporan
            </h2>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 shadow-sm border">
                Tidak ada laporan ditemukan.
              </div>
            ) : (
              filtered.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    setSelectedLaporan(l);
                    fetchComments(l.id);
                    setReplyingTo(null);
                    setNewComment("");
                  }}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border-l-4 ${
                    selectedLaporan?.id === l.id
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <div className="font-semibold text-gray-800 line-clamp-1">{l.judul}</div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    {statusBadge(l.status)}
                    <div className="flex items-center gap-1 text-gray-400">
                      <FaClock size={10} />
                      <span>{formatDate(l.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Area Tanggapan */}
          <div className="lg:col-span-2">
            {selectedLaporan ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-[#7a2c2a] to-[#5e1914] text-white p-5">
                  <h2 className="text-xl font-bold">{selectedLaporan.judul}</h2>
                  <p className="text-sm text-red-100 mt-2 line-clamp-2">{selectedLaporan.deskripsi}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {statusBadge(selectedLaporan.status)}
                    <span className="text-xs text-red-200 flex items-center gap-1">
                      <FaClock size={10} /> {formatDate(selectedLaporan.created_at)}
                    </span>
                  </div>
                </div>

                {/* Daftar Tanggapan dengan nested replies */}
                <div className="p-5 max-h-[450px] overflow-y-auto space-y-4 bg-gray-50">
                  {commentTree.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <FaInfoCircle className="mx-auto text-3xl mb-2 opacity-50" />
                      <p>Belum ada tanggapan. Anda dapat memberikan catatan terkait laporan ini.</p>
                    </div>
                  ) : (
                    commentTree.map(comment => renderComment(comment, 0))
                  )}
                </div>

                {/* Form Tambah Tanggapan dengan indikasi balasan */}
                <form onSubmit={handleAddComment} className="p-4 border-t border-gray-200 bg-white">
                  {replyingTo && (
                    <div className="mb-3 p-2 bg-red-50 rounded-lg flex justify-between items-center text-sm">
                      <span className="text-red-700">
                        <FaReply className="inline mr-1" /> Membalas <strong>{replyingTo.userName}</strong>
                      </span>
                      <button type="button" onClick={cancelReply} className="text-gray-500 hover:text-red-600">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {replyingTo ? "Tulis balasan Anda" : "Berikan tanggapan atau informasi tambahan"}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        replyingTo
                          ? `Balas ke ${replyingTo.userName}...`
                          : "Tulis catatan klarifikasi, data pendukung, atau pertanyaan terkait laporan..."
                      }
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                      {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                      <span className="hidden sm:inline">Kirim</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * Gunakan kolom ini untuk memberikan informasi tambahan atau klarifikasi terhadap laporan.
                    {replyingTo && " Klik tombol X untuk membatalkan balasan."}
                  </p>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
                <FaComments className="mx-auto text-4xl mb-3 opacity-40" />
                <p>Pilih laporan dari daftar di samping untuk melihat atau memberi tanggapan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}