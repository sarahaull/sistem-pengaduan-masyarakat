"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import { fetchWithAuth } from "../../../lib/api";
import {
  FaUsers,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserShield,
  FaUserCog,
  FaUser,
  FaChartLine,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalLaporan: 0,
    totalPending: 0,
    totalDiproses: 0,
    totalSelesai: 0,
  });
  const [recentLaporan, setRecentLaporan] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState("");

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(userRaw);
      const role = (user.role || "").toLowerCase().replace(" ", "_");
      if (role !== "super_admin") {
        router.replace("/dashboard");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [statsData, laporanData, usersData] = await Promise.all([
          fetchWithAuth("/api/super-admin/stats", token),
          fetchWithAuth("/api/super-admin/recent-laporan", token),
          fetchWithAuth("/api/super-admin/recent-users", token),
        ]);
        setStats(statsData || stats);
        const laporan = laporanData?.data || (Array.isArray(laporanData) ? laporanData : []);
        const users = usersData?.data || (Array.isArray(usersData) ? usersData : []);
        setRecentLaporan(laporan);
        setRecentUsers(users);
      } catch (err) {
        console.error(err);
        setError("Gagal connect ke backend");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-800",
      diproses: "bg-blue-100 text-blue-800",
      selesai: "bg-emerald-100 text-emerald-800",
    };
    const labels = {
      pending: "Menunggu",
      diproses: "Diproses",
      selesai: "Selesai",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const roleBadge = (role) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      user: "bg-gray-100 text-gray-800",
    };
    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      user: "User",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role] || "bg-gray-100"}`}>
        {labels[role] || role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SuperAdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SuperAdminSidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-x-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
            🛡️ Dashboard Super Admin
          </h1>
          <p className="text-gray-500 mt-1">Pantau keseluruhan sistem pengaduan masyarakat</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total User" value={stats.totalUsers} icon={<FaUsers />} color="from-blue-600 to-blue-700" />
          <StatCard title="Total Laporan" value={stats.totalLaporan} icon={<FaClipboardList />} color="from-red-600 to-red-700" />
          <StatCard title="Menunggu" value={stats.totalPending} icon={<FaClock />} color="from-amber-500 to-amber-600" />
          <StatCard title="Selesai" value={stats.totalSelesai} icon={<FaCheckCircle />} color="from-emerald-500 to-emerald-600" />
        </div>

        {/* Komposisi User & Status Laporan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield className="text-purple-600" /> Komposisi User
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-gray-700"><FaUser className="text-gray-600" /> User Biasa</span>
                <span className="font-bold">{stats.totalUsers - stats.totalAdmins - stats.totalSuperAdmins}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-gray-700"><FaUserCog className="text-blue-600" /> Admin</span>
                <span className="font-bold">{stats.totalAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-700"><FaUserShield className="text-purple-600" /> Super Admin</span>
                <span className="font-bold">{stats.totalSuperAdmins}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-red-600" /> Status Laporan
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-amber-700"><FaClock className="text-amber-500" /> Pending</span>
                <span className="font-bold">{stats.totalPending}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-blue-700"><FaSpinner className="text-blue-500" /> Diproses</span>
                <span className="font-bold">{stats.totalDiproses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-emerald-800"><FaCheckCircle className="text-emerald-500" /> Selesai</span>
                <span className="font-bold">{stats.totalSelesai}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Laporan Terbaru */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-3">
            <h2 className="font-bold text-white flex items-center gap-2">📋 Laporan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Judul</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Pelapor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentLaporan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada laporan</td>
                  </tr>
                ) : (
                  recentLaporan.map((l) => (
                    <tr key={l.id} className="hover:bg-red-50 transition duration-150">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{l.judul}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{l.user?.name || "-"}</td>
                      <td className="px-4 py-2.5">{statusBadge(l.status)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        {new Date(l.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 text-right bg-gray-50">
            <button
              onClick={() => router.push("/super-admin/laporan")}
              className="text-red-600 text-sm font-medium hover:underline inline-flex items-center gap-1"
            >
              Lihat semua <FaArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Tabel User Terbaru */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-3">
            <h2 className="font-bold text-white flex items-center gap-2">👥 User Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada user</td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-red-50 transition duration-150">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-2.5">{roleBadge(u.role)}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 text-right bg-gray-50">
            <button
              onClick={() => router.push("/super-admin/users")}
              className="text-red-600 text-sm font-medium hover:underline inline-flex items-center gap-1"
            >
              Kelola user <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
      <div className="relative p-6 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-extrabold mt-2">{value}</p>
        </div>
        <div className="text-white/70 text-2xl">{icon}</div>
      </div>
    </div>
  );
}