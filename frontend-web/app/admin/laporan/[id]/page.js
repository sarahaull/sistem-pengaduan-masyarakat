"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/AdminSidebar";
import { 
  FaSearch, 
  FaFilter, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaClock,
  FaCommentDots,
  FaImage,
  FaUser,
  FaEnvelope
} from "react-icons/fa";

export default function AdminLaporanPage() {
  const router = useRouter();

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      setMsg("");
      const token = localStorage.getItem("token");
      if (!token) {
        setMsg("Token tidak ditemukan, silakan login ulang");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server tidak mengembalikan JSON");
      }

      if (!res.ok) throw new Error(data.msg || "Gagal mengambil data");
      const result = Array.isArray(data) ? data : data?.data ? data.data : [];
      setLaporan(result);
    } catch (err) {
      console.log(err);
      setMsg(err.message || "Gagal mengambil data laporan");
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");

    console.log("update id:", id, "status:", status);

    const res = await fetch(`http://localhost:5000/api/admin/laporan/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    console.log("response update:", data);

    if (!res.ok) throw new Error(data.msg || "Gagal update status");

    setMsg(`Status berhasil diubah ke ${status}`);
    fetchLaporan();
  } catch (err) {
    console.log("ERROR UPDATE:", err);
    setMsg(err.message || "Gagal update status");
  }
};

  const handleTanggapi = (id) => {
    if (!id) return;
    router.push(`/admin/chat/${id}`);
  };

  const filteredLaporan = laporan.filter((item) => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchSearch = searchTerm === "" || 
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_user?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const total = laporan.length;
  const pendingCount = laporan.filter(i => i.status === "pending").length;
  const diprosesCount = laporan.filter(i => i.status === "diproses").length;
  const selesaiCount = laporan.filter(i => i.status === "selesai").length;
  const ditolakCount = laporan.filter(i => i.status === "ditolak").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Kelola Laporan</h1>
          <p className="text-gray-400 text-sm mt-1">Tinjau dan tanggapi laporan masyarakat</p>
        </div>

        {/* Notifikasi sukses/error */}
        {msg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-700 text-red-800 px-4 py-2 rounded-md text-sm shadow-sm flex items-center gap-2">
            <FaCheckCircle size={14} className="text-red-700" />
            <span>{msg}</span>
          </div>
        )}

        {/* Statistik - Minimalis dengan garis bawah merah */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={total} icon={<FaClock />} color="red" />
          <StatCard label="Pending" value={pendingCount} icon={<FaClock />} color="amber" />
          <StatCard label="Diproses" value={diprosesCount} icon={<FaSpinner />} color="blue" />
          <StatCard label="Selesai" value={selesaiCount} icon={<FaCheckCircle />} color="green" />
          <StatCard label="Ditolak" value={ditolakCount} icon={<FaTimesCircle />} color="red" />
        </div>

        {/* Filter dan Pencarian */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 flex-wrap">
            <FaFilter className="text-gray-400 text-sm" />
            <span className="text-xs font-medium text-gray-500">FILTER STATUS</span>
            <div className="flex gap-1.5">
              {["all", "pending", "diproses", "selesai", "ditolak"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    statusFilter === s
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "all" ? "Semua" : s === "pending" ? "Pending" : s === "diproses" ? "Diproses" : s === "selesai" ? "Selesai" : "Ditolak"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
            />
          </div>
        </div>

        {/* Grid Laporan */}
        {filteredLaporan.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3 opacity-50">📭</div>
            <p className="text-gray-400 text-sm">Tidak ada laporan yang cocok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaporan.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200">
                {/* Gambar dengan rasio 16:9 */}
                <div className="relative h-40 bg-gray-100">
                  {item.foto ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.foto}`}
                      alt={item.judul}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/400x200?text=No+Image"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaImage size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusPill status={item.status} />
                  </div>
                </div>

                {/* Konten */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 text-base line-clamp-1">{item.judul || "Tanpa Judul"}</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.deskripsi || "Tidak ada deskripsi"}</p>
                  
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaUser size={10} />
                      <span>{item.nama_user || "Anonim"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEnvelope size={10} />
                      <span className="truncate max-w-[120px]">{item.email || "-"}</span>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="mt-4">
                    {(!item.status || item.status === "pending") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(item.id, "diproses")}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1"
                        >
                          <FaCheckCircle size={12} /> Terima
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "ditolak")}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1"
                        >
                          <FaTimesCircle size={12} /> Tolak
                        </button>
                      </div>
                    )}
                    {item.status === "diproses" && (
                      <button
                        onClick={() => handleTanggapi(item.id)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-2"
                      >
                        <FaCommentDots size={12} /> Tanggapi
                      </button>
                    )}
                    {(item.status === "selesai" || item.status === "ditolak") && (
                      <div className="w-full bg-gray-50 text-gray-400 py-1.5 rounded-md text-xs text-center flex items-center justify-center gap-1">
                        {item.status === "selesai" ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
                        {item.status === "selesai" ? "Selesai" : "Ditolak"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Komponen Status Pill (kalem)
function StatusPill({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border border-amber-100",
    diproses: "bg-blue-50 text-blue-600 border border-blue-100",
    selesai: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    ditolak: "bg-red-50 text-red-500 border border-red-100",
  };
  const labels = {
    pending: "Pending",
    diproses: "Diproses",
    selesai: "Selesai",
    ditolak: "Ditolak",
  };
  const s = styles[status] || styles.pending;
  const label = labels[status] || "Pending";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s}`}>
      {label}
    </span>
  );
}

// Komponen StatCard minimalis (hanya border-bottom merah)
function StatCard({ label, value, icon, color }) {
  const borderColor = {
    red: "border-red-200",
    amber: "border-amber-200",
    blue: "border-blue-200",
    green: "border-emerald-200",
  };
  const iconColor = {
    red: "text-red-500",
    amber: "text-amber-500",
    blue: "text-blue-500",
    green: "text-emerald-500",
  };
  return (
    <div className={`bg-white rounded-lg border ${borderColor[color]} p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-gray-700 mt-1">{value}</p>
        </div>
        <div className={`${iconColor[color]} text-lg opacity-70`}>{icon}</div>
      </div>
    </div>
  );
}