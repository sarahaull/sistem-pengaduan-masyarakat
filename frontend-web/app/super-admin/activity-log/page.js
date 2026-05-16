// "use client";

// import { useEffect, useState } from "react";
// import {
//   FaSearch,
//   FaFilter,
//   FaFileExcel,
//   FaHistory,
//   FaUser,
//   FaClock,
//   FaExclamationTriangle,
// } from "react-icons/fa";
// import * as XLSX from "xlsx";

// export default function ActivityLogPage() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [actionFilter, setActionFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   const fetchLogs = async () => {
//   try {
//     setLoading(true);
//     setError("");

//     const token = localStorage.getItem("token");

//     const res = await fetch(
//       "http://localhost:5000/api/super-admin/activity-logs",
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//       }
//     );

//     const text = await res.text();
//     console.log("RAW RESPONSE:", text);

//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       throw new Error("Backend tidak mengirim JSON (cek server)");
//     }

//     if (!res.ok) {
//       throw new Error(data.message || "Gagal mengambil data log");
//     }

//     setLogs(Array.isArray(data) ? data : []);
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   const uniqueActions = [
//     "all",
//     ...new Set(logs.map((log) => log.action).filter(Boolean)),
//   ];

//   const filteredLogs = logs.filter((log) => {
//     const matchAction =
//       actionFilter === "all" || log.action === actionFilter;

//     const matchSearch =
//       search === "" ||
//       log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
//       log.action?.toLowerCase().includes(search.toLowerCase()) ||
//       log.details?.toLowerCase().includes(search.toLowerCase());

//     return matchAction && matchSearch;
//   });

//   const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

//   const paginatedLogs = filteredLogs.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const exportToExcel = () => {
//     const exportData = filteredLogs.map((log) => ({
//       ID: log.id,
//       "Nama User": log.user_name,
//       Aksi: log.action,
//       Detail: log.details,
//       "IP Address": log.ip_address || "-",
//       Waktu: log.timestamp
//         ? new Date(log.timestamp).toLocaleString("id-ID")
//         : "-",
//     }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Log Aktivitas");
//     XLSX.writeFile(
//       wb,
//       `log_aktivitas_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`
//     );
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return "-";
//     const date = new Date(timestamp);
//     return (
//       date.toLocaleDateString("id-ID") +
//       " " +
//       date.toLocaleTimeString("id-ID")
//     );
//   };

//   const actionBadge = (action) => {
//     let color = "bg-gray-100 text-gray-800";

//     if (action?.toLowerCase().includes("login"))
//       color = "bg-blue-100 text-blue-800";
//     else if (
//       action?.toLowerCase().includes("create") ||
//       action?.toLowerCase().includes("tambah")
//     )
//       color = "bg-emerald-100 text-emerald-800";
//     else if (
//       action?.toLowerCase().includes("update") ||
//       action?.toLowerCase().includes("edit")
//     )
//       color = "bg-amber-100 text-amber-800";
//     else if (
//       action?.toLowerCase().includes("delete") ||
//       action?.toLowerCase().includes("hapus")
//     )
//       color = "bg-red-100 text-red-800";

//     return (
//       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
//         {action || "-"}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <p>Memuat log aktivitas...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">

//       {/* ERROR */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
//           <FaExclamationTriangle /> {error}
//         </div>
//       )}

//       {/* FILTER */}
//       <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
//         <div className="flex items-center gap-3">
//           <FaFilter className="text-red-600" />
//           <select
//             value={actionFilter}
//             onChange={(e) => setActionFilter(e.target.value)}
//             className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//           >
//             {uniqueActions.map((action) => (
//               <option key={action} value={action}>
//                 {action === "all" ? "Semua Aksi" : action}
//               </option>
//             ))}
//           </select>
//         </div>

//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Cari user, aksi, atau detail..."
//           className="px-3 py-2 border rounded-lg w-64"
//         />
//       </div>

//       {/* TABLE */}
//       {filteredLogs.length === 0 ? (
//         <div className="bg-white p-8 text-center text-gray-400 rounded-xl">
//           Tidak ada log aktivitas yang ditemukan.
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-md overflow-hidden">
//           <table className="min-w-full">
//             <thead className="bg-[#7a2c2a] text-white">
//               <tr>
//                 <th className="px-6 py-3">User</th>
//                 <th className="px-6 py-3">Aksi</th>
//                 <th className="px-6 py-3">Detail</th>
//                 <th className="px-6 py-3">Waktu</th>
//               </tr>
//             </thead>

//             <tbody>
//               {paginatedLogs.map((log) => (
//                 <tr key={log.id} className="border-b hover:bg-red-50">
//                   <td className="px-6 py-3">
//                     <FaUser className="inline mr-2 text-gray-400" />
//                     {log.user_name || "System"}
//                   </td>
//                   <td className="px-6 py-3">{actionBadge(log.action)}</td>
//                   <td className="px-6 py-3">{log.details || "-"}</td>
//                   <td className="px-6 py-3 text-sm text-gray-500">
//                     <FaClock className="inline mr-1" />
//                     {formatDate(log.timestamp)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* PAGINATION */}
//           <div className="p-4 flex justify-between">
//             <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
//               Sebelumnya
//             </button>

//             <span>{currentPage} / {totalPages}</span>

//             <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
//               Selanjutnya
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }