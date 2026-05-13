"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCircle,
  FaTag,
  FaCalendarAlt,
  FaPaperPlane,
  FaImage,
  FaUser,
  FaHeadset,
  FaInfoCircle,
  FaRedoAlt,
} from "react-icons/fa";

export default function DetailLaporan() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [laporan, setLaporan] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const chatContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Fetch laporan detail
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/laporan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLaporan(data);
    } catch (err) {
      console.error("Fetch detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat messages
  const fetchChat = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const messages = Array.isArray(data) ? data : [];
      setChat(messages);
    } catch (err) {
      console.error("Fetch chat error:", err);
      setChat([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    const isFinalStatus = laporan?.status === "selesai" || laporan?.status === "ditolak";
    if (isFinalStatus) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          laporan_id: id,
          sender: "user",
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setChat((prev) => [...prev, data]);
        setMessage("");
        scrollToBottom();
      } else {
        console.error("Send message failed:", data);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  // Format tanggal dan waktu
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Setup polling for new messages (only if status not final)
  useEffect(() => {
    if (id && laporan) {
      const isFinal = laporan.status === "selesai" || laporan.status === "ditolak";
      if (!isFinal) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(() => {
          fetchChat();
        }, 5000);
      } else if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id, laporan?.status]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchDetail();
      fetchChat();
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
          <p className="text-red-600 font-medium">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaTimesCircle className="text-gray-400 text-3xl" />
          </div>
          <p className="text-gray-500 font-medium">Data laporan tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: "Menunggu",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <FaClock className="text-amber-500" />,
      description: "Laporan Anda sedang menunggu untuk diproses oleh admin.",
    },
    diproses: {
      label: "Diproses",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <FaSpinner className="animate-spin text-blue-500" />,
      description: "Admin sedang menangani laporan Anda. Kami akan segera merespon.",
    },
    selesai: {
      label: "Selesai",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: <FaCheckCircle className="text-green-500" />,
      description: "Laporan telah selesai ditangani. Terima kasih atas partisipasi Anda.",
    },
    ditolak: {
      label: "Ditolak",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <FaTimesCircle className="text-red-500" />,
      description: "Mohon maaf, laporan tidak dapat diproses. Silakan hubungi admin untuk informasi lebih lanjut.",
    },
  };

  const status = statusConfig[laporan.status] || statusConfig.pending;
  const isChatDisabled = laporan.status === "selesai" || laporan.status === "ditolak";
  const imageUrl =
    !imageError && laporan?.foto
      ? `http://localhost:5000/uploads/${laporan.foto}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-red-700 transition-all duration-200 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali</span>
          </button>
          <div className="text-xs text-gray-400 bg-white/50 px-3 py-1 rounded-full">
            ID: {id}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT CARD - Detail Laporan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-red-100 transition-all duration-300 hover:shadow-xl">
            {/* Image Section */}
            <div className="relative h-56 bg-gradient-to-br from-red-50 to-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={laporan.judul}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-red-300">
                  <FaImage className="text-5xl mb-2 opacity-50" />
                  <span className="text-sm text-gray-400">Tidak ada gambar</span>
                </div>
              )}
              {/* Status Badge overlay */}
              <div className="absolute top-4 left-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border ${status.color} bg-white/90 backdrop-blur-sm`}
                >
                  {status.icon}
                  {status.label}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                {laporan.judul}
              </h1>

              <p className="text-gray-600 mt-3 leading-relaxed text-sm">
                {laporan.deskripsi}
              </p>

              {/* Info Panels */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <FaUserCircle />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pelapor</p>
                    <p className="font-medium">{laporan.nama_user || "Pengguna"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <FaTag />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Kategori</p>
                    <p className="font-medium">{laporan.kategori}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Dibuat pada</p>
                    <p className="font-medium">
                      {new Date(laporan.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Description */}
              <div className="mt-6 p-3 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex gap-2 text-red-700 text-xs">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                  <p>{status.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Chat Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-red-100 flex flex-col h-[600px] lg:h-[700px] overflow-hidden transition-all duration-300">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaHeadset className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-lg">Pusat Bantuan</h2>
                  <p className="text-xs text-red-100">
                    {isChatDisabled
                      ? "Diskusi ditutup"
                      : "Admin akan merespon pesan Anda"}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchChat}
                className="text-white/80 hover:text-white transition p-2 rounded-full hover:bg-white/10"
                title="Refresh pesan"
              >
                <FaRedoAlt className="text-sm" />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 scroll-smooth"
            >
              {chatLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>
                    <p className="text-xs text-gray-400">Memuat percakapan...</p>
                  </div>
                </div>
              ) : chat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <FaComment className="text-gray-300 text-2xl" />
                  </div>
                  <p className="text-gray-400 text-sm">Belum ada pesan</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Kirim pesan pertama untuk memulai diskusi
                  </p>
                </div>
              ) : (
                chat.map((c, idx) => {
                  const isUser = c.sender === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}
                    >
                      <div className={`max-w-[85%] lg:max-w-[70%]`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            isUser
                              ? "bg-red-600 text-white rounded-br-none"
                              : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center gap-1 text-xs text-red-500 font-medium mb-1">
                              <FaUser className="text-[10px]" />
                              <span>Admin</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {c.message}
                          </p>
                          <div
                            className={`text-[10px] mt-1 ${
                              isUser ? "text-red-200" : "text-gray-400"
                            } text-right`}
                          >
                            {formatMessageTime(c.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input Area */}
            {isChatDisabled ? (
              <div className="p-4 border-t bg-gray-50">
                <div className="bg-gray-100 rounded-xl p-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  {laporan.status === "selesai" ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      Laporan telah selesai, chat ditutup.
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-400" />
                      Laporan ditolak, tidak dapat mengirim pesan.
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Tulis pesan Anda..."
                      disabled={sending}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none transition-all disabled:bg-gray-50 pr-10"
                    />
                    {message.trim() && (
                      <span className="absolute right-3 bottom-3 text-[10px] text-gray-400">
                        {message.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    className={`px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      !message.trim() || sending
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    {sending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane className="text-sm" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Admin akan membalas pesan Anda sesegera mungkin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Additional component for empty chat fallback icon
function FaComment(props) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}