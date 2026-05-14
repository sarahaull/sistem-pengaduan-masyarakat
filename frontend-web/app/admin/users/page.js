"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/AdminSidebar";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaUser, FaUserCog, FaTimes, FaSave } from "react-icons/fa";

export default function KelolaUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        if (text.includes("<!DOCTYPE")) {
          throw new Error("Sesi habis atau server error. Silakan login ulang.");
        }
        throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
      else throw new Error("Data bukan array");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (user) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: "", role: user.role });
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
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const url = editingUser ? `http://localhost:5000/api/admin/users/${editingUser.id}` : "http://localhost:5000/api/admin/users";
    const method = editingUser ? "PUT" : "POST";
    const body = { name: formData.name, email: formData.email, role: formData.role };
    if (formData.password) body.password = formData.password;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchUsers();
        closeModal();
      } else {
        const errorText = await res.text();
        alert(errorText.substring(0, 200));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus user ini?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchUsers();
      else alert("Gagal hapus user");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  };

  const roleBadge = (role) => {
    if (role === "super_admin") return "bg-purple-100 text-purple-800";
    if (role === "admin") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const roleIcon = (role) => {
    if (role === "super_admin") return <FaUserShield className="text-purple-600" />;
    if (role === "admin") return <FaUserCog className="text-blue-600" />;
    return <FaUser className="text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">👥 Kelola User</h1>
          <p className="text-gray-500 mt-1">Tambah, edit, atau hapus akun user & admin</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl border border-red-200">
            ⚠️ {error} <button onClick={() => window.location.href = "/login"} className="ml-2 underline">Login ulang</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-300" />
          </div>
          <button onClick={() => openModal()} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 shadow-md">
            <FaPlus /> Tambah User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Tidak ada user</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${roleBadge(user.role)}`}>
                          {roleIcon(user.role)} {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 mr-3"><FaEdit /></button>
                        <button onClick={() => handleDelete(user.id)} disabled={deletingId === user.id} className="text-red-600 hover:text-red-800 disabled:opacity-50">
                          {deletingId === user.id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <FaTrash />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex justify-between p-5 border-b">
              <h2 className="text-xl font-bold">{editingUser ? "Edit User" : "Tambah User"}</h2>
              <button onClick={closeModal}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <input type="text" name="name" placeholder="Nama" value={formData.name} onChange={handleChange} required className="w-full border rounded-xl px-4 py-2" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border rounded-xl px-4 py-2" />
              <input type="password" name="password" placeholder={editingUser ? "Password (kosongkan jika tidak diubah)" : "Password"} value={formData.password} onChange={handleChange} required={!editingUser} className="w-full border rounded-xl px-4 py-2" />
              <select name="role" value={formData.role} onChange={handleChange} className="w-full border rounded-xl px-4 py-2">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-xl">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-red-600 text-white rounded-xl flex items-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}