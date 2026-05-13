"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/sidebar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
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
  FaImage,
  FaArrowRight,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingLaporan, setLoadingLaporan] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    no_telepon: "",
    foto: null,
  });

  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_telepon: "",
  });

  const [laporan, setLaporan] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchLaporan();
  }, []);

  // Fetch profil user
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          nama: data.nama || data.name || data.user?.nama || "",
          email: data.email || data.user?.email || "",
          no_telepon: data.no_telepon || data.phone || "",
          foto: data.foto || data.user?.foto || null,
        });
        setForm({
          nama: data.nama || data.name || "",
          email: data.email || "",
          no_telepon: data.no_telepon || "",
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

  // Fetch riwayat laporan user
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

  // Update profil
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

  // Upload foto profil
  const uploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("foto", file);
    setUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/upload-foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({ ...prev, foto: data.foto }));
        setMessage({ text: "Foto berhasil diupdate", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: data.msg || "Upload gagal", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error upload", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", icon: <FaClock />, color: "bg-amber-100 text-amber-700", border: "border-amber-200" };
      case "diproses":
        return { label: "Diproses", icon: <FaSpinner className="animate-spin" />, color: "bg-blue-100 text-blue-700", border: "border-blue-200" };
      case "selesai":
        return { label: "Selesai", icon: <FaCheckCircle />, color: "bg-green-100 text-green-700", border: "border-green-200" };
      case "ditolak":
        return { label: "Ditolak", icon: <FaExclamationTriangle />, color: "bg-red-100 text-red-700", border: "border-red-200" };
      default:
        return { label: status, icon: <FaClock />, color: "bg-gray-100 text-gray-600", border: "border-gray-200" };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profil<span className="text-red-600"> Saya</span></h1>
          <p className="text-gray-400 mt-1">Kelola informasi akun dan lihat riwayat laporan Anda</p>
        </div>

        {/* Notifikasi */}
        {message.text && (
          <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border-l-4 border-green-500" : "bg-red-50 text-red-600 border-l-4 border-red-500"}`}>
            {message.type === "success" ? <FaCheckCircle /> : <FaTimes />} {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Kiri: Avatar + Info Ringkas + Logout */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center">
              <div className="relative inline-block">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {profile.foto ? (
                    <img src={`${BASE_URL}/uploads/${profile.foto}`} className="w-full h-full object-cover" alt="foto" onError={(e) => e.target.src = "https://placehold.co/112x112?text=Error"} />
                  ) : (
                    <FaUser className="text-5xl text-red-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
                  <FaCamera size={12} />
                  <input type="file" className="hidden" accept="image/*" onChange={uploadFoto} disabled={uploading} />
                </label>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">{profile.nama || "Pengguna"}</h2>
              <p className="text-gray-400 text-sm">{profile.email}</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{laporan.length}</p>
                  <p className="text-xs text-gray-400">Total Laporan</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{laporan.filter(l => l.status === "selesai").length}</p>
                  <p className="text-xs text-gray-400">Selesai</p>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full bg-white border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm">
              <FaSignOutAlt /> Keluar Akun
            </button>
          </div>

          {/* Kanan: Edit Profil + Riwayat Laporan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Edit Profil */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2"><FaUser className="text-red-500" /> Informasi Akun</h2>
                {!editing && (
                  <button onClick={() => { setEditing(true); setForm({ nama: profile.nama, email: profile.email, no_telepon: profile.no_telepon || "" }); }} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                    <FaEdit size={12} /> Edit
                  </button>
                )}
              </div>
              <div className="p-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3"><FaUser className="text-gray-400 w-5" /><span className="text-gray-700">{profile.nama}</span></div>
                    <div className="flex items-center gap-3"><FaEnvelope className="text-gray-400 w-5" /><span className="text-gray-700">{profile.email}</span></div>
                    <div className="flex items-center gap-3"><FaPhone className="text-gray-400 w-5" /><span className="text-gray-700">{profile.no_telepon || "Belum diisi"}</span></div>
                  </div>
                ) : (
                  <form onSubmit={updateProfile} className="space-y-4">
                    <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300" placeholder="Nama" required />
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300" placeholder="Email" required />
                    <input type="tel" value={form.no_telepon} onChange={e => setForm({...form, no_telepon: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300" placeholder="No. Telepon" />
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"><FaSave /> Simpan</button>
                      <button type="button" onClick={() => setEditing(false)} className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition">Batal</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Card Riwayat Laporan */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2"><FaClipboardList className="text-red-500" /> Riwayat Laporan Saya</h2>
              </div>
              <div className="p-6">
                {loadingLaporan ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div></div>
                ) : laporan.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FaClipboardList className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Belum ada laporan yang dibuat</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {[...laporan].reverse().map((item) => {
                      const status = getStatusBadge(item.status);
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.foto ? `${BASE_URL}/uploads/${item.foto}` : "https://placehold.co/56x56?text=No+Img"}
                              className="w-full h-full object-cover"
                              alt=""
                              onError={(e) => e.target.src = "https://placehold.co/56x56?text=No+Img"}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-gray-800">{item.judul || "Laporan"}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.border}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">{item.deskripsi || "Tidak ada deskripsi"}</p>
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><FaCalendarAlt size={10} /> {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                          <button onClick={() => router.push(`/dashboard/detail-laporan/${item.id}`)} className="text-red-500 hover:text-red-700 transition">
                            <FaArrowRight />
                          </button>
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
    </div>
  );
}