"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  CartesianGrid, AreaChart, Area
} from "recharts";
import { 
  FaClipboardList, 
  FaClock, 
  FaSpinner, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaTrashAlt,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaRegCalendarAlt
} from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [kategoriData, setKategoriData] = useState([]);
  const [trenData, setTrenData] = useState([]);
  const [selectedChart, setSelectedChart] = useState("status"); // status, kategori, tren

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin" && parsedUser.role !== "super_admin") {
      router.push("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchLaporan(token);
  }, []);

  const fetchLaporan = async (token) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLaporan(data);
      processChartData(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus laporan ini? Tidak bisa dibatalkan.")) return;
    const token = localStorage.getItem("token");
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/laporan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal hapus");
      const updated = laporan.filter((item) => item.id !== id);
      setLaporan(updated);
      processChartData(updated);
      alert("Laporan dihapus.");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const processChartData = (data) => {
    const statusCount = { pending: 0, diproses: 0, selesai: 0, ditolak: 0 };
    data.forEach((item) => statusCount[item.status]++);
    setStatusData([
      { name: "Pending", value: statusCount.pending, color: "#EAB308" },
      { name: "Diproses", value: statusCount.diproses, color: "#3B82F6" },
      { name: "Selesai", value: statusCount.selesai, color: "#10B981" },
      { name: "Ditolak", value: statusCount.ditolak, color: "#EF4444" },
    ]);

    const kategoriMap = new Map();
    data.forEach((item) => {
      const kat = item.kategori || "Lainnya";
      kategoriMap.set(kat, (kategoriMap.get(kat) || 0) + 1);
    });
    setKategoriData(Array.from(kategoriMap, ([name, value]) => ({ name, value })));

    const sample = data[0];
    let dateField = sample?.created_at ? "created_at" : sample?.tanggal ? "tanggal" : null;
    if (dateField) {
      const bulanMap = new Map();
      data.forEach((item) => {
        const date = new Date(item[dateField]);
        if (!isNaN(date.getTime())) {
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          bulanMap.set(monthYear, (bulanMap.get(monthYear) || 0) + 1);
        }
      });
      const sorted = Array.from(bulanMap.keys()).sort();
      setTrenData(sorted.map((m) => ({ bulan: m, jumlah: bulanMap.get(m) })));
    } else {
      setTrenData([]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Statistik utama
  const total = laporan.length;
  const pending = laporan.filter((i) => i.status === "pending").length;
  const diproses = laporan.filter((i) => i.status === "diproses").length;
  const selesai = laporan.filter((i) => i.status === "selesai").length;
  const ditolak = laporan.filter((i) => i.status === "ditolak").length;

  // Persentase perubahan (fiktif, bisa diganti dengan perbandingan bulan lalu)
  // Untuk demo, kita buat random tapi terlihat hidup
  const getTrend = (current, prev) => {
    if (prev === 0) return "+100%";
    const diff = ((current - prev) / prev) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };
  // Asumsi data bulan lalu (dummy)
  const prevTotal = total * 0.85;
  const prevPending = pending * 1.2;
  const prevDiproses = diproses * 0.9;
  const prevSelesai = selesai * 0.95;
  const prevDitolak = ditolak * 1.1;

  const laporanMasuk = laporan.filter((i) => i.status === "pending" || i.status === "diproses");
  const riwayatLaporan = laporan.filter((i) => i.status === "selesai" || i.status === "ditolak");

  // Warna untuk pie
  const COLORS = ["#EAB308", "#3B82F6", "#10B981", "#EF4444"];

  // Stat Card Komponen
  const StatCard = ({ title, value, icon, color, bgGradient, trend, trendUp }) => (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm uppercase tracking-wider">{title}</p>
          <h2 className="text-4xl font-bold text-white mt-2">{value}</h2>
          <div className={`flex items-center gap-1 mt-3 text-sm ${trendUp ? 'text-green-200' : 'text-red-200'}`}>
            {trendUp ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
            <span>{trend}</span>
            <span className="text-white/50 text-xs ml-1">dari bulan lalu</span>
          </div>
        </div>
        <div className={`text-4xl text-white/80`}>{icon}</div>
      </div>
    </div>
  );

  // Tabel yang lebih modern
  const LaporanTable = ({ data, title, icon, emptyMessage, onDelete, isDeletingId }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
      <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-white border-b border-gray-100 flex items-center gap-3">
        <div className="text-red-500 text-xl">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-400 text-sm">{data.length} laporan</p>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-400">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="text-left p-4 font-semibold">Judul</th>
                <th className="text-left p-4 font-semibold">Pelapor</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Kategori</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-red-50/40 transition duration-150">
                  <td className="p-4 font-medium text-gray-800">{item.judul}</td>
                  <td className="p-4 text-gray-600">{item.nama_user}</td>
                  <td className="p-4 text-gray-500 text-sm">{item.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{item.kategori}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "pending" ? "bg-amber-100 text-amber-700" :
                      item.status === "diproses" ? "bg-blue-100 text-blue-700" :
                      item.status === "selesai" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "pending" ? "Pending" : item.status === "diproses" ? "Diproses" : item.status === "selesai" ? "Selesai" : "Ditolak"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/laporan/${item.id}`} className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm">
                        <FaEye size={14} /> Detail
                      </Link>
                      <button
                        onClick={() => onDelete(item.id)}
                        disabled={isDeletingId === item.id}
                        className={`flex items-center gap-1 text-sm ${isDeletingId === item.id ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"}`}
                      >
                        <FaTrashAlt size={14} /> {isDeletingId === item.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar handleLogout={handleLogout} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header Modern */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">
              Dashboard <span className="text-red-600">Admin</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Selamat datang, <span className="font-semibold text-red-700">{user?.nama}</span> · Anda memiliki akses penuh
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm text-gray-500 text-sm">
            <FaRegCalendarAlt />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stat Cards dengan gradien merah, kuning, biru, hijau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          <StatCard title="Total Laporan" value={total} icon={<FaClipboardList />} bgGradient="from-red-700 to-red-800" trend={getTrend(total, prevTotal)} trendUp={total > prevTotal} />
          <StatCard title="Pending" value={pending} icon={<FaClock />} bgGradient="from-amber-500 to-amber-600" trend={getTrend(pending, prevPending)} trendUp={pending > prevPending} />
          <StatCard title="Diproses" value={diproses} icon={<FaSpinner />} bgGradient="from-blue-500 to-blue-600" trend={getTrend(diproses, prevDiproses)} trendUp={diproses > prevDiproses} />
          <StatCard title="Selesai" value={selesai} icon={<FaCheckCircle />} bgGradient="from-green-500 to-green-600" trend={getTrend(selesai, prevSelesai)} trendUp={selesai > prevSelesai} />
          <StatCard title="Ditolak" value={ditolak} icon={<FaTimesCircle />} bgGradient="from-red-500 to-red-600" trend={getTrend(ditolak, prevDitolak)} trendUp={ditolak > prevDitolak} />
        </div>

        {/* Bagian Chart dengan tab switching (lebih modern) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-red-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-800">Analisis & Statistik</h2>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
              {["status", "kategori", "tren"].map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedChart(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedChart === key ? "bg-red-600 text-white shadow-md" : "text-gray-500 hover:bg-red-50"
                  }`}
                >
                  {key === "status" ? "Status" : key === "kategori" ? "Kategori" : "Tren Bulanan"}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            {selectedChart === "status" && (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={110} fill="#8884d8" dataKey="value">
                    {statusData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} laporan`, "Jumlah"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "kategori" && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={kategoriData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#fef2f2' }} />
                  <Bar dataKey="value" fill="#DC2626" radius={[8,8,0,0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "tren" && trenData.length > 0 && (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trenData}>
                  <defs>
                    <linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="jumlah" stroke="#DC2626" fillOpacity={1} fill="url(#colorJumlah)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "tren" && trenData.length === 0 && (
              <div className="h-80 flex items-center justify-center text-gray-400">Data tanggal tidak tersedia untuk tren</div>
            )}
          </div>
        </div>

        {/* Tabel Laporan Masuk */}
        <LaporanTable
          data={laporanMasuk}
          title="Laporan Masuk"
          icon={<FaClock />}
          emptyMessage="✅ Semua laporan sudah diproses. Tidak ada laporan masuk."
          onDelete={handleDelete}
          isDeletingId={deletingId}
        />

        {/* Tabel Riwayat */}
        <LaporanTable
          data={riwayatLaporan}
          title="Riwayat Laporan"
          icon={<FaCheckCircle />}
          emptyMessage="📭 Belum ada laporan selesai atau ditolak."
          onDelete={handleDelete}
          isDeletingId={deletingId}
        />
      </main>
    </div>
  );
}