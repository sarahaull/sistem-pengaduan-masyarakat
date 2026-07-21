"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaUserCircle,
  FaIdCard,
  FaShieldAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function AdminProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    role: "",
    foto: null,
    created_at: "",
  });

  const [form, setForm] = useState({
    nama: "",
    email: "",
  });

  const [password, setPassword] = useState({
    current: "",
    baru: "",
    konfirmasi: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Gagal ambil profile");
        setProfile(data);
        setForm({
          nama: data.nama || "",
          email: data.email || "",
        });
      } catch (err) {
        setMessage({ text: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal update profile");
      setProfile((prev) => ({ ...prev, ...form }));
      setEditing(false);
      setMessage({ text: "Profile berhasil diupdate", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (password.baru !== password.konfirmasi) {
      return setMessage({ text: "Password baru tidak cocok", type: "error" });
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.baru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal ganti password");
      setPassword({ current: "", baru: "", konfirmasi: "" });
      setShowPassword(false);
      setMessage({ text: "Password berhasil diubah", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
  
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header dengan efek gradien merah */}
          <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-red-900 rounded-2xl shadow-2xl p-6 mb-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <FaUserCircle className="text-4xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Profil Admin</h1>
                  <p className="text-red-100 text-sm mt-1">Kelola informasi akun dan keamanan Anda</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-200 font-medium border border-white/20"
              >
                <FaSignOutAlt size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                : "bg-red-50 border-l-4 border-red-500 text-red-700"
            }`}>
              {message.type === "success" ? <FaCheckCircle className="text-green-500" /> : <FaTimes className="text-red-500" />}
              <span className="flex-1">{message.text}</span>
              <button onClick={() => setMessage({ text: "", type: "" })} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card Kiri - Didesain lebih mewah */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 sticky top-6 transition-all hover:shadow-2xl">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                  <div className="relative">
                    <div className="relative inline-block group">
                      <div className="w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        {profile.foto ? (
                          <img src={`${BASE_URL}/uploads/${profile.foto}`} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <FaUser className="text-5xl text-white" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-transform hover:scale-110">
                        <FaCamera className="text-red-600 text-sm" />
                      </button>
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-white">{profile.nama}</h2>
                    <p className="text-red-100 text-sm">{profile.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white backdrop-blur-sm">
                      {profile.role === "super_admin" ? "Super Admin" : profile.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 p-2 rounded-xl hover:bg-red-50 transition">
                    <FaEnvelope className="text-red-500 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 p-2 rounded-xl hover:bg-red-50 transition">
                    <FaIdCard className="text-red-500 w-4" />
                    <span className="text-sm">ID: {profile.id || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 p-2 rounded-xl hover:bg-red-50 transition">
                    <FaShieldAlt className="text-red-500 w-4" />
                    <span className="text-sm">Akses Penuh ke Dashboard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Kanan */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informasi Akun */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden transition-all hover:shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaEdit className="text-red-500" /> Informasi Akun
                  </h2>
                  <p className="text-sm text-gray-500">Perbarui data diri Anda</p>
                </div>
                <form onSubmit={updateProfile} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all bg-gray-50/30">
                      <FaUser className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        className="w-full outline-none bg-transparent text-black"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all bg-gray-50/30">
                      <FaEnvelope className="text-gray-400 mr-3" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full outline-none bg-transparent text-black"
                        placeholder="Masukkan email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FaSave /> Simpan Perubahan
                  </button>
                </form>
              </div>

              {/* Ganti Password */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden transition-all hover:shadow-2xl">
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaLock className="text-red-500" /> Keamanan Akun
                  </h2>
                  <p className="text-sm text-gray-500">Ubah password untuk menjaga keamanan</p>
                </div>
                <div className="p-6">
                  {!showPassword ? (
                    <button
                      onClick={() => setShowPassword(true)}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-all hover:gap-3"
                    >
                      <FaLock /> Ganti Password
                    </button>
                  ) : (
                    <form onSubmit={changePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
                        <input
                          type="password"
                          placeholder="Masukkan password lama"
                          value={password.current}
                          onChange={(e) => setPassword({ ...password, current: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                        <input
                          type="password"
                          placeholder="Masukkan password baru"
                          value={password.baru}
                          onChange={(e) => setPassword({ ...password, baru: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          placeholder="Konfirmasi password baru"
                          value={password.konfirmasi}
                          onChange={(e) => setPassword({ ...password, konfirmasi: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/30"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                          Ubah Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPassword(false);
                            setPassword({ current: "", baru: "", konfirmasi: "" });
                          }}
                          className="border border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Informasi Tambahan - Hak Akses */}
              <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl shadow-md border border-red-100 p-6">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaShieldAlt className="text-red-500" /> Hak Akses
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Anda memiliki akses penuh sebagai <strong className="text-red-600">{profile.role === "super_admin" ? "Super Administrator" : "Administrator"}</strong>.
                  Anda dapat mengelola semua laporan, melihat statistik, dan mengubah pengaturan sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}