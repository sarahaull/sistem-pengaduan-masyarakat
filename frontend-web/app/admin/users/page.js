"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserShield,
  FaUser,
  FaUserCog,
  FaTimes,
  FaSave,
  FaUserCircle,
  FaEnvelope,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export default function KelolaUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // ================= AMBIL ROLE DARI TOKEN =================
  const getCurrentUserRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  };

  // ================= TOAST NOTIFIKASI =================
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ================= FETCH USER =================
  const fetchUsers = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data user");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUserRole(getCurrentUserRole());
    fetchUsers();
  }, []);

  // ================= FILTER USER =================
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= BUKA MODAL =================
  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "user" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
    setShowPassword(false);
  };

  // ================= HANDLE CHANGE INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validasi: hanya super_admin yang bisa tambah user baru
    if (!editingUser && currentUserRole !== "super_admin") {
      showToast("Hanya Super Admin yang dapat menambah user baru!", "error");
      setSubmitting(false);
      return;
    }

    // Validasi: jika bukan super_admin, tidak boleh mengubah role menjadi super_admin
    if (editingUser && currentUserRole !== "super_admin" && formData.role === "super_admin") {
      showToast("Anda tidak memiliki izin untuk menetapkan role Super Admin!", "error");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingUser
        ? `http://localhost:5000/api/admin/users/${editingUser.id}`
        : "http://localhost:5000/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      const body = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) body.password = formData.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal menyimpan user");

      await fetchUsers();
      closeModal();
      showToast(editingUser ? "User berhasil diperbarui" : "User baru berhasil ditambahkan", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= HAPUS USER =================
  const handleDelete = async (id, userRole) => {
    // Cegah admin biasa hapus super admin
    if (userRole === "super_admin" && currentUserRole !== "super_admin") {
      showToast("Anda tidak dapat menghapus Super Admin!", "error");
      return;
    }
    if (!confirm("Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Gagal menghapus user");
      await fetchUsers();
      showToast("User berhasil dihapus", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= BADGE ROLE =================
  const RoleBadge = ({ role }) => {
    const config = {
      super_admin: { icon: FaUserShield, label: "Super Admin", color: "bg-gradient-to-r from-purple-600 to-purple-700" },
      admin: { icon: FaUserCog, label: "Admin", color: "bg-gradient-to-r from-blue-600 to-blue-700" },
      user: { icon: FaUser, label: "User", color: "bg-gradient-to-r from-gray-600 to-gray-700" },
    };
    const { icon: Icon, label, color } = config[role] || config.user;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${color}`}>
        <Icon className="text-sm" /> {label}
      </span>
    );
  };

  // ================= SKELETON LOADING =================
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-red-600 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Memuat data user...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-right-5 transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <FaCheckCircle className="text-lg" /> : <FaExclamationTriangle className="text-lg" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex-1 p-6 lg:p-8 overflow-x-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-xl">
              <FaUserShield className="text-red-600 text-2xl" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              Kelola User
            </h1>
          </div>
          <p className="text-gray-500 ml-1">Kelola semua akun pengguna, ubah role, atau hapus akun dengan mudah</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500" />
              <p className="text-red-700">{error}</p>
              <button onClick={() => window.location.reload()} className="ml-auto text-red-600 underline hover:text-red-800">
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 text-black py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all outline-none"
            />
          </div>

          {currentUserRole === "super_admin" && (
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all transform hover:scale-105 font-medium"
            >
              <FaPlus /> Tambah User Baru
            </button>
          )}
          {currentUserRole !== "super_admin" && (
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
              <FaUserShield /> Hanya Super Admin yang dapat menambah user
            </div>
          )}
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaUserCircle className="text-gray-300 text-6xl" />
                        <p className="text-gray-400 font-medium">Tidak ada user ditemukan</p>
                        <p className="text-gray-400 text-sm">Coba ubah kata kunci pencarian</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">#{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-semibold shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400 text-xs" /> {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openModal(user)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit user"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.role)}
                            disabled={deletingId === user.id}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Hapus user"
                          >
                            {deletingId === user.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Menampilkan {filteredUsers.length} dari {users.length} user
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT USER */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  {editingUser ? <FaEdit className="text-red-600" /> : <FaPlus className="text-red-600" />}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{editingUser ? "Edit User" : "Tambah User Baru"}</h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && <span className="text-gray-400 text-xs">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={editingUser ? "Kosongkan jika tetap" : "Minimal 6 karakter"}
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={currentUserRole !== "super_admin"}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all outline-none ${
                    currentUserRole !== "super_admin" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="user">User (Akses terbatas)</option>
                  <option value="admin">Admin (Kelola konten)</option>
                  <option value="super_admin">Super Admin (Semua akses)</option>
                </select>
                {currentUserRole !== "super_admin" && (
                  <p className="text-xs text-gray-400 mt-1">Hanya Super Admin yang dapat mengubah role</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-70 font-medium"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}