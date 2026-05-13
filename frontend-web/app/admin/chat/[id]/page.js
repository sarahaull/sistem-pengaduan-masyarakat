"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";

export default function AdminChatPage() {
  const { id } = useParams();

  const [laporan, setLaporan] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("diproses");
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const chatEndRef = useRef(null);

  const scrollBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollBottom();
  }, [chat]);

  // =========================
  // SAFE JSON
  // =========================
  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log(text);
      return null;
    }
  };

  // =========================
  // GET LAPORAN
  // =========================
  const getLaporan = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/laporan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);

      if (!data) return;

      setLaporan(data);
      setStatus(data.status || "diproses");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET CHAT
  // =========================
  const getChat = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);

      if (!Array.isArray(data)) {
        setChat([]);
        return;
      }

      setChat(data);
    } catch (err) {
      console.log(err);
      setChat([]);
    }
  };

  useEffect(() => {
    if (!id) return;

    getLaporan();
    getChat();

    const interval = setInterval(() => {
      getChat();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  // =========================
  // SEND CHAT
  // =========================
  const sendMessage = async () => {
    if (!message.trim()) return;
    if (status === "selesai") return; // chat tertutup

    setSending(true);

    const temp = message;
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          laporan_id: id,
          sender: "admin",
          message: temp,
        }),
      });

      getChat();
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !sending && status !== "selesai") sendMessage();
  };

  // =========================
  // SELESAI (dengan konfirmasi)
  // =========================
  const markSelesai = async () => {
    if (status === "selesai") return;

    const confirmClose = window.confirm(
      "Apakah Anda yakin ingin menandai pengaduan ini selesai?\nChat akan ditutup dan pengguna tidak bisa membalas lagi."
    );

    if (!confirmClose) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/laporan/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "selesai" }),
      });

      setStatus("selesai");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.log(err);
      alert("Gagal mengubah status, coba lagi.");
    }
  };

  // =========================
  // IMAGE
  // =========================
  const getImage = () =>
    laporan?.foto
      ? `http://localhost:5000/uploads/${laporan.foto}`
      : "https://via.placeholder.com/400x200?text=Tidak+Ada+Foto";

  if (!id) return <div className="p-10 text-center">Loading...</div>;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-200"></div>
          <p className="text-red-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );

  const isClosed = status === "selesai";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* HEADER with elegant shadow */}
        <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              💬 Pesan Pengaduan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">ID Laporan: #{id}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                isClosed
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-200"
              }`}
            >
              {isClosed ? "✓ Selesai" : "● Diproses"}
            </span>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold shadow-sm">
              A
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="font-medium">Laporan telah diselesaikan</span>
            </div>
          </div>
        )}

        <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =========================
              DETAIL LAPORAN - Elegant Card
          ========================= */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 text-white">
              <h2 className="font-bold text-xl flex items-center gap-2">
                📋 Detail Pengaduan
              </h2>
              <p className="text-xs opacity-90 mt-1">
                Informasi lengkap dari warga
              </p>
            </div>

            <div className="p-5 space-y-5">
              <div className="relative group">
                <img
                  src={getImage()}
                  alt="foto pengaduan"
                  className="w-full h-48 object-cover rounded-2xl border border-gray-200 shadow-sm transition-transform group-hover:scale-[1.01]"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  📷 Bukti
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Judul Laporan
                  </p>
                  <h3 className="text-xl font-bold text-gray-800 leading-tight mt-1">
                    {laporan?.judul}
                  </h3>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Deskripsi
                  </p>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-1">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {laporan?.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-400">👤 Pengirim</p>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {laporan?.user?.name || "Unknown User"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-400">📅 Tanggal</p>
                    <p className="font-medium text-gray-700 mt-0.5">
                      {laporan?.created_at
                        ? new Date(laporan.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={markSelesai}
                disabled={isClosed}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isClosed
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isClosed ? (
                  <>
                    <span>✅</span> Selesai
                  </>
                ) : (
                  <>
                    <span>✔</span> Tandai Selesai
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =========================
              CHAT AREA - Elegant & Modern
          ========================= */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col overflow-hidden h-[calc(100vh-7rem)]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-red-500">💬</span> Percakapan Live
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isClosed
                    ? "Percakapan ditutup (laporan selesai)"
                    : "Admin ↔ Warga"}
                </p>
              </div>
              {!isClosed && (
                <div className="bg-green-100 text-green-700 text-[11px] px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Aktif
                </div>
              )}
            </div>

            {/* Chat Messages List with custom scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FAFB] scroll-smooth">
              {chat.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">
                    💬
                  </div>
                  <p className="text-gray-400 font-medium">
                    Belum ada pesan
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Kirim pesan pertama ke warga
                  </p>
                </div>
              )}

              {chat.map((c, i) => (
                <div
                  key={i}
                  className={`flex ${
                    c.sender === "admin" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 fade-in duration-200`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-2.5 shadow-sm ${
                      c.sender === "admin"
                        ? "bg-gradient-to-r from-red-600 to-red-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{c.message}</p>
                    <div
                      className={`text-[10px] mt-1 ${
                        c.sender === "admin"
                          ? "text-red-100 text-right"
                          : "text-gray-400"
                      }`}
                    >
                      {c.sender === "admin" ? "Admin" : "Warga"}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area with elegant style */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {isClosed ? (
                <div className="bg-gray-100 rounded-xl p-3 text-center text-gray-500 text-sm">
                  🔒 Chat ditutup karena pengaduan sudah selesai
                </div>
              ) : (
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tulis pesan..."
                      disabled={sending}
                      className="w-full border border-gray-200 rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all bg-gray-50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ✨
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className={`rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-md ${
                      sending || !message.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white hover:shadow-lg"
                    }`}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}