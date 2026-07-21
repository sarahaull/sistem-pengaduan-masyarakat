"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import {
  FaFilter,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaClipboardList,
  FaArrowRight,
  FaHome,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaCog,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye,
  FaTag,
  FaCamera,
  FaTimes,
  FaBell,
} from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editJudul, setEditJudul] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editKategori, setEditKategori] = useState("");
  const [editAlamat, setEditAlamat] = useState("");
  const [editFoto, setEditFoto] = useState(null);
  const [editFotoPreview, setEditFotoPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- Tambahkan Google Font untuk Snowburst One ---
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Snowburst+One&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      // optional: hapus jika tidak perlu, biarkan saja
    };
  }, []);

  // API functions (same as before)
  const fetchLaporan = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) setLaporan([...data]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn(`Notifikasi gagal: status ${res.status}`);
        setNotifications([]);
        return;
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          setNotifications([]);
        }
      } else {
        console.warn("Respons notifikasi bukan JSON");
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetch notifikasi:", err);
      setNotifications([]);
    }
  };

  const syncProfileFromAPI = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data) {
        const profileData = {
          id: data.id,
          nama: data.nama,
          email: data.email,
          role: data.role,
          foto: data.foto || null,
          no_telepon: data.no_telepon || "",
        };
        setUser(profileData);
        const oldUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...oldUser, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Sync profile error:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Gagal mark all read ke server:", err);
    }
  };

  const markAsRead = async (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    try {
      await fetch(`${BASE_URL}/api/notifications/${notifId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Gagal mark read ke server:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        try {
          const userData = JSON.parse(userRaw);
          if (userData.role === "admin" || userData.role === "super_admin") {
            router.push("/admin/dashboard");
            return;
          }
          setUser(userData);
        } catch (err) {}
      }
      await syncProfileFromAPI();
      await fetchLaporan();
      await fetchCategories();
      await fetchNotifications();
    };

    init();
  }, [token]);

  useEffect(() => {
    const handleFocus = () => {
      fetchLaporan();
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleSync = () => syncProfileFromAPI();
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus laporan ini?");
    if (!confirm) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_URL}/api/laporan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchLaporan();
        alert("Laporan berhasil dihapus.");
      } else {
        const error = await res.json();
        alert(`Gagal menghapus: ${error.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus laporan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditJudul(item.judul);
    setEditDeskripsi(item.deskripsi);
    setEditKategori(item.kategori_id ?? "");
    setEditAlamat(item.alamat || "");
    setEditFoto(null);
    setEditFotoPreview(item.foto ? `${BASE_URL}/uploads/${item.foto}` : null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditFotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setEditFoto(null);
    setEditFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateLaporan = async () => {
    if (!editJudul.trim() || !editDeskripsi.trim()) {
      alert("Judul dan deskripsi tidak boleh kosong");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("judul", editJudul);
      formData.append("deskripsi", editDeskripsi);
      formData.append("kategori_id", editKategori ? Number(editKategori) : null);
      formData.append("alamat", editAlamat);
      if (editFoto) formData.append("foto", editFoto);

      const res = await fetch(`${BASE_URL}/api/laporan/${editId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || "Gagal update");
      }
      await fetchLaporan();
      alert("Laporan berhasil diupdate");
      setIsEditModalOpen(false);
      setEditId(null);
      setEditJudul("");
      setEditDeskripsi("");
      setEditKategori("");
      setEditAlamat("");
      setEditFoto(null);
      setEditFotoPreview(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLaporan = laporan.filter((item) => {
    const statusMatch = filter === "all" || item.status === filter;
    const searchMatch =
      searchTerm === "" ||
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const totalPending = laporan.filter((i) => i.status === "pending").length;
  const totalDiproses = laporan.filter((i) => i.status === "diproses").length;
  const totalSelesai = laporan.filter((i) => i.status === "selesai").length;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <FaClock className="text-amber-500" size={12} />,
          label: "Menunggu",
        };
      case "diproses":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <FaSpinner className="text-blue-500 animate-spin" size={12} />,
          label: "Diproses",
        };
      case "selesai":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FaCheckCircle className="text-emerald-500" size={12} />,
          label: "Selesai",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: null,
          label: status,
        };
    }
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith("http")) return foto;
    return `${BASE_URL}/uploads/${foto}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-rose-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
          <p className="mt-6 text-red-800 font-semibold text-lg">Memuat dashboard...</p>
          <p className="text-red-600/70 text-sm">Tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header notifikasi & profil (sama seperti sebelumnya) */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                if (!notifOpen) markAllAsRead();
                setNotifOpen(!notifOpen);
              }}
              className="relative p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <FaBell className="text-red-600 text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden z-50 animate-fadeInUp">
                <div className="p-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaBell className="text-red-500" /> Notifikasi
                  </h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Tidak ada notifikasi</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 border-b border-red-50 hover:bg-red-50 transition cursor-pointer ${!notif.is_read ? "bg-red-50/30" : ""}`}
                      >
                        <p className="text-sm text-gray-700">{notif.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full pl-1.5 pr-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 shadow-md group-hover:border-red-600 transition-colors">
                {user?.foto ? (
                  <img
                    src={getFotoUrl(user.foto)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=User"; }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                    {user?.nama?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <span className="text-gray-800 font-semibold hidden sm:inline group-hover:text-red-700 transition-colors">
                {user?.nama?.split(" ")[0] || "User"}
              </span>
              <FaUserCircle className="text-red-500 text-lg hidden sm:inline group-hover:text-red-700 transition-colors" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden z-50 animate-fadeInUp">
                <div className="p-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-rose-50">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-400 shadow-md">
                      {user?.foto ? (
                        <img src={getFotoUrl(user.foto)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">
                          {user?.nama?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{user?.nama}</p>
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-0.5">
                        <FaEnvelope className="text-xs text-red-500" /> {user?.email || "email@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={() => router.push("/profile-user")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                    <FaUser className="text-red-500 group-hover:text-red-600 text-sm" />
                    <span className="group-hover:text-red-700 font-medium">Profil Saya</span>
                  </button>
                  <button onClick={() => router.push("/settings")} className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                    <FaCog className="text-red-500 group-hover:text-red-600 text-sm" />
                    <span className="group-hover:text-red-700 font-medium">Pengaturan</span>
                  </button>
                  <div className="border-t border-red-100 my-2"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-semibold">
                    <FaSignOutAlt className="text-red-500" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section dengan font khusus pada sapaan */}
        <div className="relative bg-gradient-to-br from-red-800 via-red-700 to-rose-700 rounded-3xl shadow-2xl p-8 md:p-10 mb-10 text-white overflow-hidden transition-all duration-500 animate-fadeIn group">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-white/15 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-200/80 text-sm font-medium mb-1">
                <FaHome className="text-red-300" />
                <span>Dashboard / Laporan Saya</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="inline-block">Hai, </span>
                <span className="inline-block font-snowburst" style={{ fontFamily: "'Snowburst One', 'Santa', cursive" }}>
                  {user?.nama}
                </span>
                <span className="inline-block ml-2 animate-wave">👋</span>
              </h1>
              <p className="text-red-100 text-lg md:text-xl max-w-2xl mt-2 leading-relaxed">
                Selamat datang di portal pengaduan masyarakat.
                <span className="block text-red-200/90 text-base mt-1">Kelola dan pantau laporan Anda dengan mudah.</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-6 pt-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <FaClipboardList className="text-red-300" />
                  <span className="text-sm font-medium">Total Laporan: {laporan.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <FaClock className="text-amber-300" />
                  <span className="text-sm font-medium">Menunggu: {totalPending}</span>
                </div>
              </div>
            </div>
            <button onClick={() => router.push("/add-laporan")} className="group/btn relative bg-white/90 backdrop-blur-sm text-red-700 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 px-7 py-3.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-white/30">
              <FaPlus className="transition-transform group-hover/btn:rotate-90 duration-300" />
              Buat Laporan Baru
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-8 text-red-800/20" preserveAspectRatio="none" viewBox="0 0 1440 54" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 22L120 16.7C240 11.3 480 0.7 720 0.7C960 0.7 1200 11.3 1320 16.7L1440 22L1440 54L1320 54C1200 54 960 54 720 54C480 54 240 54 120 54L0 54Z" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
        </div>

        {/* Stat Cards (sama) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard title="Total Laporan" value={laporan.length} icon={<FaClipboardList className="text-2xl" />} gradient="bg-gradient-to-br from-red-500 to-red-700" delay="0" />
          <StatCard title="Menunggu" value={totalPending} icon={<FaClock className="text-2xl" />} gradient="bg-gradient-to-br from-amber-400 to-amber-600" delay="0.1" />
          <StatCard title="Diproses" value={totalDiproses} icon={<FaSpinner className="text-2xl animate-spin-slow" />} gradient="bg-gradient-to-br from-blue-400 to-blue-600" delay="0.2" />
          <StatCard title="Selesai" value={totalSelesai} icon={<FaCheckCircle className="text-2xl" />} gradient="bg-gradient-to-br from-emerald-400 to-emerald-600" delay="0.3" />
        </div>

        {/* Filter & Search (sama) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-5 mb-8 animate-fadeInUp delay-200 hover:shadow-red-100/20 transition-shadow duration-300">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-red-100 rounded-full"><FaFilter className="text-red-600 text-sm" /></div>
              <span className="text-sm font-semibold text-gray-700">Filter Status:</span>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Semua", icon: null },
                  { value: "pending", label: "Menunggu", icon: <FaClock size={10} className="mr-1" /> },
                  { value: "diproses", label: "Diproses", icon: <FaSpinner size={10} className="mr-1 animate-spin" /> },
                  { value: "selesai", label: "Selesai", icon: <FaCheckCircle size={10} className="mr-1" /> },
                ].map((status) => (
                  <button key={status.value} onClick={() => setFilter(status.value)} className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${filter === status.value ? "bg-red-600 text-white shadow-md scale-105 ring-2 ring-red-300 ring-offset-1" : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 hover:scale-105"}`}>
                    {status.icon}{status.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <input type="text" placeholder="Cari judul atau deskripsi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-9 py-2.5 text-sm rounded-xl border border-red-200 bg-white/80 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-red-300" />
              <svg className="absolute left-3.5 top-3 text-red-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition"><FaTimes size={14} /></button>}
            </div>
          </div>
        </div>

        {/* Daftar Laporan dengan border yang lebih tegas */}
        <div className="animate-fadeInUp delay-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaChartLine className="text-red-600" /> Semua Laporan</h2>
            <p className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">Menampilkan {filteredLaporan.length} dari {laporan.length} laporan</p>
          </div>

          {filteredLaporan.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-xl border border-red-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">Belum ada laporan yang ditemukan.</p>
              <button onClick={() => router.push("/add-laporan")} className="mt-6 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-md">Buat Laporan Sekarang</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredLaporan.map((item, idx) => {
                const canEditDelete = item.status === "pending";
                const statusStyle = getStatusStyle(item.status);
                const fotoUrl = item.foto ? `${BASE_URL}/uploads/${item.foto}` : null;

                return (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 border-red-300 hover:border-red-500 animate-fadeInUp"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="relative w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {fotoUrl ? (
                        <img src={fotoUrl} alt={item.judul} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Gambar+Tidak+Tersedia"; }} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <svg className="w-14 h-14 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs">Tidak ada gambar</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {statusStyle.icon}{statusStyle.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full">
                          <FaCalendarAlt size={10} />
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1 group-hover:text-red-700 transition-colors">{item.judul}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                      {item.alamat && (
                        <div className="flex items-start gap-2 text-xs text-gray-700 bg-red-50/50 p-2 rounded-xl mb-3 border border-red-100">
                          <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" size={12} />
                          <div><span className="font-semibold text-gray-800">Alamat:</span> <span className="line-clamp-1">{item.alamat}</span></div>
                        </div>
                      )}
                      {item.kategori && (
                        <div className="flex items-center gap-2 text-xs text-gray-700 mb-3">
                          <FaTag className="text-red-500" size={11} />
                          <span className="font-semibold text-gray-800">Kategori:</span> <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">{item.kategori}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-100">
                        <div className="flex gap-2">
                          {canEditDelete ? (
                            <>
                              <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm" title="Edit laporan"><FaEdit size={14} /></button>
                              <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-sm" title="Hapus laporan">
                                {deletingId === item.id ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <FaTrash size={14} />}
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-gray-500 italic flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>Tidak dapat diubah</div>
                          )}
                        </div>
                        <button onClick={() => router.push(`/dashboard/detail-laporan/${item.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-700 hover:text-white hover:bg-red-600 text-sm font-semibold rounded-xl transition-all duration-200 border border-red-200 hover:border-red-600">
                          <FaEye size={13} /> Detail <FaArrowRight size={11} className="group-hover/detail:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit (sama) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
              <div><h3 className="text-white text-xl font-bold">Edit Laporan</h3><p className="text-red-100 text-sm">Perbarui informasi laporan Anda</p></div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white transition"><FaTimes size={20} /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-5">
                <label className="block text-gray-800 text-sm font-bold mb-2">Foto Laporan</label>
                <div className="flex flex-col items-center gap-3">
                  {editFotoPreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-red-300 shadow-md group/foto">
                      <img src={editFotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={removeFoto} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition shadow-md"><FaTimes size={10} /></button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-red-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-red-200">
                      <FaCamera className="text-2xl mb-1 text-red-400" /><span className="text-xs text-red-500">Tidak ada foto</span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-600 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition" />
                </div>
              </div>
              <div className="mb-4"><label className="block text-gray-800 text-sm font-bold mb-2">Judul</label><input type="text" value={editJudul} onChange={(e) => setEditJudul(e.target.value)} className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition" placeholder="Masukkan judul laporan" /></div>
              <div className="mb-4"><label className="block text-gray-800 text-sm font-bold mb-2">Deskripsi</label><textarea value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} rows={4} className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none" placeholder="Masukkan deskripsi laporan" /></div>
              <div className="mb-4"><label className="block text-gray-800 text-sm font-bold mb-2">Kategori</label><select value={editKategori} onChange={(e) => setEditKategori(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white"><option value="">Pilih Kategori</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nama}</option>))}</select></div>
              <div className="mb-6"><label className="block text-gray-800 text-sm font-bold mb-2">Alamat</label><textarea value={editAlamat} onChange={(e) => setEditAlamat(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none" placeholder="Masukkan alamat lengkap" /></div>
              <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold">Batal</button>
                <button onClick={handleUpdateLaporan} disabled={isUpdating} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md">
                  {isUpdating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}{isUpdating ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-slow { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes wave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-10deg); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        .animate-pulse-slow { animation: pulse-slow 6s infinite; }
        .animate-spin-slow { animation: spin-slow 2s linear infinite; }
        .animate-wave { animation: wave 1.5s ease-in-out infinite; display: inline-block; transform-origin: 70% 70%; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, delay }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp group cursor-pointer`} style={{ animationDelay: `${delay}s` }}>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-5 flex items-center justify-between z-10">
        <div><p className="text-white/80 text-xs uppercase tracking-wider font-semibold">{title}</p><p className="text-3xl md:text-4xl font-bold mt-1 tracking-tight">{value}</p></div>
        <div className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300">{icon}</div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
}