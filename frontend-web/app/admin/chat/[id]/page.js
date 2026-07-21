"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import { FaClipboardList, FaMapMarkerAlt, FaExternalLinkAlt, FaPaperclip, FaTimes, FaImage, FaExpand } from "react-icons/fa";

export default function AdminChatPage() {
  const { id } = useParams();

  const [laporan, setLaporan] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("diproses");
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [systemMessage, setSystemMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // untuk modal preview gambar dari chat
  const fileInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const scrollChatToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [chat]);

  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log(text);
      return null;
    }
  };

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

  useEffect(() => {
    if (laporan && !systemMessage) {
      const statusLabel =
        laporan.status === "pending"
          ? "Menunggu"
          : laporan.status === "diproses"
          ? "Diproses"
          : laporan.status === "selesai"
          ? "Selesai"
          : "Ditolak";

      const deskripsiSingkat =
        laporan.deskripsi.length > 150
          ? laporan.deskripsi.substring(0, 150) + "..."
          : laporan.deskripsi;

      setSystemMessage({
        id: `system-${id}`,
        judul: laporan.judul,
        deskripsi: deskripsiSingkat,
        kategori: laporan.kategori,
        status: statusLabel,
        alamat: laporan.alamat,
        latitude: laporan.latitude,
        longitude: laporan.longitude,
        created_at: new Date().toISOString(),
      });
    }
  }, [laporan, id, systemMessage]);

  const sendMessage = async (textMessage) => {
    if (!textMessage.trim()) return;
    if (status === "selesai") return;

    setSending(true);
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
          message: textMessage,
        }),
      });
      getChat();
    } catch (err) {
      console.log(err);
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const compressAndConvertToBase64 = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSendImage = async () => {
    if (!selectedImage) return;
    if (status === "selesai") {
      alert("Chat sudah ditutup, tidak bisa mengirim gambar");
      return;
    }

    setSending(true);
    try {
      const base64 = await compressAndConvertToBase64(selectedImage, 800, 0.6);
      await sendMessage(base64);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar");
    } finally {
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB");
      return;
    }
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const cancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !sending && status !== "selesai" && !selectedImage) {
      sendMessage(message);
      setMessage("");
    }
  };

  const markSelesai = async () => {
    if (status === "selesai") return;
    const confirmClose = window.confirm(
      "Apakah Anda yakin ingin menandai pengaduan ini selesai?\nChat akan ditutup dan pengguna tidak bisa membalas lagi."
    );
    if (!confirmClose) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/laporan/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "selesai" }),
      });
      await getLaporan();
      setStatus("selesai");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.log(err);
      alert("Gagal mengubah status, coba lagi.");
    }
  };

  const getImage = () =>
    laporan?.foto
      ? `http://localhost:5000/uploads/${laporan.foto}`
      : "https://via.placeholder.com/400x200?text=Tidak+Ada+Foto";

  const getGoogleMapsLink = () => {
    if (laporan?.latitude && laporan?.longitude) {
      return `https://www.google.com/maps?q=${laporan.latitude},${laporan.longitude}`;
    }
    if (laporan?.alamat) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(laporan.alamat)}`;
    }
    return null;
  };

  // Render pesan dengan gambar yang bisa diklik untuk modal preview
  const renderMessage = (msg) => {
    if (msg && msg.startsWith("data:image")) {
      return (
        <div className="mt-1">
          <img
            src={msg}
            alt="gambar chat"
            className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer border border-gray-200 shadow-sm hover:opacity-90 transition"
            onClick={() => setPreviewImage(msg)}
          />
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <FaImage size={8} /> Klik untuk memperbesar
          </div>
        </div>
      );
    }
    return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg}</p>;
  };

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
  const wargaName = laporan?.nama_user || "Warga";

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
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

        {/* Konten utama */}
        <div className="flex-1 overflow-hidden p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Detail Laporan Card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-y-auto transition-all hover:shadow-lg">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 text-white sticky top-0">
                <h2 className="font-bold text-xl flex items-center gap-2">📋 Detail Pengaduan</h2>
                <p className="text-xs opacity-90 mt-1">Informasi lengkap dari warga</p>
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
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Judul Laporan</p>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight mt-1">{laporan?.judul}</h3>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Deskripsi</p>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-1">
                      <p className="text-sm text-gray-700 leading-relaxed">{laporan?.deskripsi}</p>
                    </div>
                  </div>

                  {(laporan?.alamat || laporan?.latitude) && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <FaMapMarkerAlt className="text-red-500" /> Lokasi Kejadian
                      </p>
                      <div className="mt-2 bg-red-50/50 p-3 rounded-xl border border-red-100">
                        {laporan?.alamat && (
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">📍 {laporan.alamat}</p>
                        )}
                        {laporan?.latitude && laporan?.longitude && (
                          <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                            <span>🗺️ Koordinat: {parseFloat(laporan.latitude).toFixed(6)}, {parseFloat(laporan.longitude).toFixed(6)}</span>
                            {getGoogleMapsLink() && (
                              <a
                                href={getGoogleMapsLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition"
                              >
                                <FaExternalLinkAlt size={10} /> Lihat di Peta
                              </a>
                            )}
                          </div>
                        )}
                        {!laporan?.latitude && !laporan?.longitude && laporan?.alamat && (
                          <div className="text-xs text-gray-400 mt-1">ℹ️ Koordinat tidak tersedia, hanya alamat teks.</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-400">👤 Pengirim</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{laporan?.nama_user || "Unknown User"}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-400">📅 Tanggal</p>
                      <p className="font-medium text-gray-700 mt-0.5">
                        {laporan?.created_at
                          ? new Date(laporan.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
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
                  {isClosed ? "✅ Selesai" : "✔ Tandai Selesai"}
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col h-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-red-500">💬</span> Percakapan Live
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isClosed ? "Percakapan ditutup (laporan selesai)" : "Admin ↔ Warga"}
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

              <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FAFB] scroll-smooth">
                {systemMessage && (
                  <div className="flex justify-center my-2">
                    <div className="max-w-[90%] md:max-w-[70%] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-sm px-5 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-500 mb-2 pb-1 border-b border-gray-200">
                        <FaClipboardList className="text-red-400" />
                        <span>Informasi Laporan</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        📋 <strong>{systemMessage.judul}</strong><br />
                        📝 {systemMessage.deskripsi}<br />
                        🔖 <strong>Kategori:</strong> {systemMessage.kategori}<br />
                        ⏳ <strong>Status:</strong> {systemMessage.status}<br />
                        {systemMessage.alamat && <>📍 <strong>Alamat:</strong> {systemMessage.alamat}<br /></>}
                        {systemMessage.latitude && systemMessage.longitude && (
                          <>🗺️ <strong>Koordinat:</strong> {parseFloat(systemMessage.latitude).toFixed(6)}, {parseFloat(systemMessage.longitude).toFixed(6)}<br /></>
                        )}
                        <br />💬 Silakan mulai percakapan dengan warga.
                      </p>
                      <div className="text-[10px] text-gray-400 text-right mt-2">
                        {new Date(systemMessage.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                )}

                {chat.length === 0 && !systemMessage && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-3">💬</div>
                    <p className="text-gray-400 font-medium">Belum ada pesan</p>
                    <p className="text-xs text-gray-300 mt-1">Kirim pesan pertama ke warga</p>
                  </div>
                )}

                {chat.map((c, i) => {
                  const isAdmin = c.sender === "admin";
                  const senderName = isAdmin ? "Admin" : wargaName;
                  return (
                    <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-200`}>
                      <div className={`max-w-[80%] rounded-2xl px-5 py-2.5 shadow-sm ${isAdmin ? "bg-gradient-to-r from-red-600 to-red-500 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                        <div className={`text-[10px] font-semibold mb-1 ${isAdmin ? "text-red-100" : "text-red-500"}`}>{senderName}</div>
                        {renderMessage(c.message)}
                        <div className={`text-[10px] mt-1 ${isAdmin ? "text-red-100 text-right" : "text-gray-400"}`}>
                          {new Date(c.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                {isClosed ? (
                  <div className="bg-gray-100 rounded-xl p-3 text-center text-gray-500 text-sm">🔒 Chat ditutup karena pengaduan sudah selesai</div>
                ) : (
                  <>
                    {imagePreview && (
                      <div className="mb-3 relative inline-block">
                        <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300 shadow-sm" />
                        <button onClick={cancelImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700">
                          <FaTimes size={10} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Tulis pesan..."
                          disabled={sending || !!selectedImage}
                          className="w-full border border-gray-200 rounded-full text-black px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-all bg-gray-50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✨</div>
                      </div>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                      <button onClick={() => fileInputRef.current.click()} disabled={sending} className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition shadow-sm disabled:opacity-50" title="Kirim gambar">
                        <FaPaperclip size={18} />
                      </button>
                      {selectedImage ? (
                        <button onClick={handleSendImage} disabled={sending} className="rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md transition">
                          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaImage size={18} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => { sendMessage(message); setMessage(""); }}
                          disabled={sending || !message.trim()}
                          className={`rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-md ${sending || !message.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white hover:shadow-lg"}`}
                        >
                          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-all duration-200 shadow-lg">
              <FaTimes size={20} />
            </button>
            <img src={previewImage} alt="Preview gambar" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}