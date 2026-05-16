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
    no_telepon: "",
    role: "",
    foto: null,
  });

  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_telepon: "",
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
          no_telepon: data.no_telepon || "",
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
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar handleLogout={handleLogout} />
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <AdminSidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-xl shadow-md">
                <FaUserCircle className="text-white text-2xl" />
              </div>
              <span>Profil <span className="text-red-600">Admin</span></span>
            </h1>
            <p className="text-gray-500 mt-1 ml-1">Kelola informasi akun dan keamanan Anda</p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
              message.type === "success"
                ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                : "bg-red-50 border-l-4 border-red-500 text-red-700"
            }`}>
              {message.type === "success" ? <FaCheckCircle className="text-green-500" /> : <FaTimes className="text-red-500" />}
              <span>{message.text}</span>
              <button onClick={() => setMessage({ text: "", type: "" })} className="ml-auto text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card Kiri */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 sticky top-6">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-lg">
                      {profile.foto ? (
                        <img src={`${BASE_URL}/uploads/${profile.foto}`} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <FaUser className="text-5xl text-white" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition">
                      <FaCamera className="text-red-600 text-sm" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">{profile.nama}</h2>
                  <p className="text-red-100 text-sm">{profile.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                    {profile.role === "super_admin" ? "Super Admin" : profile.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaEnvelope className="text-red-500 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="text-red-500 w-4" />
                    <span className="text-sm">{profile.no_telepon || "Belum diisi"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaIdCard className="text-red-500 w-4" />
                    <span className="text-sm">ID: {profile.id || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Kanan */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informasi Akun */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaEdit className="text-red-500" /> Informasi Akun
                  </h2>
                  <p className="text-sm text-gray-500">Perbarui data diri Anda</p>
                </div>
                <form onSubmit={updateProfile} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition">
                      <FaUser className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        className="w-full outline-none bg-transparent"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition">
                      <FaEnvelope className="text-gray-400 mr-3" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full outline-none bg-transparent"
                        placeholder="Masukkan email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition">
                      <FaPhone className="text-gray-400 mr-3" />
                      <input
                        type="tel"
                        value={form.no_telepon}
                        onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
                        className="w-full outline-none bg-transparent"
                        placeholder="Masukkan nomor HP"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg"
                  >
                    <FaSave /> Simpan Perubahan
                  </button>
                </form>
              </div>

              {/* Ganti Password */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
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
                      className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                    >
                      <FaLock /> Ganti Password
                    </button>
                  ) : (
                    <form onSubmit={changePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input
                          type="password"
                          placeholder="Masukkan password lama"
                          value={password.current}
                          onChange={(e) => setPassword({ ...password, current: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input
                          type="password"
                          placeholder="Masukkan password baru"
                          value={password.baru}
                          onChange={(e) => setPassword({ ...password, baru: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          placeholder="Konfirmasi password baru"
                          value={password.konfirmasi}
                          onChange={(e) => setPassword({ ...password, konfirmasi: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                        >
                          Ubah Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPassword(false);
                            setPassword({ current: "", baru: "", konfirmasi: "" });
                          }}
                          className="border border-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}