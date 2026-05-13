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
  FaTimes,
  FaClipboardList,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaExclamationTriangle,
  FaLock,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function AdminProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const [password, setPassword] = useState({
    current: "",
    baru: "",
    konfirmasi: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchStats();
  }, []);

  // Fetch data profil admin
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          nama: data.nama || "",
          email: data.email || "",
          no_telepon: data.no_telepon || "",
          foto: data.foto || null,
        });
        setForm({
          nama: data.nama || "",
          email: data.email || "",
          no_telepon: data.no_telepon || "",
        });
      } else {
        setMessage({ text: data.msg || "Gagal load profil", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistik laporan (untuk ditampilkan di dashboard admin)
  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const total = data.length;
        const pending = data.filter((l) => l.status === "pending").length;
        const diproses = data.filter((l) => l.status === "diproses").length;
        const selesai = data.filter((l) => l.status === "selesai").length;
        const ditolak = data.filter((l) => l.status === "ditolak").length;
        setStats({ total, pending, diproses, selesai, ditolak });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update profil
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/admin/profile`, {
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

  // Ganti password
  const changePassword = async (e) => {
    e.preventDefault();
    if (password.baru !== password.konfirmasi) {
      setMessage({ text: "Password baru tidak cocok", type: "error" });
      return;
    }
    if (password.baru.length < 6) {
      setMessage({ text: "Minimal 6 karakter", type: "error" });
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.baru,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Password berhasil diubah", type: "success" });
        setShowPassword(false);
        setPassword({ current: "", baru: "", konfirmasi: "" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: data.msg || "Gagal ganti password", type: "error" });
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
      const res = await fetch(`${BASE_URL}/api/admin/upload-foto`, {
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500">Memuat profil admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar handleLogout={handleLogout} />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Profil <span className="text-red-600">Admin</span>
          </h1>
          <p className="text-gray-400 mt-1">Kelola informasi akun administrator</p>
        </div>

        {/* Notifikasi */}
        {message.text && (
          <div
            className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "bg-red-50 text-red-600 border-l-4 border-red-500"
            }`}
          >
            {message.type === "success" ? <FaCheckCircle /> : <FaTimes />} {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Kiri: Avatar, Statistik, Logout */}
          <div className="space-y-6">
            {/* Card Avatar */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center">
              <div className="relative inline-block">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {profile.foto ? (
                    <img
                      src={`${BASE_URL}/uploads/${profile.foto}`}
                      className="w-full h-full object-cover"
                      alt="foto"
                    />
                  ) : (
                    <FaUser className="text-5xl text-red-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
                  <FaCamera size={12} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={uploadFoto}
                    disabled={uploading}
                  />
                </label>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">{profile.nama || "Admin"}</h2>
              <p className="text-gray-400 text-sm">{profile.email}</p>

              {/* Statistik ringkas */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-red-600">{stats.total}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">{stats.selesai}</p>
                    <p className="text-xs text-gray-400">Selesai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FaSignOutAlt /> Keluar Akun
            </button>
          </div>

          {/* Kanan: Edit Profil + Ganti Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Akun */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaUser className="text-red-500" /> Informasi Akun
                </h2>
                {!editing && (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setForm({
                        nama: profile.nama,
                        email: profile.email,
                        no_telepon: profile.no_telepon || "",
                      });
                    }}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                )}
              </div>
              <div className="p-6">
                {!editing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-gray-400 w-5" />
                      <span className="text-gray-700">{profile.nama}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gray-400 w-5" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-gray-400 w-5" />
                      <span className="text-gray-700">
                        {profile.no_telepon || "Belum diisi"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={updateProfile} className="space-y-4">
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                      placeholder="Nama"
                      required
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                      placeholder="Email"
                      required
                    />
                    <input
                      type="tel"
                      value={form.no_telepon}
                      onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                      placeholder="No. Telepon"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                      >
                        <FaSave /> Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Ganti Password */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b flex justify-between items-center">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaLock className="text-red-500" /> Keamanan
                </h2>
                {!showPassword && (
                  <button
                    onClick={() => setShowPassword(true)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Ganti Password
                  </button>
                )}
              </div>
              <div className="p-6">
                {!showPassword ? (
                  <p className="text-gray-400 text-center">••••••••</p>
                ) : (
                  <form onSubmit={changePassword} className="space-y-4">
                    <input
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Password saat ini"
                      required
                    />
                    <input
                      type="password"
                      value={password.baru}
                      onChange={(e) => setPassword({ ...password, baru: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Password baru (min. 6 karakter)"
                      required
                    />
                    <input
                      type="password"
                      value={password.konfirmasi}
                      onChange={(e) => setPassword({ ...password, konfirmasi: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Konfirmasi password baru"
                      required
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        Simpan Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(false)}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
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
  );
}