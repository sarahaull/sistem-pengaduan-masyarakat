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

    console.log("STATS RAW:", statsData);
console.log("LAPORAN RAW:", laporanData);
console.log("USERS RAW:", usersData);

    // ✅ Pastikan semua field statistik memiliki nilai numerik (default 0)
   const data = statsData?.data || statsData?.stats || statsData || {};

const safeStats = {
  totalUsers: data.totalUsers ?? 0,
  totalAdmins: data.totalAdmins ?? 0,
  totalSuperAdmins: data.totalSuperAdmins ?? 0,
  totalLaporan: data.totalLaporan ?? 0,
  totalPending: data.totalPending ?? 0,
  totalDiproses: data.totalDiproses ?? 0,
  totalSelesai: data.totalSelesai ?? 0,
};
    setStats(safeStats);

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
                <span className="font-bold text-black">{stats.totalUsers - stats.totalAdmins - stats.totalSuperAdmins}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-gray-700"><FaUserCog className="text-blue-600" /> Admin</span>
                <span className="font-bold text-black">{stats.totalAdmins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-700"><FaUserShield className="text-purple-600" /> Super Admin</span>
                <span className="font-bold text-black">{stats.totalSuperAdmins}</span>
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
                <span className="font-bold text-black">{stats.totalPending}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center gap-2 text-blue-700"><FaSpinner className="text-blue-500" /> Diproses</span>
                <span className="font-bold text-black">{stats.totalDiproses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-emerald-800"><FaCheckCircle className="text-emerald-500" /> Selesai</span>
                <span className="font-bold text-black">{stats.totalSelesai}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Laporan Terbaru */}
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden mb-8">
  
  {/* HEADER */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              📋 Laporan Terbaru
            </h2>
            <p className="text-red-100 text-sm mt-1">
              Data laporan terbaru dari masyarakat
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold">
            {recentLaporan.length} Laporan
          </div>
        </div>

  {/* TABLE */}
  <div className="overflow-x-auto">
    <table className="min-w-full">
      
      {/* HEAD */}
      <thead className="bg-red-50 border-b border-red-100">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Judul
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Pelapor
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Status
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Tanggal
          </th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody className="divide-y divide-red-50">
        {recentLaporan.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">
                  Belum ada laporan
                </p>
              </div>
            </td>
          </tr>
        ) : (
          recentLaporan.map((l) => (
            <tr
              key={l.id}
              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-white transition-all duration-300"
            >
              
              {/* JUDUL */}
              <td className="px-6 py-5">
                <div className="font-semibold text-gray-800 text-sm">
                  {l.judul}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  ID Laporan #{l.id}
                </div>
              </td>

              {/* PELAPOR */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold shadow-md">
                    {(l.user?.name || l.nama_user || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {l.user?.name || l.nama_user || "Unknown"}
                    </p>

                    <p className="text-xs text-gray-400">
                      Pelapor
                    </p>
                  </div>

                </div>
              </td>

              {/* STATUS */}
              <td className="px-6 py-5">
                {statusBadge(l.status)}
              </td>

              {/* TANGGAL */}
              <td className="px-6 py-5">
                <div className="inline-flex flex-col bg-gradient-to-br from-red-50 to-white px-4 py-3 rounded-2xl border border-red-100 shadow-sm">
                  
                  <span className="text-sm font-bold text-gray-800">
                    {new Date(l.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    🕒
                    {new Date(l.created_at).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>

                </div>
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* FOOTER */}
  <div className="px-6 py-4 border-t border-red-100 bg-gradient-to-r from-red-50 to-white flex justify-between items-center">
    
    <p className="text-sm text-gray-500">
      Menampilkan laporan terbaru
    </p>

    <button
      onClick={() => router.push("/super-admin/laporan")}
      className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
    >
      Lihat Semua
      <FaArrowRight size={12} />
    </button>

  </div>
</div>

        {/* Tabel User Terbaru */}
       <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
  
  {/* HEADER */}
  <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 px-6 py-4 flex items-center justify-between">
    
    <div>
      <h2 className="font-bold text-white text-xl flex items-center gap-2">
        👥 User Terbaru
      </h2>

      <p className="text-red-100 text-sm mt-1">
        Data user terbaru yang terdaftar
      </p>
    </div>

    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold">
      {recentUsers.length} User
    </div>

  </div>

  {/* TABLE */}
  <div className="overflow-x-auto">
    <table className="min-w-full">

      {/* HEAD */}
      <thead className="bg-red-50 border-b border-red-100">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Nama
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Email
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Role
          </th>

          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-red-700">
            Tanggal
          </th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody className="divide-y divide-red-50">
        {recentUsers.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-3">👤</div>

                <p className="text-gray-500 font-medium">
                  Belum ada user
                </p>
              </div>
            </td>
          </tr>
        ) : (
          recentUsers.map((u) => (
            <tr
              key={u.id || u._id}
              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-white transition-all duration-300"
            >

              {/* NAMA */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold shadow-md">
                    {(u.name || "U").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {u.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      ID User #{u.id}
                    </p>
                  </div>

                </div>
              </td>

              {/* EMAIL */}
              <td className="px-6 py-5">
                <div className="text-sm font-medium text-gray-700">
                  {u.email}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  Email pengguna
                </div>
              </td>

              {/* ROLE */}
              <td className="px-6 py-5">
                {roleBadge(u.role)}
              </td>

              {/* TANGGAL */}
              <td className="px-6 py-5">
                <div className="inline-flex flex-col bg-gradient-to-br from-red-50 to-white px-4 py-3 rounded-2xl border border-red-100 shadow-sm">

                  <span className="text-sm font-bold text-gray-800">
                    {new Date(u.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    🕒
                    {new Date(u.created_at).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>

                </div>
              </td>

            </tr>
          ))
        )}
      </tbody>

    </table>
  </div>

  {/* FOOTER */}
  <div className="px-6 py-4 border-t border-red-100 bg-gradient-to-r from-red-50 to-white flex justify-between items-center">

    <p className="text-sm text-gray-500">
      Menampilkan user terbaru
    </p>

    <button
      onClick={() => router.push("/super-admin/users")}
      className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
    >
      Kelola User
      <FaArrowRight size={12} />
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