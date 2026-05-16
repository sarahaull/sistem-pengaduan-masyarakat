"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaSignOutAlt,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaCamera,
  FaShieldAlt,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function SuperAdminProfilePage() {
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

  // Fetch profil super admin
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
        if (!res.ok) throw new Error(data.msg || "Gagal ambil profil");
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

  // Update profil
  const updateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/super-admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal update profil");
      setProfile((prev) => ({ ...prev, ...form }));
      setEditing(false);
      setMessage({ text: "Profil berhasil diupdate", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  // Ganti password
  const changePassword = async (e) => {
    e.preventDefault();
    if (password.baru !== password.konfirmasi) {
      return setMessage({ text: "Password baru tidak cocok", type: "error" });
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/super-admin/change-password`, {
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
        <SuperAdminSidebar handleLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <SuperAdminSidebar handleLogout={handleLogout} />

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl shadow-md">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <span>Profil <span className="text-red-600">Super Admin</span></span>
          </h1>
          <p className="text-gray-500 mt-1">Kelola informasi akun dan keamanan Anda</p>
        </div>

        {/* Notifikasi */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-l-4 border-green-500"
              : "bg-red-50 text-red-700 border-l-4 border-red-500"
          }`}>
            {message.type === "success" ? <FaCheckCircle className="text-lg" /> : <FaTimes className="text-lg" />}
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: "", type: "" })} className="ml-auto text-sm font-semibold">Tutup</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kartu Profil (kiri) */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FaUser /> Informasi Akun
              </h2>
            </div>
            <div className="p-6 text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-4 border-red-500 shadow-lg">
                {profile.foto ? (
                  <img src={`${BASE_URL}/uploads/${profile.foto}`} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FaUser className="text-5xl text-red-600" />
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">{profile.nama}</h3>
              <p className="text-gray-500">{profile.email}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                {profile.role === "super_admin" ? "Super Admin" : profile.role}
              </div>
            </div>
          </div>

          {/* Form Update Profil & Password (kanan) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profil */}
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaEdit className="text-red-500" /> Edit Profil
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
              <form onSubmit={updateProfile} className="p-6 space-y-4">
                <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 transition">
                  <FaUser className="text-red-400 mr-3" />
                  <input
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    disabled={!editing}
                    className="w-full outline-none bg-transparent disabled:bg-gray-50"
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 transition">
                  <FaEnvelope className="text-red-400 mr-3" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={!editing}
                    className="w-full outline-none bg-transparent disabled:bg-gray-50"
                    placeholder="Email"
                    type="email"
                  />
                </div>
                <div className="flex items-center border border-gray-200 rounded-xl p-3 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 transition">
                  <FaPhone className="text-red-400 mr-3" />
                  <input
                    value={form.no_telepon}
                    onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
                    disabled={!editing}
                    className="w-full outline-none bg-transparent disabled:bg-gray-50"
                    placeholder="Nomor Telepon"
                  />
                </div>
                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow transition">
                      <FaSave /> Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          nama: profile.nama,
                          email: profile.email,
                          no_telepon: profile.no_telepon,
                        });
                      }}
                      className="border border-gray-300 px-5 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Ganti Password */}
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaLock className="text-red-500" /> Keamanan Akun
                </h2>
              </div>
              <div className="p-6">
                {!showPassword ? (
                  <button
                    onClick={() => setShowPassword(true)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <FaLock /> Ganti Password
                  </button>
                ) : (
                  <form onSubmit={changePassword} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Password saat ini"
                      value={password.current}
                      onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password baru"
                      value={password.baru}
                      onChange={(e) => setPassword({ ...password, baru: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Konfirmasi password baru"
                      value={password.konfirmasi}
                      onChange={(e) => setPassword({ ...password, konfirmasi: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
                      required
                    />
                    <div className="flex gap-3">
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl shadow transition">
                        Simpan Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(false)}
                        className="border border-gray-300 px-5 py-2 rounded-xl hover:bg-gray-50 transition"
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