"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import {
  FaPaperPlane,
  FaUserCircle,
  FaCheckCircle,
  FaClock,
  FaFolderOpen,
  FaImage,
  FaRegCommentDots,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

export default function UserChatPage() {
  const params = useParams();
  const laporanId = params.id;

  const [laporan, setLaporan] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Fetch data awal dan interval
  useEffect(() => {
    if (!laporanId) return;
    const fetchData = async () => {
      await Promise.all([getLaporan(), getChat()]);
    };
    fetchData();
    const interval = setInterval(() => {
      getLaporan();
      getChat();
    }, 3000);
    return () => clearInterval(interval);
  }, [laporanId]);

  const getLaporan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/laporan/${laporanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLaporan(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getChat = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/${laporanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChat(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setChat([]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
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
          laporan_id: parseInt(laporanId),
          sender: "user",
          message,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChat((prev) => [...prev, data]);
        setMessage("");
      } else {
        alert(data.msg || "Gagal mengirim");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const statusConfig = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 border-amber-200" },
    diproses: { label: "Diproses", color: "bg-blue-100 text-blue-700 border-blue-200" },
    selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
  const currentStatus = statusConfig[laporan?.status] || statusConfig.pending;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <FaSpinner className="animate-spin text-red-600 text-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-5 py-3 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaRegCommentDots className="text-red-600 text-xl" />
            <div>
              <h1 className="font-bold text-gray-800">Pusat Bantuan</h1>
              <p className="text-xs text-gray-500">Admin akan merespon pesan Anda</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
            {currentStatus.label}
          </div>
        </div>

        {/* === KOTAK INFORMASI LAPORAN (CHAT AWALAN) === */}
        <div className="p-5 pb-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-white px-4 py-2 border-b border-red-100">
              <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <FaInfoCircle /> Detail Laporan
              </h2>
            </div>
            <div className="p-4">
              <div className="flex gap-4">
                {laporan?.foto ? (
                  <img
                    src={`http://localhost:5000/uploads/${laporan.foto}`}
                    className="w-20 h-20 rounded-lg object-cover border"
                    onError={(e) => (e.target.src = "https://placehold.co/80x80?text=No+Img")}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FaImage className="text-gray-400 text-3xl" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{laporan?.judul || "Laporan"}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{laporan?.deskripsi}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaFolderOpen size={10} /> {laporan?.kategori || "Umum"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock size={10} />{" "}
                      {laporan?.created_at
                        ? new Date(laporan.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Area chat dengan pesan awal jika kosong */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                <FaRegCommentDots className="text-red-400 text-2xl" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada pesan</p>
              <p className="text-gray-400 text-sm">Kirim pesan pertama untuk memulai diskusi</p>
            </div>
          ) : (
            chat.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[75%]">
                  {item.sender !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <FaUserCircle className="text-red-500 text-xl" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                      item.sender === "user"
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{item.message}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        item.sender === "user" ? "text-red-200" : "text-gray-400"
                      }`}
                    >
                      {item.created_at
                        ? new Date(item.created_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  {item.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                      <FaUserCircle className="text-white text-xl" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input form */}
        {laporan?.status !== "selesai" ? (
          <div className="bg-white border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Tulis pesan Anda..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Kirim
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Admin akan membalas pesan Anda sesegera mungkin
            </p>
          </div>
        ) : (
          <div className="bg-white border-t p-4 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-2">
              <FaCheckCircle /> Laporan selesai, chat ditutup
            </div>
          </div>
        )}
      </div>
    </div>
  );
}