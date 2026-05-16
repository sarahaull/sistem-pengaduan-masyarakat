"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuperAdminSidebar from "@/app/components/superAdminsidebar";
import {
  FaUsers,
  FaClipboardList,
  FaComments,
  FaExclamationTriangle,
  FaSpinner,
  FaChartLine,
  FaDownload,
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartBar,
  FaUser,
  FaUserCog,
  FaCrown,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import * as XLSX from "xlsx";

export default function StatistikPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLaporan: 0,
    totalKomentar: 0,
    laporanPerStatus: {
      pending: 0,
      diproses: 0,
      selesai: 0,
      ditolak: 0,
    },
    laporanPerBulan: [],
    userRoleDistribution: {
      user: 0,
      admin: 0,
      super_admin: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStats(token);
  }, []);

  const safeFetch = async (url, token) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (text.trim().startsWith("<")) {
      throw new Error(`Endpoint error: ${url} mengembalikan HTML`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON dari ${url}: ${e.message}`);
    }
  };

 const fetchStats = async (token) => {
  setLoading(true);
  setError("");
  try {
    const API = "http://localhost:5000/api";

    // 1. Ambil users & laporan
    const [usersData, laporanData] = await Promise.all([
      safeFetch(`${API}/super-admin/users`, token),
      safeFetch(`${API}/super-admin/laporan`, token),
    ]);

    // 2. Ambil komentar dari endpoint /admin/comments (yang berfungsi)
    let komentarArray = [];
    try {
      const komentarRes = await fetch(`${API}/admin/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawText = await komentarRes.text();

      if (komentarRes.ok && !rawText.trim().startsWith("<")) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed)) {
          komentarArray = parsed;
        } else if (parsed?.data && Array.isArray(parsed.data)) {
          komentarArray = parsed.data;
        } else if (parsed?.comments && Array.isArray(parsed.comments)) {
          komentarArray = parsed.comments;
        } else {
          const firstArray = Object.values(parsed).find(v => Array.isArray(v));
          if (firstArray) komentarArray = firstArray;
        }
      }
    } catch (err) {
      console.error("Gagal fetch komentar:", err);
    }

    // Normalisasi users & laporan
    const users = Array.isArray(usersData) ? usersData : usersData?.users || usersData?.data || [];
    const laporan = Array.isArray(laporanData) ? laporanData : laporanData?.laporan || laporanData?.data || [];

    // Status laporan
    const laporanPerStatus = {
      pending: laporan.filter(l => l.status === "pending").length,
      diproses: laporan.filter(l => l.status === "diproses").length,
      selesai: laporan.filter(l => l.status === "selesai").length,
      ditolak: laporan.filter(l => l.status === "ditolak").length,
    };

    // Tren 6 bulan
    const bulanMap = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bulan = d.toLocaleString("id-ID", { month: "long", year: "numeric" });
      bulanMap.set(bulan, 0);
    }
    laporan.forEach(l => {
      const dateStr = l.created_at || l.tanggal || l.updated_at;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const bulan = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
          if (bulanMap.has(bulan)) bulanMap.set(bulan, bulanMap.get(bulan) + 1);
        }
      }
    });
    const laporanPerBulan = Array.from(bulanMap.entries()).map(([name, value]) => ({ name, value }));

    // Role distribution
    const userRoleDistribution = {
      user: users.filter(u => u.role === "user").length,
      admin: users.filter(u => u.role === "admin").length,
      super_admin: users.filter(u => u.role === "super_admin").length,
    };

    setStats({
      totalUsers: users.length,
      totalLaporan: laporan.length,
      totalKomentar: komentarArray.length,
      laporanPerStatus,
      laporanPerBulan,
      userRoleDistribution,
    });
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const exportToExcel = () => {
    const summary = [
      { Metrik: "Total User", Nilai: stats.totalUsers },
      { Metrik: "Total Laporan", Nilai: stats.totalLaporan },
      { Metrik: "Total Komentar", Nilai: stats.totalKomentar },
      { Metrik: "Pending", Nilai: stats.laporanPerStatus.pending },
      { Metrik: "Diproses", Nilai: stats.laporanPerStatus.diproses },
      { Metrik: "Selesai", Nilai: stats.laporanPerStatus.selesai },
      { Metrik: "Ditolak", Nilai: stats.laporanPerStatus.ditolak },
      { Metrik: "Role User", Nilai: stats.userRoleDistribution.user },
      { Metrik: "Role Admin", Nilai: stats.userRoleDistribution.admin },
      { Metrik: "Role Super Admin", Nilai: stats.userRoleDistribution.super_admin },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Ringkasan");
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(stats.laporanPerBulan),
      "Tren Bulanan"
    );
    XLSX.writeFile(wb, `statistik_${new Date().toISOString().slice(0, 19)}.xlsx`);
  };

  const statusChartData = [
    { name: "Pending", value: stats.laporanPerStatus.pending, color: "#f97316" },
    { name: "Diproses", value: stats.laporanPerStatus.diproses, color: "#3b82f6" },
    { name: "Selesai", value: stats.laporanPerStatus.selesai, color: "#10b981" },
    { name: "Ditolak", value: stats.laporanPerStatus.ditolak, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const roleChartData = [
    { name: "User", value: stats.userRoleDistribution.user, color: "#ec4899" },
    { name: "Admin", value: stats.userRoleDistribution.admin, color: "#8b5cf6" },
    {
      name: "Super Admin",
      value: stats.userRoleDistribution.super_admin,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-medium">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SuperAdminSidebar handleLogout={handleLogout} />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-xl shadow-md">
                  <FaChartLine className="text-white text-2xl" />
                </div>
                <span>
                  Statistik <span className="text-red-600">Sistem</span>
                </span>
              </h1>
              <p className="text-gray-500 mt-1 ml-1">
                Data realtime pengaduan masyarakat
              </p>
            </div>
            <button
              onClick={exportToExcel}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition transform hover:scale-105"
            >
              <FaDownload /> Export ke Excel
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded-r-xl flex items-center gap-3 shadow">
              <FaExclamationTriangle className="text-red-600" />
              <span>{error}</span>
              <button
                onClick={() => fetchStats(localStorage.getItem("token"))}
                className="ml-auto text-sm font-semibold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Kartu statistik utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCardRed
              title="Total User"
              value={stats.totalUsers}
              icon={<FaUsers />}
              gradient="from-red-600 to-red-700"
              iconBg="bg-red-500"
            />
            <StatCardRed
              title="Total Laporan"
              value={stats.totalLaporan}
              icon={<FaClipboardList />}
              gradient="from-rose-600 to-rose-700"
              iconBg="bg-rose-500"
            />
            <StatCardRed
              title="Total Komentar"
              value={stats.totalKomentar}
              icon={<FaComments />}
              gradient="from-pink-600 to-pink-700"
              iconBg="bg-pink-500"
            />
          </div>

          {/* Baris chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-red-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-100">
                <FaChartBar className="text-red-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Status Laporan
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={statusChartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#4b5563" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#fecaca",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [`${value} laporan`, "Jumlah"]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#dc2626"
                    radius={[8, 8, 0, 0]}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-5 border border-red-100">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-100">
                <FaUserShield className="text-red-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Distribusi Role User
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {roleChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} user`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tren bulanan */}
          <div className="bg-white rounded-2xl shadow-xl p-5 border border-red-100 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-100">
              <FaChartLine className="text-red-500 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">
                Tren Laporan 6 Bulan Terakhir
              </h2>
            </div>
            {stats.laporanPerBulan.length > 0 &&
            stats.laporanPerBulan.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={stats.laporanPerBulan}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, angle: -20, textAnchor: "end" }}
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#fecaca",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [`${value} laporan`, "Jumlah"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                <div className="text-center">
                  <FaExclamationTriangle className="mx-auto text-3xl mb-2 text-red-300" />
                  <p>Belum ada data laporan dengan tanggal yang valid</p>
                </div>
              </div>
            )}
          </div>

          {/* Detail Data Sistem */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaClipboardList className="text-red-500" /> Detail Data Sistem
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Ringkasan lengkap seluruh metrik sistem
              </p>
            </div>
            <div className="p-6">
              {/* Grid ringkasan utama */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DetailCard
                  icon={<FaUsers className="text-red-600" />}
                  label="Total User"
                  value={stats.totalUsers}
                  bg="bg-red-50"
                />
                <DetailCard
                  icon={<FaClipboardList className="text-rose-600" />}
                  label="Total Laporan"
                  value={stats.totalLaporan}
                  bg="bg-rose-50"
                />
                <DetailCard
                  icon={<FaComments className="text-pink-600" />}
                  label="Total Komentar"
                  value={stats.totalKomentar}
                  bg="bg-pink-50"
                />
              </div>

              {/* Status Laporan progress bar */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaClock className="text-orange-500" /> Status Laporan
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Pending",
                      value: stats.laporanPerStatus.pending,
                      color: "bg-orange-500",
                      icon: <FaClock />,
                    },
                    {
                      label: "Diproses",
                      value: stats.laporanPerStatus.diproses,
                      color: "bg-blue-500",
                      icon: <FaSpinner />,
                    },
                    {
                      label: "Selesai",
                      value: stats.laporanPerStatus.selesai,
                      color: "bg-green-500",
                      icon: <FaCheckCircle />,
                    },
                    {
                      label: "Ditolak",
                      value: stats.laporanPerStatus.ditolak,
                      color: "bg-red-500",
                      icon: <FaTimesCircle />,
                    },
                  ].map((item, idx) => {
                    const max = Math.max(
                      ...Object.values(stats.laporanPerStatus),
                      1
                    );
                    const percent = (item.value / max) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 text-gray-500">{item.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-gray-600">{item.value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`${item.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Role User grid */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaUserShield className="text-purple-500" /> Distribusi Role
                  User
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <RoleBadge
                    icon={<FaUser />}
                    label="User"
                    value={stats.userRoleDistribution.user}
                    color="bg-pink-100 text-pink-700 border-pink-200"
                  />
                  <RoleBadge
                    icon={<FaUserCog />}
                    label="Admin"
                    value={stats.userRoleDistribution.admin}
                    color="bg-purple-100 text-purple-700 border-purple-200"
                  />
                  <RoleBadge
                    icon={<FaCrown />}
                    label="Super Admin"
                    value={stats.userRoleDistribution.super_admin}
                    color="bg-amber-100 text-amber-700 border-amber-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardRed({ title, value, icon, gradient, iconBg }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-white`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm uppercase tracking-wider">
            {title}
          </p>
          <h2 className="text-4xl font-bold mt-2">{value}</h2>
        </div>
        <div className={`${iconBg} p-3 rounded-full shadow-md text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value, bg }) {
  return (
    <div
      className={`${bg} rounded-xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function RoleBadge({ icon, label, value, color }) {
  return (
    <div
      className={`${color} rounded-xl p-3 flex items-center gap-3 border shadow-sm`}
    >
      <div className="text-xl">{icon}</div>
      <div>
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}