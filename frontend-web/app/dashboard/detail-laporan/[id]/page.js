"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
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
  FaClipboardList,
  FaMapMarkerAlt,
  FaImages,
  FaExpand,
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
  const [previewImage, setPreviewImage] = useState(null);
  const [adminImages, setAdminImages] = useState([]);
  const systemAddedRef = useRef(false);

  const chatContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useLayoutEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    if (!chatLoading && chat.length > 0) {
      scrollToBottom("smooth");
    }
  }, [chat, chatLoading]);

  useEffect(() => {
    if (chat.length > 0) {
      const images = chat
        .filter(c => c.sender === "admin" && c.message && c.message.startsWith("data:image"))
        .map(c => c.message);
      setAdminImages(images);
    } else {
      setAdminImages([]);
    }
  }, [chat]);

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

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const serverMessages = Array.isArray(data) ? data : [];

      setChat((prev) => {
        const map = new Map();
        for (const msg of prev) map.set(msg.id, msg);
        for (const msg of serverMessages) {
          if (!map.has(msg.id)) map.set(msg.id, msg);
        }
        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return merged;
      });
    } catch (err) {
      console.error("Fetch chat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!chatLoading && laporan && !systemAddedRef.current) {
      systemAddedRef.current = true;
    }
  }, [chatLoading, laporan]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || sending) return;
    if (laporan?.status !== "diproses") return;

    const tempId = Date.now() + Math.random();
    const optimisticMsg = {
      id: tempId,
      sender: "user",
      message: text,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setChat((prev) => [...prev, optimisticMsg]);
    setMessage("");
    scrollToBottom("smooth");
    setSending(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ laporan_id: parseInt(id), sender: "user", message: text }),
      });
      if (res.ok) {
        setChat((prev) => prev.filter((msg) => msg.id !== tempId));
        await fetchChat();
      } else {
        setChat((prev) => prev.filter((msg) => msg.id !== tempId));
        let errorMsg = "Gagal mengirim pesan";
        try { const errData = await res.json(); errorMsg = errData.msg || errorMsg; } catch (_) {}
        alert(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setChat((prev) => prev.filter((msg) => msg.id !== tempId));
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageContent = (msg) => {
    if (msg && msg.startsWith("data:image")) {
      return (
        <div className="mt-1">
          <img
            src={msg}
            alt="gambar chat"
            className="max-w-[140px] max-h-[140px] rounded-lg cursor-pointer border border-gray-200 shadow-sm hover:opacity-90 transition"
            onClick={() => setPreviewImage(msg)}
          />
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <FaImage size={8} /> Klik
          </div>
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{msg}</p>;
  };

  useEffect(() => {
    if (!id) return;
    if (laporan && laporan.status !== "diproses") {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      return;
    }
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(() => { fetchChat(); }, 2000);
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [id, laporan?.status]);

  useEffect(() => {
    if (id) { fetchDetail(); fetchChat(); }
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
          <p className="text-red-600 font-medium">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaTimesCircle className="text-gray-400 text-3xl" />
          </div>
          <p className="text-gray-500 font-medium">Data laporan tidak ditemukan</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition">Kembali</button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: "Menunggu", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: <FaClock className="text-amber-500" />, description: "Laporan Anda sedang menunggu untuk diproses oleh admin." },
    diproses: { label: "Diproses", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: <FaSpinner className="animate-spin text-blue-500" />, description: "Admin sedang menangani laporan Anda. Anda dapat mengirim pesan sekarang." },
    selesai: { label: "Selesai", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: <FaCheckCircle className="text-green-500" />, description: "Laporan telah selesai ditangani. Chat ditutup." },
    ditolak: { label: "Ditolak", bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: <FaTimesCircle className="text-red-500" />, description: "Laporan tidak dapat diproses. Chat ditutup." },
  };

  const status = statusConfig[laporan.status];
  const isChatActive = laporan.status === "diproses";
  const imageUrl = !imageError && laporan?.foto ? `http://localhost:5000/uploads/${laporan.foto}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 py-6 px-3 md:px-6">
      <div className="max-w-6xl mx-auto"> {/* Lebar maksimum diperkecil dari 7xl ke 6xl */}
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium">
            <FaArrowLeft className="text-xs" /> <span>Kembali</span>
          </button>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="text-[11px] text-gray-400">ID Laporan</span>
            <span className="text-xs font-mono font-semibold text-gray-700">#{id}</span>
          </div>
        </div>

        {/* Grid dengan gap lebih kecil */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT CARD */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            <div className="relative h-48 sm:h-52 bg-gradient-to-br from-gray-100 to-gray-200">
              {imageUrl ? (
                <img src={imageUrl} alt={laporan.judul} className="w-full h-full object-cover" onError={() => setImageError(true)} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <FaImage className="text-4xl mb-1 opacity-40" />
                  <span className="text-xs">Tidak ada gambar awal</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-md ${status.bg} ${status.text} border ${status.border} backdrop-blur-sm`}>
                  {status.icon} {status.label}
                </div>
              </div>
            </div>

            <div className="p-4 flex-grow">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">{laporan.judul}</h1>
              <p className="text-gray-600 mt-2 leading-relaxed text-sm">{laporan.deskripsi}</p>

              <div className="mt-4 space-y-2">
                <InfoRow icon={<FaUserCircle />} label="Pelapor" value={laporan.nama_user || "Pengguna"} />
                <InfoRow icon={<FaTag />} label="Kategori" value={laporan.kategori || "Tidak ada"} />
                <div className="flex items-start gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
                  <div className="w-7 h-7 bg-red-200 rounded-full flex items-center justify-center text-red-700 flex-shrink-0">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Alamat Lengkap</p>
                    <p className="font-medium text-gray-800 break-words text-xs mt-0.5">
                      {laporan.alamat ? laporan.alamat : "Tidak tersedia"}
                    </p>
                  </div>
                </div>
                <InfoRow icon={<FaCalendarAlt />} label="Dibuat pada" value={new Date(laporan.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
              </div>

              <div className="mt-4 p-3 bg-red-50/60 rounded-lg border border-red-100">
                <div className="flex gap-2 text-red-700 text-xs"><FaInfoCircle className="mt-0.5 flex-shrink-0" /> <p>{status.description}</p></div>
              </div>

              {adminImages.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-red-100 rounded-lg"><FaImages className="text-red-600 text-sm" /></div>
                    <div><h3 className="font-bold text-gray-800 text-sm">📸 Bukti Penanganan</h3><p className="text-[10px] text-gray-500">Foto setelah ditangani admin</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {adminImages.map((img, idx) => (
                      <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-square" onClick={() => setPreviewImage(img)}>
                        <img src={img} alt={`Bukti after ${idx+1}`} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><FaExpand className="text-white text-sm" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CARD - Chat */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><FaHeadset className="text-white text-base" /></div>
                <div><h2 className="font-bold text-white text-md">Pusat Bantuan</h2><p className="text-[10px] text-red-100">{!isChatActive ? "Chat hanya saat Diproses" : "Admin akan merespon"}</p></div>
              </div>
              {isChatActive && <button onClick={fetchChat} className="text-white/80 hover:text-white transition p-1 rounded-full hover:bg-white/10"><FaRedoAlt className="text-xs" /></button>}
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scroll-smooth" style={{ minHeight: "280px", maxHeight: "calc(100vh - 240px)" }}>
              {chatLoading ? (
                <div className="flex justify-center items-center h-full"><div className="w-5 h-5 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div><p className="text-[11px] text-gray-400 ml-2">Memuat...</p></div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-3 border-red-500 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 mb-1"><FaClipboardList className="text-red-500 text-xs" /><span>Info Laporan</span></div>
                    <div className="text-xs text-gray-700 space-y-0.5">
                      <p><strong>📋 Judul:</strong> {laporan.judul.substring(0, 40)}{laporan.judul.length > 40 ? '...' : ''}</p>
                      <p><strong>📍 Alamat:</strong> {laporan.alamat ? laporan.alamat.substring(0, 50) + (laporan.alamat.length > 50 ? '...' : '') : "Tidak ada"}</p>
                      <p><strong>🔖 Kategori:</strong> {laporan.kategori}</p>
                      <p><strong>⏳ Status:</strong> <span className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>{status.icon} {status.label}</span></p>
                    </div>
                  </div>

                  {chat.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2"><FaClipboardList className="text-gray-300 text-xl" /></div><p className="text-gray-400 text-xs">{isChatActive ? "Belum ada pesan. Kirim pesan!" : "Chat akan tersedia saat laporan diproses."}</p></div>
                  ) : (
                    chat.map((c, idx) => {
                      const isUser = c.sender === "user";
                      return (
                        <div key={c.id ?? idx} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}>
                          <div className={`max-w-[85%]`}>
                            <div className={`px-3 py-2 rounded-xl shadow-sm text-sm ${isUser ? "bg-red-600 text-white rounded-br-none" : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"}`}>
                              {!isUser && <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium mb-0.5"><FaUser className="text-[8px]" /><span>Admin</span></div>}
                              {renderMessageContent(c.message)}
                              <div className={`text-[9px] mt-1 ${isUser ? "text-red-200" : "text-gray-400"} text-right`}>
                                {formatMessageTime(c.created_at)} {c.pending && <FaSpinner className="animate-spin inline ml-1 text-[8px]" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>

            {!isChatActive ? (
              <div className="p-3 border-t bg-gray-50">
                <div className="bg-gray-100 rounded-lg p-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                  {laporan.status === "pending" && <><FaClock className="text-amber-500 text-[10px]" /> Chat setelah laporan diproses</>}
                  {laporan.status === "selesai" && <><FaCheckCircle className="text-green-500 text-[10px]" /> Chat ditutup</>}
                  {laporan.status === "ditolak" && <><FaTimesCircle className="text-red-400 text-[10px]" /> Chat tidak tersedia</>}
                </div>
              </div>
            ) : (
              <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="Tulis pesan..." disabled={sending} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-red-300 outline-none disabled:bg-gray-50" />
                  <button onClick={sendMessage} disabled={!message.trim() || sending} className={`px-4 py-2 rounded-lg transition flex items-center gap-1 text-sm ${!message.trim() || sending ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white shadow"}`}>
                    {sending ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5 text-center">Admin akan membalas sesegera mungkin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg" alt="preview" />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.15s ease-out forwards; }
        .scroll-smooth { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
      <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-gray-800 break-words text-xs mt-0.5">{value}</p>
      </div>
    </div>
  );
}