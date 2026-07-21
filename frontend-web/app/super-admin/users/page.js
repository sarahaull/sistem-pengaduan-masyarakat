"use client";

import { useEffect, useState } from "react";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";

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

  // FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/super-admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Backend tidak mengirim JSON");
      }

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data");
      }

      const usersData = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
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

  // STATS
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalSuperAdmins = users.filter(
    (u) => u.role === "super_admin"
  ).length;
  const totalRegular =
    totalUsers - totalAdmins - totalSuperAdmins;

  // FILTER
  const filteredUsers = users.filter((user) => {
    const matchRole =
      roleFilter === "all" || user.role === roleFilter;

    const matchSearch =
      searchTerm === "" ||
      user.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchRole && matchSearch;
  });

  // OPEN ADD
  const openAddModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });

    setModalOpen(true);
  };

  // OPEN EDIT
  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
    });

    setModalOpen(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const url = editingUser
        ? `http://localhost:5000/api/super-admin/users/${editingUser.id}`
        : "http://localhost:5000/api/super-admin/users";

      const method = editingUser ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Response backend bukan JSON");
      }

      if (!res.ok) {
        throw new Error(data.message || "Gagal simpan");
      }

      await fetchUsers();

      closeModal();

      alert(
        editingUser
          ? "User berhasil diupdate"
          : "User berhasil ditambahkan"
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/super-admin/user/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Response backend bukan JSON");
      }

      if (!res.ok) {
        throw new Error(data.message || "Gagal hapus");
      }

      await fetchUsers();

      alert("User berhasil dihapus");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ROLE BADGE
  const roleBadge = (role) => {
    const config = {
      super_admin: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: <FaUserShield size={12} />,
        label: "Super Admin",
      },
      admin: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <FaUserCog size={12} />,
        label: "Admin",
      },
      user: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: <FaUser size={12} />,
        label: "User",
      },
    };

    const c = config[role] || config.user;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
      >
        {c.icon}
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex">
        <SuperAdminSidebar />

        <div className="flex-1 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>

            <p className="mt-4 text-gray-600">
              Memuat data pengguna...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* SIDEBAR */}
      <SuperAdminSidebar />

      {/* CONTENT */}
      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#7a2c2a] flex items-center gap-2">
              <FaUsers className="text-red-600" />
              Manajemen Pengguna
            </h1>

            <p className="text-gray-500 mt-1">
              Kelola semua akun pengguna sistem
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-[#a33c33] to-[#6e241f] hover:from-[#b84c43] hover:to-[#7e2c25] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300"
          >
            <FaPlus />
            Tambah User
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total User"
            value={totalUsers}
            icon={<FaUsers />}
            color="from-red-600 to-red-800"
          />

          <StatCard
            title="User Reguler"
            value={totalRegular}
            icon={<FaUser />}
            color="from-gray-600 to-gray-800"
          />

          <StatCard
            title="Admin"
            value={totalAdmins}
            icon={<FaUserCog />}
            color="from-indigo-600 to-indigo-800"
          />

          <StatCard
            title="Super Admin"
            value={totalSuperAdmins}
            icon={<FaUserShield />}
            color="from-purple-600 to-purple-800"
          />
        </div>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {["all", "user", "admin", "super_admin"].map(
              (role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    roleFilter === role
                      ? "bg-[#a33c33] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {role === "all"
                    ? "Semua"
                    : role === "super_admin"
                    ? "Super Admin"
                    : role.charAt(0).toUpperCase() +
                      role.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10 pr-4 py-2 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-[#a33c33] focus:outline-none w-64"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#7a2c2a] to-[#5e1914] text-white">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Nama</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-500"
                    >
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className=" hover:bg-gray-50 transition text-black"
                    >
                      <td className="p-4 font-mono text-sm">
                        {idx + 1}
                      </td>

                      <td className="p-4 font-medium text-gray-800">
                        {user.name}
                      </td>

                      <td className="p-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="p-4">
                        {roleBadge(user.role)}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() =>
                              openEditModal(user)
                            }
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <FaEdit size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(user.id)
                            }
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            {deletingId === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
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
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              {/* HEADER */}
              <div className="bg-gradient-to-r from-[#7a2c2a] to-[#5e1914] px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingUser
                    ? "Edit User"
                    : "Tambah User Baru"}
                </h2>

                <button
                  onClick={closeModal}
                  className="text-white"
                >
                  <FaTimes />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
                />

                <input
                  type="password"
                  name="password"
                  placeholder={
                    editingUser
                      ? "Kosongkan jika tidak diubah"
                      : "Password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
                />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">
                    Super Admin
                  </option>
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 border border-gray-300 rounded-xl text-black"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#a33c33] to-[#6e241f] text-white px-5 py-2 rounded-xl flex items-center gap-2"
                  >
                    <FaSave />

                    {submitting
                      ? "Menyimpan..."
                      : editingUser
                      ? "Update"
                      : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STYLE */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}

// STAT CARD
function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`bg-gradient-to-r ${color} rounded-2xl p-5 text-white shadow-lg hover:scale-105 transition duration-300`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">{title}</p>

          <h2 className="text-3xl font-bold mt-1">
            {value}
          </h2>
        </div>

        <div className="text-3xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}