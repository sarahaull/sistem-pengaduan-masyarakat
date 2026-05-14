"use client";

import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserShield,
  FaUserCog,
  FaUser,
  FaTimes,
  FaSave,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Backend response invalid"); }
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      const usersData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.users) ? data.users
        : [];
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalSuperAdmins = users.filter(u => u.role === "super_admin").length;
  const totalRegular = totalUsers - totalAdmins - totalSuperAdmins;

  // Filter
  const filteredUsers = users.filter(user => {
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchSearch = searchTerm === "" ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  // Modal handlers
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
    setModalOpen(true);
  };
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingUser ? `http://localhost:5000/api/admin/users/${editingUser.id}` : "http://localhost:5000/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const payload = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) payload.password = formData.password;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal simpan");
      await fetchUsers();
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal hapus");
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const roleBadge = (role) => {
    const config = {
      super_admin: { bg: "bg-purple-100", text: "text-purple-800", icon: <FaUserShield size={12} />, label: "Super Admin" },
      admin: { bg: "bg-blue-100", text: "text-blue-800", icon: <FaUserCog size={12} />, label: "Admin" },
      user: { bg: "bg-gray-100", text: "text-gray-800", icon: <FaUser size={12} />, label: "User" },
    };
    const c = config[role] || config.user;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} transition-all`}>
        {c.icon} {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
            👥 Manajemen Pengguna
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua akun, atur role, dan pantau aktivitas</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <FaPlus className="text-sm" /> Tambah User Baru
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 flex items-center gap-3 animate-slideIn">
          <FaExclamationTriangle className="text-red-500" />
          <span>{error}</span>
          <button onClick={fetchUsers} className="ml-auto text-sm font-medium underline">Coba lagi</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total User" value={totalUsers} icon={<FaUsers />} color="from-blue-500 to-blue-600" />
        <StatCard title="User Biasa" value={totalRegular} icon={<FaUser />} color="from-gray-500 to-gray-600" />
        <StatCard title="Admin" value={totalAdmins} icon={<FaUserCog />} color="from-blue-600 to-blue-700" />
        <StatCard title="Super Admin" value={totalSuperAdmins} icon={<FaUserShield />} color="from-purple-600 to-purple-700" />
      </div>

      {/* Filter & Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 justify-between items-center border border-gray-100">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-600 self-center">Filter Role:</span>
          {["all", "user", "admin", "super_admin"].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                roleFilter === role
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {role === "all" ? "Semua" : role === "super_admin" ? "Super Admin" : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl animate-fadeUp">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-red-800 to-red-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal Daftar</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada user yang ditemukan</td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-red-50 transition-colors duration-150 group animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{user.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">{roleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110" title="Edit">
                          <FaEdit size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} disabled={deletingId === user.id} className="text-red-600 hover:text-red-800 transition-transform hover:scale-110 disabled:opacity-50" title="Hapus">
                          {deletingId === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 border-t border-gray-100">
          Menampilkan {filteredUsers.length} dari {users.length} user
        </div>
      </div>

      {/* Modal dengan desain input yang lebih baik */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-scaleIn">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                {editingUser ? "✏️ Edit User" : "➕ Tambah User Baru"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password {editingUser && <span className="text-xs font-normal text-gray-400">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent transition bg-gray-50 hover:bg-white"
                  />
                </div>
                {editingUser && <p className="text-xs text-gray-400 mt-1">* Biarkan kosong jika password tetap sama</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role / Hak Akses</label>
                <div className="relative">
                  <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-transparent appearance-none bg-gray-50 hover:bg-white cursor-pointer"
                  >
                    <option value="user">👤 User (Warga biasa)</option>
                    <option value="admin">🛡️ Admin</option>
                    <option value="super_admin">⭐ Super Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all hover:scale-105">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-70">
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />}
                  {editingUser ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
        .animate-fadeUp {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8"></div>
      <div className="relative p-5 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-white/70 text-2xl">{icon}</div>
      </div>
    </div>
  );
}