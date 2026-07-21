"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaTimes,
  FaClipboardList,
  FaCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaArrowRight,
  FaIdCard,
  FaHistory,
  FaMapMarkerAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingLaporan, setLoadingLaporan] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);

  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    foto: null,
  });

  const [form, setForm] = useState({
    nama: "",
    email: "",
  });

  const [laporan, setLaporan] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getFoto = (foto) => {
    if (!foto) return "https://placehold.co/200x200?text=User";
    if (foto.startsWith("http")) return foto;
    return `${BASE_URL}/uploads/${foto}`;
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchLaporan();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          nama: data.nama || "",
          email: data.email || "",
          foto: data.foto || null,
        });
        setForm({
          nama: data.nama || "",
          email: data.email || "",
        });
      } else {
        setMessage({ text: data.msg || "Gagal load profile", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchLaporan = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLaporan(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLaporan(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({ ...prev, ...form }));
        setEditing(false);
        setMessage({ text: "Profil berhasil diperbarui", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: data.msg || "Gagal update", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  const uploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "File harus berupa gambar", type: "error" });
      return;
    }
    const previewURL = URL.createObjectURL(file);
    setPreviewFoto(previewURL);
    const formData = new FormData();
    formData.append("foto", file);
    setUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/upload-foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Upload gagal");
      const fotoBaru = data.foto || data.user?.foto || null;
      setProfile((prev) => ({ ...prev, foto: fotoBaru }));
      const oldUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...oldUser, foto: fotoBaru }));
      setPreviewFoto(null);
      setMessage({ text: "Foto profil berhasil diperbarui", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: err.message || "Upload gagal", type: "error" });
      setPreviewFoto(null);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", icon: <FaClock />, color: "bg-amber-100 text-amber-700" };
      case "diproses":
        return { label: "Diproses", icon: <FaSpinner className="animate-spin" />, color: "bg-blue-100 text-blue-700" };
      case "selesai":
        return { label: "Selesai", icon: <FaCheckCircle />, color: "bg-green-100 text-green-700" };
      case "ditolak":
        return { label: "Ditolak", icon: <FaExclamationTriangle />, color: "bg-red-100 text-red-700" };
      default:
        return { label: status, icon: <FaClock />, color: "bg-gray-100 text-gray-600" };
    }
  };

  const total = laporan.length;
  const selesai = laporan.filter(l => l.status === "selesai").length;
  const pending = laporan.filter(l => l.status === "pending").length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-red-700 font-medium">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Profil <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Saya</span>
          </h1>
          <p className="text-gray-500 mt-1">Kelola informasi akun dan lihat riwayat laporan Anda</p>
        </div>

        {/* Notifikasi */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm animate-slideInRight shadow-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border-l-4 border-green-500" 
              : "bg-red-50 text-red-600 border-l-4 border-red-500"
          }`}>
            {message.type === "success" ? <FaCheckCircle /> : <FaTimes />} {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Kolom Kiri - Kartu Profil dengan Foto Besar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FaIdCard className="text-white" /> Informasi Akun
                </h3>
              </div>
              <div className="p-6 text-center">
                <div className="relative inline-block group">
                  {/* Ukuran foto diperbesar: w-56 h-56 (sebelumnya w-40) */}
                  <div className="w-56 h-56 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden shadow-xl border-4 border-white ring-2 ring-red-200 transition-transform duration-300 group-hover:scale-105">
                    {previewFoto || profile.foto ? (
                      <img
                        src={previewFoto || getFoto(profile.foto)}
                        className="w-full h-full object-cover"
                        alt="foto profil"
                        onError={(e) => (e.target.src = "https://placehold.co/200x200?text=User")}
                      />
                    ) : (
                      <FaUser className="text-7xl text-red-400" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                    {uploading ? (
                      <FaSpinner size={16} className="animate-spin" />
                    ) : (
                      <FaCamera size={16} />
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={uploadFoto} disabled={uploading} />
                  </label>
                </div>
                <h2 className="mt-5 text-2xl font-bold text-gray-800">{profile.nama || "Pengguna"}</h2>
                <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
                  <FaEnvelope size={12} /> {profile.email}
                </p>
                
                {/* Statistik ringkas */}
                <div className="mt-6 grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selesai}</p>
                    <p className="text-xs text-gray-500">Selesai</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-6 w-full bg-white border-2 border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md group"
                >
                  <FaSignOutAlt className="group-hover:scale-110 transition" /> Keluar Akun
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Edit Profil & Riwayat Laporan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Edit Profil (tanpa nomor telepon) */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaUser className="text-red-500" /> Detail Profil
                </h2>
                {!editing && (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setForm({ nama: profile.nama, email: profile.email });
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-all hover:gap-2"
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                )}
              </div>
              <div className="p-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <FaUser />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Nama Lengkap</p>
                        <p className="text-gray-800 font-medium">{profile.nama}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <FaEnvelope />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Alamat Email</p>
                        <p className="text-gray-800 font-medium">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={updateProfile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={form.nama}
                        onChange={e => setForm({ ...form, nama: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none transition"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:scale-105"
                      >
                        <FaSave /> Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="border-2 border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Card Riwayat Laporan */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaHistory className="text-red-500" /> Riwayat Laporan Saya
                </h2>
              </div>
              <div className="p-6">
                {loadingLaporan ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : laporan.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaClipboardList className="text-6xl mx-auto mb-3 opacity-40" />
                    <p className="text-lg">Belum ada laporan</p>
                    <button
                      onClick={() => router.push("/dashboard/add-laporan")}
                      className="mt-4 text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 mx-auto transition-all hover:gap-2"
                    >
                      Buat Laporan Sekarang <FaArrowRight size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {[...laporan].reverse().map((item) => {
                      const status = getStatusBadge(item.status);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-red-50 transition-all duration-300 border border-gray-100 group cursor-pointer"
                          onClick={() => router.push(`/dashboard/detail-laporan/${item.id}`)}
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-red-100">
                            <img
                              src={item.foto ? `${BASE_URL}/uploads/${item.foto}` : "https://placehold.co/64x64?text=No+Img"}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              alt=""
                              onError={(e) => (e.target.src = "https://placehold.co/64x64?text=No+Img")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-red-600 transition">
                                {item.judul || "Laporan"}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-1">{item.deskripsi || "Tidak ada deskripsi"}</p>
                            {item.alamat && (
                              <div className="flex items-start gap-1 mt-1 text-gray-400 text-xs">
                                <FaMapMarkerAlt className="flex-shrink-0 mt-0.5 text-red-400" size={10} />
                                <span className="line-clamp-1">{item.alamat}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-gray-400 text-xs">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt size={10} /> {new Date(item.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <FaArrowRight className="text-red-400 group-hover:text-red-600 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
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
          background: #e05a5a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c03939;
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